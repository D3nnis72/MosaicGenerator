from __future__ import annotations

import random
import time
from dataclasses import dataclass, field
from typing import Dict, Iterable, List, Optional, Sequence, Tuple

from PIL import Image
import torch
import torch.nn.functional as F

from .fallback import FallbackParams, generate_color_mosaic
from .features import SUPPORTED_METHODS, FeatureMethod, compute_features
from .image_utils import (
    ensure_divisible,
    get_device,
    pil_to_tensor,
    resize_image_tensor,
    tensor_to_pil,
)


@dataclass
class MosaicParameters:
    cell_size: int = 40
    feature_method: FeatureMethod = "lab"
    output_tile_size: int = 64
    blend_factor: float = 0.15
    top_k: int = 1
    reuse_limit: int = 0
    palette_size: int = 16
    apply_dither: bool = True
    seed: int = 42
    prefer_gpu: bool = True

    def __post_init__(self) -> None:
        if self.cell_size <= 0:
            raise ValueError("cell_size must be positive")
        if self.output_tile_size <= 0:
            raise ValueError("output_tile_size must be positive")
        if self.feature_method not in SUPPORTED_METHODS:
            raise ValueError(f"Unsupported feature method: {self.feature_method}")
        if not (0.0 <= self.blend_factor <= 1.0):
            raise ValueError("blend_factor must be in [0, 1]")
        if self.top_k < 1:
            raise ValueError("top_k must be >= 1")
        if self.reuse_limit < 0:
            raise ValueError("reuse_limit must be >= 0")


@dataclass
class MosaicResult:
    image: Image.Image
    metadata: Dict[str, object]


class MosaicEngine:
    def __init__(self, params: MosaicParameters) -> None:
        self.params = params
        self.device = get_device(params.prefer_gpu)
        self.generator = torch.Generator(device="cpu").manual_seed(params.seed)

    def generate(
        self,
        target_image: Image.Image,
        tile_images: Sequence[Image.Image] | None,
    ) -> MosaicResult:
        start_time = time.perf_counter()
        tile_images = tile_images or []
        params = self.params

        target_rgb = pil_to_tensor(target_image, device=self.device).tensor
        cropped, (h, w) = ensure_divisible(target_rgb, params.cell_size)
        grid_rows = h // params.cell_size
        grid_cols = w // params.cell_size
        patches = self._extract_patches(cropped, params.cell_size)
        num_patches = patches.size(0)

        metadata: Dict[str, object] = {
            "grid_rows": grid_rows,
            "grid_cols": grid_cols,
            "cell_size": params.cell_size,
            "feature_method": params.feature_method,
            "device": str(self.device),
        }

        if tile_images:
            mosaic_tensor, usage = self._build_tile_mosaic(
                target_patches=patches,
                tile_images=tile_images,
                grid_rows=grid_rows,
                grid_cols=grid_cols,
            )
            metadata.update(
                {
                    "tiles_available": len(tile_images),
                    "tiles_used": int(num_patches),
                    "blend_factor": params.blend_factor,
                    "top_k": params.top_k,
                    "reuse_limit": params.reuse_limit,
                    "tile_usage": usage,
                    "unique_tiles_used": len(usage),
                }
            )
            fallback_used = False
        else:
            fallback_used = True
            fallback_image = generate_color_mosaic(
                cropped,
                FallbackParams(
                    cell_size=params.cell_size,
                    palette_size=params.palette_size,
                    apply_dither=params.apply_dither,
                ),
            )
            metadata.update(
                {
                    "tiles_available": 0,
                    "fallback": "color_palette",
                    "palette_size": params.palette_size,
                    "dither": params.apply_dither,
                }
            )
            duration = time.perf_counter() - start_time
            metadata["runtime_s"] = duration
            return MosaicResult(image=fallback_image, metadata=metadata)

        if params.output_tile_size != params.cell_size:
            scale = params.output_tile_size / params.cell_size
            out_h = int(h * scale)
            out_w = int(w * scale)
            mosaic_tensor = F.interpolate(
                mosaic_tensor.unsqueeze(0),
                size=(out_h, out_w),
                mode="nearest",
            ).squeeze(0)

        image = tensor_to_pil(mosaic_tensor)
        metadata["fallback"] = None if not fallback_used else "color_palette"
        metadata["runtime_s"] = time.perf_counter() - start_time
        return MosaicResult(image=image, metadata=metadata)

    def _extract_patches(self, image: torch.Tensor, cell_size: int) -> torch.Tensor:
        batch = image.unsqueeze(0)
        patches = F.unfold(batch, kernel_size=cell_size, stride=cell_size)
        patches = patches.transpose(1, 2)
        num_patches = patches.size(1)
        patches = patches.reshape(num_patches, 3, cell_size, cell_size)
        return patches

    def _build_tile_mosaic(
        self,
        target_patches: torch.Tensor,
        tile_images: Sequence[Image.Image],
        grid_rows: int,
        grid_cols: int,
    ) -> Tuple[torch.Tensor, Dict[str, int]]:
        params = self.params
        device = self.device
        cell_size = params.cell_size

        tile_tensors: List[torch.Tensor] = []
        for image in tile_images:
            tensor = pil_to_tensor(image, device=device).tensor
            tensor = resize_image_tensor(tensor, (cell_size, cell_size))
            tile_tensors.append(tensor)
        tile_bank = torch.stack(tile_tensors, dim=0)

        target_features = compute_features(target_patches, params.feature_method)
        tile_features = compute_features(tile_bank, params.feature_method)
        distances = torch.cdist(target_features, tile_features)

        selected_indices, usage_map = self._select_tiles(distances)
        selected_tiles = tile_bank[selected_indices]

        if params.blend_factor > 0:
            blended = torch.lerp(
                selected_tiles,
                target_patches,
                params.blend_factor,
            )
        else:
            blended = selected_tiles

        mosaic_tensor = self._assemble_from_patches(
            blended,
            grid_rows=grid_rows,
            grid_cols=grid_cols,
            cell_size=cell_size,
        )
        return mosaic_tensor, usage_map

    def _select_tiles(self, distances: torch.Tensor) -> Tuple[torch.Tensor, Dict[str, int]]:
        params = self.params
        num_tiles = distances.size(1)
        usage = torch.zeros(num_tiles, dtype=torch.int32)
        selections: List[int] = []

        for row in distances:
            if params.top_k > 1:
                k = min(params.top_k, num_tiles)
                _, top_idx = torch.topk(row, k=k, largest=False)
                perm = torch.randperm(k, generator=self.generator)
                candidates = top_idx[perm].tolist()
            else:
                best = int(torch.argmin(row).item())
                candidates = [best]

            chosen = candidates[0]
            if params.reuse_limit > 0:
                for idx in candidates:
                    if usage[idx] < params.reuse_limit:
                        chosen = idx
                        break
            usage[chosen] += 1
            selections.append(chosen)

        selection_tensor = torch.tensor(selections, device=self.device, dtype=torch.long)
        usage_map = {str(i): int(count.item()) for i, count in enumerate(usage) if count > 0}
        return selection_tensor, usage_map

    def _assemble_from_patches(
        self,
        patches: torch.Tensor,
        grid_rows: int,
        grid_cols: int,
        cell_size: int,
    ) -> torch.Tensor:
        num_patches, channels, _, _ = patches.shape
        assert grid_rows * grid_cols == num_patches, "Mismatch between patches and output size"

        out_h = grid_rows * cell_size
        out_w = grid_cols * cell_size

        patches_flat = patches.contiguous().view(num_patches, -1).transpose(0, 1).unsqueeze(0)
        mosaic = F.fold(
            patches_flat,
            output_size=(out_h, out_w),
            kernel_size=cell_size,
            stride=cell_size,
        )
        return mosaic.squeeze(0)
