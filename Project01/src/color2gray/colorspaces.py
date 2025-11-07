from __future__ import annotations

import torch


def srgb_to_linear(x: torch.Tensor) -> torch.Tensor:
    """Convert sRGB values in [0, 1] to linear light."""

    a = 0.055
    return torch.where(
        x <= 0.04045,
        x / 12.92,
        ((x + a) / (1 + a)) ** 2.4,
    )


def linear_to_srgb(x: torch.Tensor) -> torch.Tensor:
    """Convert linear light values in [0, 1] back to sRGB."""

    a = 0.055
    return torch.where(
        x <= 0.0031308,
        x * 12.92,
        (1 + a) * (x ** (1 / 2.4)) - a,
    )

