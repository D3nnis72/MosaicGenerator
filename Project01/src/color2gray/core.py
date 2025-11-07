from __future__ import annotations

from typing import Iterable, Tuple

import torch
from torch import nn

BT601: Tuple[float, float, float] = (0.299, 0.587, 0.114)
BT709: Tuple[float, float, float] = (0.2126, 0.7152, 0.0722)


def make_1x1_conv(weights: Iterable[float], *, device: torch.device | None = None) -> nn.Conv2d:
    """Create a fixed 1x1 convolution for RGB→gray conversion."""

    weight_tensor = torch.tensor(list(weights), dtype=torch.float32, device=device).view(1, 3, 1, 1)
    conv = nn.Conv2d(in_channels=3, out_channels=1, kernel_size=1, bias=False)
    conv.to(device)
    with torch.no_grad():
        conv.weight.copy_(weight_tensor)
    conv.requires_grad_(False)
    conv.eval()
    return conv


@torch.no_grad()
def rgb_to_gray_tensor(
    img_rgb: torch.Tensor,
    *,
    weights: Iterable[float] = BT601,
) -> torch.Tensor:
    """Convert an RGB tensor to grayscale using a 1x1 convolution.

    Args:
        img_rgb: Tensor shaped [C, H, W] or [N, C, H, W]; channel dimension must be 3.
        weights: Iterable defining the luminance weights (defaults to BT.601).

    Returns:
        Tensor shaped [1, H, W] or [N, 1, H, W] in the same dtype/device as input.
    """

    if img_rgb.dim() == 3:
        img_rgb = img_rgb.unsqueeze(0)
        squeeze_back = True
    elif img_rgb.dim() == 4:
        squeeze_back = False
    else:
        raise ValueError("img_rgb must be of shape [3,H,W] or [N,3,H,W]")

    if img_rgb.size(1) != 3:
        raise ValueError(f"Expected 3 channels, got {img_rgb.size(1)}")

    conv = make_1x1_conv(weights, device=img_rgb.device)
    # Ensure numeric stability for input range
    gray = conv(img_rgb.clamp(0.0, 1.0))

    return gray.squeeze(0) if squeeze_back else gray

