from __future__ import annotations

from functools import lru_cache
from typing import Literal

import numpy as np
import torch
import torch.nn.functional as F
from skimage import color

try:
    from torchvision.transforms import functional as TF  # type: ignore
    _tv_rgb_to_lab = getattr(TF, "rgb_to_lab", None)
    _tv_rgb_to_hsv = getattr(TF, "rgb_to_hsv", None)
except Exception:  # noqa: BLE001
    TF = None  # type: ignore
    _tv_rgb_to_lab = None
    _tv_rgb_to_hsv = None

FeatureMethod = Literal["lab", "hsv", "sobel", "hybrid"]
SUPPORTED_METHODS: set[FeatureMethod] = {"lab", "hsv", "sobel", "hybrid"}


def _ensure_4d(tensor: torch.Tensor) -> torch.Tensor:
    if tensor.dim() == 3:
        return tensor.unsqueeze(0)
    return tensor


@lru_cache(maxsize=1)
def _sobel_kernels(device: torch.device) -> torch.Tensor:
    kernel_x = torch.tensor([[1.0, 0.0, -1.0], [2.0, 0.0, -2.0], [1.0, 0.0, -1.0]], device=device)
    kernel_y = torch.tensor([[1.0, 2.0, 1.0], [0.0, 0.0, 0.0], [-1.0, -2.0, -1.0]], device=device)
    kernels = torch.stack([kernel_x, kernel_y]).unsqueeze(1)
    return kernels


def _lab_mean(patches: torch.Tensor) -> torch.Tensor:
    patches_4d = _ensure_4d(patches)
    if _tv_rgb_to_lab is not None:
        lab = _tv_rgb_to_lab(patches_4d)
    else:
        rgb_np = patches_4d.detach().cpu().permute(0, 2, 3, 1).numpy().astype(np.float64)
        lab_np = color.rgb2lab(rgb_np)
        lab = torch.from_numpy(lab_np).permute(0, 3, 1, 2).to(patches_4d.device, patches_4d.dtype)
    mean = lab.mean(dim=(-1, -2))
    return mean


def _sobel_energy(patches: torch.Tensor) -> torch.Tensor:
    patches_4d = _ensure_4d(patches)
    device = patches_4d.device
    gray = TF.rgb_to_grayscale(patches_4d, num_output_channels=1)
    kernels = _sobel_kernels(device)
    grad = F.conv2d(gray, kernels, padding=1)
    grad_mag = torch.sqrt(grad[:, 0] ** 2 + grad[:, 1] ** 2 + 1e-12)
    energy = grad_mag.mean(dim=(-1, -2))
    return energy.unsqueeze(-1)


def _hsv_histogram(patches: torch.Tensor, bins: int = 8) -> torch.Tensor:
    patches_4d = _ensure_4d(patches)
    if _tv_rgb_to_hsv is not None:
        hsv = _tv_rgb_to_hsv(patches_4d)
    else:
        rgb_np = patches_4d.detach().cpu().permute(0, 2, 3, 1).numpy().astype(np.float64)
        hsv_np = color.rgb2hsv(rgb_np)
        hsv = torch.from_numpy(hsv_np).permute(0, 3, 1, 2).to(patches_4d.device, patches_4d.dtype)
    n, c, h, w = hsv.shape
    hsv_flat = hsv.view(n, c, -1)
    bin_indices = torch.clamp((hsv_flat * bins).long(), 0, bins - 1)
    one_hot = torch.nn.functional.one_hot(bin_indices, num_classes=bins).float()
    hist = one_hot.sum(dim=2)
    hist = hist / hist.sum(dim=2, keepdim=True).clamp_min(1e-6)
    hist = hist.view(n, c * bins)
    return hist


def compute_features(patches: torch.Tensor, method: FeatureMethod) -> torch.Tensor:
    if method not in SUPPORTED_METHODS:
        raise ValueError(f"Unsupported feature method: {method}")

    if method == "lab":
        return _lab_mean(patches)
    if method == "hsv":
        return _hsv_histogram(patches)
    if method == "sobel":
        return _sobel_energy(patches)

    # hybrid
    lab = _lab_mean(patches)
    sobel = _sobel_energy(patches)
    return torch.cat([lab, sobel], dim=-1)
