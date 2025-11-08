from __future__ import annotations

import io
from dataclasses import dataclass
from pathlib import Path
from typing import Iterable, Tuple
from PIL import Image
import torch
import torch.nn.functional as F
from torchvision.transforms import functional as TF


@dataclass
class ImageTensor:
    tensor: torch.Tensor  # Shape: (C, H, W), float32 in [0, 1]
    mode: str = "RGB"

    @property
    def size(self) -> Tuple[int, int]:
        _, h, w = self.tensor.shape
        return w, h


def load_image_from_bytes(data: bytes, mode: str = "RGB") -> Image.Image:
    with Image.open(io.BytesIO(data)) as img:
        return img.convert(mode)


def load_image(path: Path, mode: str = "RGB") -> Image.Image:
    return Image.open(path).convert(mode)


def pil_to_tensor(image: Image.Image, device: torch.device | None = None) -> ImageTensor:
    tensor = TF.to_tensor(image)
    if device is not None:
        tensor = tensor.to(device)
    return ImageTensor(tensor=tensor, mode=image.mode)


def tensor_to_pil(tensor: torch.Tensor) -> Image.Image:
    tensor = tensor.clamp(0.0, 1.0).detach().cpu()
    return TF.to_pil_image(tensor)


def resize_image_tensor(tensor: torch.Tensor, size: Tuple[int, int]) -> torch.Tensor:
    """Resize tensor image (C, H, W) to new (height, width)."""
    c, h, w = tensor.shape
    resized = F.interpolate(tensor.unsqueeze(0), size=size, mode="bilinear", align_corners=False)
    return resized.squeeze(0)


def ensure_divisible(image: torch.Tensor, cell_size: int) -> Tuple[torch.Tensor, Tuple[int, int]]:
    """Crop the tensor so that height and width are divisible by cell_size."""
    _, h, w = image.shape
    h_crop = (h // cell_size) * cell_size
    w_crop = (w // cell_size) * cell_size
    if h_crop == h and w_crop == w:
        return image, (h_crop, w_crop)
    return image[:, :h_crop, :w_crop], (h_crop, w_crop)


def image_from_patch_colors(colors: torch.Tensor, grid_size: Tuple[int, int], cell_size: int) -> torch.Tensor:
    """Construct an image tensor from per-cell colors."""
    num_patches, channels = colors.shape
    rows, cols = grid_size
    assert num_patches == rows * cols, "Color count must match grid size"
    blocks = colors.view(rows, cols, channels).permute(2, 0, 1)
    blocks = blocks.unsqueeze(-1).unsqueeze(-1).repeat(1, 1, 1, cell_size, cell_size)
    # Reshape to full image
    blocks = blocks.view(channels, rows, cols, cell_size, cell_size)
    blocks = blocks.permute(0, 1, 3, 2, 4).contiguous()
    image = blocks.view(channels, rows * cell_size, cols * cell_size)
    return image


def stack_images(images: Iterable[torch.Tensor]) -> torch.Tensor:
    tensors = [img.unsqueeze(0) for img in images]
    return torch.cat(tensors, dim=0)


def get_device(prefer_gpu: bool = True) -> torch.device:
    if prefer_gpu and torch.cuda.is_available():
        return torch.device("cuda")
    return torch.device("cpu")
