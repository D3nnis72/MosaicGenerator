# Mosaic Backend

Python service that turns RGB images into tile-based mosaics using 1×1 convolutions and nearest-neighbour upsampling.

## Features

- Reusable engine module for preprocessing, tiling, and palette quantisation
- CLI entry point for scripting batch conversions
- FastAPI application that exposes a `/api/mosaic` endpoint

## Setup

```bash
cd backend
python -m venv .venv
source .venv/bin/activate  # Windows: .venv\Scripts\activate
pip install --upgrade pip
pip install -e .
```

## Commands

- Run CLI: `python -m cli.mosaic --help`
- Example (Maria Von Linden preset):  
  `python -m cli.mosaic --in ../data/input/MariaVonLinden.jpg --out ../data/output/MariaVonLinden_mosaic.png --rows 48 --cols 36 --mode grayscale --palette-k 6 --policy crop_to_multiple`
- Launch API: `uvicorn api.app:app --reload`

## Project Structure

- `engine/` – core tensor operations (preprocess, Conv2d, upsample, palette)
- `cli/` – command-line interface that wraps the engine
- `api/` – FastAPI app that orchestrates uploads and responses
