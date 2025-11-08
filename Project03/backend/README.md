# Mosaic Studio Backend

FastAPI + Torch backend that powers Project03 photo mosaic generation.

## Features

- `/datasets` endpoint to discover curated tile sets stored under `backend/data`
- `/generate` endpoint that accepts a target image, optional dataset name and/or tile uploads, and JSON settings
- Torch 2.2 mosaic engine with GPU acceleration, Lab/HSV/Sobel feature extraction, top-k randomness, and blend controls
- Palette-quantized fallback mosaic (with optional dithering) when no tiles are provided

## Running locally

```bash
cd Project03/backend
python -m venv .venv
source .venv/bin/activate
pip install -e .
uvicorn app.main:app --reload
```

Set `MOSAIC_DATA_ROOT` to a directory containing tile datasets if you store them outside `backend/data`.

## Request payload

Send a multipart/form-data POST request to `/generate` with:

- `target_image`: required image file
- `tiles`: optional repeated field of additional tile images
- `dataset`: optional dataset name discovered via `/datasets`
- `settings`: JSON string with parameters (see below)

### Settings JSON schema

```json
{
  "cell_size": 40,
  "feature_method": "lab",
  "output_tile_size": 64,
  "blend_factor": 0.15,
  "top_k": 4,
  "reuse_limit": 12,
  "palette_size": 16,
  "apply_dither": true,
  "seed": 42,
  "prefer_gpu": true
}
```

The response is JSON with `image` (data URL) and detailed `metadata` describing the grid, performance, and tile usage.
