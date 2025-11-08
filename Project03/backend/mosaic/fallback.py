from __future__ import annotations

from dataclasses import dataclass

import numpy as np
from PIL import Image
import torch
import torch.nn.functional as F
from skimage import color

from .image_utils import ensure_divisible, tensor_to_pil, image_from_patch_colors

try:
    from torchvision.transforms import functional as TF  # type: ignore
    _tv_rgb_to_lab = getattr(TF, "rgb_to_lab", None)
    _tv_lab_to_rgb = getattr(TF, "lab_to_rgb", None)
except Exception:  # noqa: BLE001
    TF = None  # type: ignore
    _tv_rgb_to_lab = None
    _tv_lab_to_rgb = None


def _rgb_to_lab(tensor: torch.Tensor) -> torch.Tensor:
    if _tv_rgb_to_lab is not None:
        return _tv_rgb_to_lab(tensor)
    rgb_np = tensor.detach().cpu().permute(0, 2, 3, 1).numpy().astype(np.float64)
    lab_np = color.rgb2lab(rgb_np)
    lab = torch.from_numpy(lab_np).permute(0, 3, 1, 2).to(tensor.device, tensor.dtype)
    return lab


def _lab_to_rgb(tensor: torch.Tensor) -> torch.Tensor:
    if _tv_lab_to_rgb is not None:
        return _tv_lab_to_rgb(tensor)
    lab_np = tensor.detach().cpu().permute(0, 2, 3, 1).numpy().astype(np.float64)
    rgb_np = color.lab2rgb(lab_np)
    rgb = torch.from_numpy(rgb_np).permute(0, 3, 1, 2).to(tensor.device, tensor.dtype)
    return rgb


@dataclass
class FallbackParams:
    cell_size: int = 32
    palette_size: int = 16
    apply_dither: bool = True


def generate_color_mosaic(image: torch.Tensor, params: FallbackParams) -> Image.Image:
    """Generate a palette-quantized fallback mosaic."""
    cropped, (h_crop, w_crop) = ensure_divisible(image, params.cell_size)
    batch = cropped.unsqueeze(0)
    lab = _rgb_to_lab(batch)
    patches = F.unfold(lab, kernel_size=params.cell_size, stride=params.cell_size)
    patches = patches.transpose(1, 2)
    num_patches = patches.size(1)
    patches = patches.reshape(num_patches, 3, params.cell_size, params.cell_size)
    lab_means = patches.mean(dim=(2, 3))
    rgb_means = _lab_to_rgb(lab_means.view(num_patches, 3, 1, 1)).view(num_patches, 3)

    grid_rows = h_crop // params.cell_size
    grid_cols = w_crop // params.cell_size
    mosaic_tensor = image_from_patch_colors(rgb_means, (grid_rows, grid_cols), params.cell_size)
    mosaic_image = tensor_to_pil(mosaic_tensor)

    if params.palette_size:
        dither_flag = Image.FLOYDSTEINBERG if params.apply_dither else Image.NONE
        mosaic_image = mosaic_image.quantize(colors=params.palette_size, method=Image.MEDIANCUT, dither=dither_flag)
        mosaic_image = mosaic_image.convert("RGB")

    return mosaic_image
