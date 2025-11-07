from __future__ import annotations

import argparse
import sys

import torch

from .colorspaces import linear_to_srgb, srgb_to_linear
from .core import BT601, BT709, rgb_to_gray_tensor
from .io import load_rgb, save_gray


def parse_weights(value: str):
    presets = {
        "bt601": BT601,
        "bt709": BT709,
    }

    key = value.lower().strip()
    if key in presets:
        return presets[key]

    try:
        parts = [float(part) for part in value.split(",")]
    except ValueError as exc:
        raise argparse.ArgumentTypeError("Weights must be comma-separated floats") from exc

    if len(parts) != 3:
        raise argparse.ArgumentTypeError("Provide exactly three weights")

    total = sum(parts)
    if total == 0:
        raise argparse.ArgumentTypeError("Weights must not sum to zero")

    return tuple(part / total for part in parts)


def build_argparser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(
        description="Convert RGB images to grayscale using a 1x1 convolution (PyTorch)",
    )
    parser.add_argument("input", help="Path to the RGB input image")
    parser.add_argument("output", help="Path where the grayscale image will be stored")
    parser.add_argument(
        "--weights",
        type=parse_weights,
        default="bt601",
        help="Weight preset or custom 'r,g,b' (default: bt601)",
    )
    parser.add_argument(
        "--linearize",
        action="store_true",
        help="Apply sRGB->linear conversion before luminance and convert back after",
    )
    parser.add_argument(
        "--device",
        choices=("cpu", "cuda"),
        default="cpu",
        help="Processing device (default: cpu)",
    )
    return parser


def resolve_device(requested: str) -> torch.device:
    if requested == "cuda":
        if torch.cuda.is_available():
            return torch.device("cuda")
        print("CUDA requested but not available; falling back to CPU", file=sys.stderr)
    return torch.device("cpu")


def main(argv: list[str] | None = None) -> int:
    parser = build_argparser()
    args = parser.parse_args(argv)

    device = resolve_device(args.device)

    rgb = load_rgb(args.input).to(device)

    if args.linearize:
        rgb_linear = srgb_to_linear(rgb)
        gray_linear = rgb_to_gray_tensor(rgb_linear, weights=args.weights)
        gray = linear_to_srgb(gray_linear)
    else:
        gray = rgb_to_gray_tensor(rgb, weights=args.weights)

    save_gray(args.output, gray.to("cpu"))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())

