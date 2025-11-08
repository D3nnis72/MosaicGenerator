# Project 1 – Color2Gray

Convert RGB images to grayscale using a 1×1 convolution with BT.601 weights.

## Features

- PyTorch-based conversion (`Conv2d` with fixed weights)
- CLI with weight presets, custom weights, optional linear colorspace workflow
- Clean separation of core logic, I/O utilities, and command interface
- Ready for extension to other luminance standards
- Tests covering tensor shapes and expected luminance values

## Installation

```bash
python -m venv .venv
source .venv/bin/activate  # Windows: .venv\Scripts\activate
pip install --upgrade pip
pip install -e .
```

The editable install keeps the CLI entry point (`convert.py`) and package code in sync while you iterate.

## Quickstart

```bash
python convert.py ./data/input/default.jpg ./data/output/output.jpg
```

Additional options:

- `--weights bt709` to use BT.709 coefficients
- `--weights 0.3,0.6,0.1` for custom weights (auto-normalized)
- `--linearize` to convert sRGB↔linear before and after luminance computation
- `--device cuda` to run on GPU (falls back to CPU if unavailable)

## Development

Install dependencies with `pip install -e .[dev]` once you add optional dev extras.

Run tests:

```bash
pytest
```
