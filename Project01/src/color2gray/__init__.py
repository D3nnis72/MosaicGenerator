"""Color2Gray package exposes the core grayscale conversion utilities."""

from .core import BT601, BT709, rgb_to_gray_tensor

__all__ = [
    "BT601",
    "BT709",
    "rgb_to_gray_tensor",
]

