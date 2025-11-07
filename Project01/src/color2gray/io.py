from __future__ import annotations

from pathlib import Path

import numpy as np
from PIL import Image
import torch


def load_rgb(path: str | Path) -> torch.Tensor:
    """Load an image as a float tensor [3, H, W] scaled to [0, 1]."""

    image = Image.open(Path(path)).convert("RGB")
    array = np.asarray(image, dtype=np.float32)  # [H, W, 3]
    tensor = torch.from_numpy(array).permute(2, 0, 1) / 255.0
    return tensor


def save_gray(path: str | Path, gray: torch.Tensor) -> None:
    """Save a grayscale tensor [H, W] or [1, H, W] as an 8-bit image."""

    if gray.dim() == 3:
        if gray.size(0) != 1:
            raise ValueError("Expected single channel tensor with shape [1, H, W]")
        gray = gray.squeeze(0)

    if gray.dim() != 2:
        raise ValueError("Expected grayscale tensor of shape [H, W]")

    array = (gray.clamp(0.0, 1.0) * 255.0).round().to(torch.uint8).cpu().numpy()
    Image.fromarray(array, mode="L").save(Path(path))

