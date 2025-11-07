# Mosaic App

Full-stack implementation of the Project 2 mosaic assignment.

## Overview

- **Backend** (`backend/`): PyTorch engine + FastAPI service
- **Frontend** (`frontend/`): Next.js UI with Tailwind and shadcn-inspired components
- **Data** (`../data/`): sample input (`MariaVonLinden.jpg`) and output directory for generated mosaics

## Getting Started

### Backend
```bash
cd backend
python -m venv .venv
source .venv/bin/activate
pip install -e .[dev]
uvicorn api.app:app --reload
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

Configure Next.js to proxy `/api/*` to the backend (`http://localhost:8000`) via `next.config.mjs` rewrites or a dev proxy (left as an exercise).

## CLI Usage Example
```bash
python -m cli.mosaic --in ../data/input/MariaVonLinden.jpg --out ../data/output/mosaic.png --rows 48 --cols 36 --mode grayscale --palette-k 6 --policy crop_to_multiple
```

## Architecture Highlights
- Parameter validation ensuring mutually exclusive tiling modes
- Depthwise Conv2d tile averaging with optional k-means palette quantisation
- FastAPI endpoint returning base64 previews & metadata for the UI
- Frontend controls for tiling, palette, policy, and mode with live previews and grid overlay

