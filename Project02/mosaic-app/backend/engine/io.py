from __future__ import annotations

from pathlib import Path
from typing import Literal

import numpy as np
from PIL import Image
import torch

ColorMode = Literal["rgb", "grayscale"]


def pil_to_tensor(image: Image.Image, mode: ColorMode) -> torch.Tensor:
    array = np.asarray(image, dtype=np.float32) / 255.0
    if mode == "rgb":
        return torch.from_numpy(array).permute(2, 0, 1)
    return torch.from_numpy(array).unsqueeze(0)


def load_image(path: str | Path, mode: ColorMode = "rgb") -> torch.Tensor:
    """Load an image as float tensor scaled to [0, 1]."""

    pil_mode = "RGB" if mode == "rgb" else "L"
    image = Image.open(path).convert(pil_mode)
    return pil_to_tensor(image, mode)


def tensor_to_pil(tensor: torch.Tensor, mode: ColorMode = "rgb") -> Image.Image:
    """Convert a tensor in [0, 1] back to a PIL image."""

    tensor = tensor.clamp(0.0, 1.0).detach().cpu()

    if mode == "rgb":
        array = (tensor.permute(1, 2, 0).numpy() * 255.0).round().astype(np.uint8)
        return Image.fromarray(array, mode="RGB")

    array = (tensor.squeeze(0).numpy() * 255.0).round().astype(np.uint8)
    return Image.fromarray(array, mode="L")

