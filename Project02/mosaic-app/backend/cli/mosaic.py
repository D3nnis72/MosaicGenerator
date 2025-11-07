from __future__ import annotations

import argparse
import json
import time
from pathlib import Path

from engine import MosaicParams, make_mosaic
from engine.io import load_image, tensor_to_pil


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(description="Generate a mosaic image via tile averaging")
    parser.add_argument("--in", dest="input", required=True, help="Path to input image")
    parser.add_argument("--out", dest="output", required=True, help="Path to output image")
    parser.add_argument("--rows", type=int, help="Number of tile rows")
    parser.add_argument("--cols", type=int, help="Number of tile columns")
    parser.add_argument("--tile-px", type=int, help="Square tile size in pixels")
    parser.add_argument("--mode", choices=("rgb", "grayscale"), default="rgb")
    parser.add_argument("--palette-k", type=int, default=0, help="Number of colours for palette quantisation")
    parser.add_argument(
        "--policy",
        choices=("crop_to_multiple", "pad_reflect_to_multiple"),
        default="crop_to_multiple",
    )
    parser.add_argument("--device", default="cpu", help="Torch device, e.g. cpu or cuda")
    parser.add_argument("--json", action="store_true", help="Print report as JSON")
    return parser


def main(argv: list[str] | None = None) -> int:
    parser = build_parser()
    args = parser.parse_args(argv)

    image = load_image(args.input, mode=args.mode)

    params = MosaicParams(
        mode=args.mode,
        rows=args.rows,
        cols=args.cols,
        tile_px=args.tile_px,
        palette_k=args.palette_k,
        policy=args.policy,
        device=args.device,
    )

    start = time.perf_counter()
    result = make_mosaic(image, params)
    duration = time.perf_counter() - start

    output_path = Path(args.output)
    output_path.parent.mkdir(parents=True, exist_ok=True)
    mosaic_image = tensor_to_pil(result.mosaic.squeeze(0), mode=args.mode)
    mosaic_image.save(output_path)

    report = result.to_dict()
    report["duration_s"] = round(duration, 4)
    report["output"] = str(output_path)

    if args.json:
        print(json.dumps(report, indent=2))
    else:
        print(f"Input size:	{report['meta']['input_hw']}")
        print(f"Processed size:	{report['meta']['processed_hw']}")
        print(f"Grid:		{report['meta']['rows']} × {report['meta']['cols']}")
        print(f"Tile size:	{report['meta']['tile_size']}")
        print(f"Palette k:	{report['meta']['palette_k']}")
        print(f"Policy:		{report['meta']['policy']}")
        print(f"Duration:	{report['duration_s']} s")
        print(f"Output saved:	{report['output']}")

    return 0


if __name__ == "__main__":
    raise SystemExit(main())

