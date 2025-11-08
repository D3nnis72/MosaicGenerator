# Project03 – Mosaic Studio

End-to-end photo mosaic generator spanning:

- **FastAPI + Torch 2.2 backend** (`backend/`)
  - GPU-aware tile matching engine with Lab / HSV / Sobel features
  - Dataset catalog loader, palette-quantized fallback mosaics
  - `/generate` and `/datasets` REST endpoints returning metadata-rich responses
- **Next.js 14 + shadcn/ui frontend** (`frontend/`)
  - Drag & drop uploads, dataset selector, custom tile manager
  - Advanced controls (top-k randomness, reuse limit, blend)
  - Live split-view preview with analytics + download
- **Dataset architecture** (`data/` + `AnimalsDataset/`) ready for curated tile packs

## Quick start

1. **Backend**
   ```bash
   cd Project03/backend
   python -m venv .venv
   source .venv/bin/activate
   pip install -e .
   uvicorn app.main:app --reload
   ```

2. **Frontend**
   ```bash
   cd Project03/frontend
   npm install
   npm run dev
   ```

3. Visit `http://localhost:3000` and point `NEXT_PUBLIC_API_BASE_URL` to your backend (defaults to `http://127.0.0.1:8000`).

## Dataset layout

Place curated tile folders under `backend/data/` (or set `MOSAIC_DATA_ROOT`). Each top-level folder becomes a dataset and can optionally include a `metadata.json` file.

Sample dataset `AnimalsDataset/` is provided with class-organized images (`raw-img/`).

## Architecture references

- `Architecture.md` – end-to-end system summary
- `DatasetArchitecture.md` – dataset discovery, metadata, caching options
- `FrontendArchitecture.md` – component layers, hooks, and UX principles
