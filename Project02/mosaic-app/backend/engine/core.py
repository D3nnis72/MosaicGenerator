from __future__ import annotations

from dataclasses import dataclass, asdict
import math
from typing import Any, Dict, Optional, Tuple, Literal

import torch
import torch.nn.functional as F

from .palette import quantize_palette

Policy = Literal["crop_to_multiple", "pad_reflect_to_multiple"]


@dataclass
class MosaicParams:
    mode: Literal["rgb", "grayscale"] = "rgb"
    rows: Optional[int] = None
    cols: Optional[int] = None
    tile_px: Optional[int] = None
    kernel: Optional[Tuple[int, int]] = None
    stride: Optional[Tuple[int, int]] = None
    padding: int = 0
    palette_k: int = 0
    policy: Policy = "crop_to_multiple"
    device: str = "cpu"


@dataclass
class MosaicMeta:
    input_hw: Tuple[int, int]
    processed_hw: Tuple[int, int]
    rows: int
    cols: int
    tile_size: Tuple[int, int]
    mode: str
    palette_k: int
    policy: Policy
    adjustments: Dict[str, Any]


@dataclass
class MosaicResult:
    meta: MosaicMeta
    grid: torch.Tensor
    mosaic: torch.Tensor

    def to_dict(self) -> Dict[str, Any]:
        return {
            "meta": asdict(self.meta),
            "grid_shape": list(self.grid.shape),
            "mosaic_shape": list(self.mosaic.shape),
        }


def _validate_params(params: MosaicParams) -> None:
    has_tile_px = params.tile_px is not None
    has_rows_cols = params.rows is not None and params.cols is not None

    if has_tile_px == has_rows_cols:
        raise ValueError("Specify either tile_px or rows+cols (but not both).")

    if params.rows is not None and params.rows <= 0:
        raise ValueError("rows must be positive")
    if params.cols is not None and params.cols <= 0:
        raise ValueError("cols must be positive")
    if params.tile_px is not None and params.tile_px <= 0:
        raise ValueError("tile_px must be positive")

    if params.policy not in {"crop_to_multiple", "pad_reflect_to_multiple"}:
        raise ValueError("Unknown policy")


def _resolve_tiling(params: MosaicParams, height: int, width: int) -> Tuple[int, int, int, int]:
    if params.tile_px is not None:
        tile_h = tile_w = params.tile_px
        rows = math.ceil(height / tile_h)
        cols = math.ceil(width / tile_w)
    else:
        assert params.rows and params.cols
        rows, cols = params.rows, params.cols
        tile_h = math.ceil(height / rows)
        tile_w = math.ceil(width / cols)

    return rows, cols, tile_h, tile_w


def _apply_policy(
    tensor: torch.Tensor,
    tile_h: int,
    tile_w: int,
    policy: Policy,
) -> Tuple[torch.Tensor, Dict[str, Any]]:
    _, _, height, width = tensor.shape

    if policy == "crop_to_multiple":
        new_h = (height // tile_h) * tile_h
        new_w = (width // tile_w) * tile_w
        if new_h <= 0 or new_w <= 0:
            raise ValueError("Tile size larger than image when cropping.")
        cropped = tensor[..., :new_h, :new_w]
        return cropped, {
            "cropped_bottom_px": height - new_h,
            "cropped_right_px": width - new_w,
        }

    # pad_reflect_to_multiple
    new_h = math.ceil(height / tile_h) * tile_h
    new_w = math.ceil(width / tile_w) * tile_w
    pad_bottom = new_h - height
    pad_right = new_w - width
    padded = F.pad(
        tensor,
        (0, pad_right, 0, pad_bottom),
        mode="reflect",
    )
    return padded, {
        "padded_bottom_px": pad_bottom,
        "padded_right_px": pad_right,
    }


def _build_conv(channels: int, kernel: Tuple[int, int], stride: Tuple[int, int], padding: int, device: torch.device) -> torch.nn.Conv2d:
    conv = torch.nn.Conv2d(
        in_channels=channels,
        out_channels=channels,
        kernel_size=kernel,
        stride=stride,
        padding=padding,
        groups=channels,
        bias=False,
    ).to(device)

    with torch.no_grad():
        weight = torch.full((channels, 1, kernel[0], kernel[1]), 1.0 / (kernel[0] * kernel[1]), device=device)
        conv.weight.copy_(weight)
    conv.requires_grad_(False)
    conv.eval()
    return conv


def make_mosaic(image: torch.Tensor, params: MosaicParams) -> MosaicResult:
    _validate_params(params)

    if image.dim() == 3:
        image = image.unsqueeze(0)
    if image.dim() != 4:
        raise ValueError("image tensor must be [C,H,W] or [1,C,H,W]")

    if image.size(0) != 1:
        raise ValueError("Batch dimension must be 1 for mosaic generation")

    device = torch.device(params.device)
    tensor = image.to(device)

    _, channels, height, width = tensor.shape

    rows, cols, tile_h, tile_w = _resolve_tiling(params, height, width)

    tensor, adjustments = _apply_policy(tensor, tile_h, tile_w, params.policy)
    _, _, proc_h, proc_w = tensor.shape

    if params.tile_px is not None:
        rows = proc_h // tile_h
        cols = proc_w // tile_w
    else:
        tile_h = proc_h // rows
        tile_w = proc_w // cols

    kernel = params.kernel or (tile_h, tile_w)
    stride = params.stride or kernel

    conv = _build_conv(channels, kernel, stride, params.padding, device)
    grid = conv(tensor)

    grid_squeezed = grid.squeeze(0)
    flat = grid_squeezed.permute(1, 2, 0).reshape(-1, channels)

    if params.palette_k > 0:
        quantised = quantize_palette(flat, params.palette_k)
        grid_quantised = quantised.view(grid_squeezed.shape[1], grid_squeezed.shape[2], channels).permute(2, 0, 1).unsqueeze(0)
    else:
        grid_quantised = grid

    scale_h = proc_h // grid_quantised.shape[-2]
    scale_w = proc_w // grid_quantised.shape[-1]
    mosaic = F.interpolate(grid_quantised, scale_factor=(scale_h, scale_w), mode="nearest")

    meta = MosaicMeta(
        input_hw=(height, width),
        processed_hw=(proc_h, proc_w),
        rows=grid_quantised.shape[-2],
        cols=grid_quantised.shape[-1],
        tile_size=(tile_h, tile_w),
        mode=params.mode,
        palette_k=params.palette_k,
        policy=params.policy,
        adjustments=adjustments,
    )

    return MosaicResult(meta=meta, grid=grid_quantised.cpu(), mosaic=mosaic.cpu())

