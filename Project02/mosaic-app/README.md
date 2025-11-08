# 🧱 Project 2 – Maria-von-Linden Mosaic

Recreate the foyer mosaic at _Maria-von-Linden-Straße 1_ by turning an input portrait into a pixelated wall made from 48 × 36 tiles (1 728 in total). The project contains a reusable PyTorch engine, a CLI, a FastAPI backend, and a Tailwind/Next.js web UI for experimenting with tile size, palette reduction, and preprocessing policies.

---

## 1. Intuition – Conv2d as a Mosaic Builder

1. **Split** the image into non-overlapping tiles.
2. **Average** each tile’s pixels (box filter).
3. **Fill** each tile with that average colour.

In linear-filter notation the average for a tile is:

```
y[i, j] = Σᵤ Σᵥ K[u, v] * x[i + u, j + v]
```

- `K` – box kernel of size `(t_h, t_w)` with value `1 / (t_h * t_w)`
- `x` – input image
- `y` – per-tile output

`torch.nn.Conv2d` performs this automatically when we use:

- `kernel_size = (t_h, t_w)`
- `stride = (t_h, t_w)` (one step per tile)
- `groups = channels` for depthwise averaging
- `padding = 0`

For a 960 × 720 portrait and a 48 × 36 grid, each tile is 20 × 20 pixels. Conv2d generates a 48 × 36 tensor whose elements are tile averages. We then **upsample with nearest neighbour** (scale 20 × 20) to restore the original resolution.

### Extras

- **Palette quantisation (`--palette-k`)**: optional k-means clustering that reduces tile colours to `k` representative hues, mimicking real mosaic stones (set `k=0` to disable).
- **Crop/pad policy (`--policy`)**:
  - `crop_to_multiple` trims bottom/right leftovers.
  - `pad_reflect_to_multiple` mirrors the border until dimensions fit.  
    Adjustments are recorded in the metadata.

---

## 2. Repository Layout

```
Project02/
├─ data/
│  ├─ input/               # sample portrait (MariaVonLinden.jpg)
│  └─ output/              # generated mosaics
└─ mosaic-app/
   ├─ backend/
   │  ├─ engine/           # pure Torch engine (core, palette, io)
   │  ├─ api/              # FastAPI app (POST /api/mosaic, GET /api/health)
   │  └─ cli/              # python -m cli.mosaic entry point
   └─ frontend/            # Next.js + Tailwind + shadcn-inspired UI
```

---

## 3. Setup

### Backend (FastAPI + CLI)

```bash
cd mosaic-app/backend
python -m venv .venv
source .venv/bin/activate        # Windows: .venv\Scripts\activate
pip install -e .[dev]
uvicorn api.app:app --reload
```

### Frontend (Next.js UI)

```bash
cd mosaic-app/frontend
npm install
npm run dev
```

The `next.config.mjs` rewrite already proxies `/api/*` to `http://localhost:8000/api/*`. Keep backend and frontend dev servers running to use the UI.

---

## 4. CLI Cheat Sheet

```bash
# Help
python -m cli.mosaic --help

# Maria-von-Linden preset (grayscale tiles, k=6 palette)
python -m cli.mosaic \
  --in ../data/input/MariaVonLinden.jpg \
  --out ../data/output/MariaVonLinden_mosaic.png \
  --rows 48 --cols 36 \
  --mode grayscale \
  --palette-k 6 \
  --policy crop_to_multiple

# Same tile size via --tile-px instead of rows/cols
python -m cli.mosaic --tile-px 20 ...
```

CLI output reports input size, processed size, grid dimensions, tile size, palette setting, policy, and runtime.

---

## 5. REST API

- `POST /api/mosaic`
  - multipart/form-data fields: `image`, (`rows`+`cols` **or** `tile_px`), `mode`, `palette_k`, `policy`
  - Returns metadata plus base64 data URLs for original and mosaic previews
- `GET /api/health` – quick readiness check

Example request body:

```json
{
  "meta": {
    "input_hw": [720, 960],
    "processed_hw": [720, 960],
    "rows": 48,
    "cols": 36,
    "tile_size": [20, 20],
    "mode": "grayscale",
    "palette_k": 6,
    "policy": "crop_to_multiple",
    "adjustments": { "cropped_bottom_px": 0, "cropped_right_px": 0 }
  },
  "images": {
    "preview_original": "data:image/png;base64,...",
    "preview_mosaic": "data:image/png;base64,..."
  }
}
```

---

## 6. Frontend Highlights

- Drag & drop upload with live thumbnail
- Tabs for `rows/cols` vs. `tile_px`
- Controls for colour mode, palette size, crop/pad policy
- Preview pane with original / mosaic / side-by-side tabs and grid overlay toggle
- Metadata badges (input size, processed size, grid, tile size, palette, policy)
- Download button exports the mosaic preview

Screenshots:

- `../data/input/MariaVonLinden.jpg` (source portrait)
- `../data/output/MariaVonLinden_mosaic.png` (CLI result)
- `../data/output/` holds additional experiments (see repo images).

---

Enjoy building mosaics! To reproduce the wall, start with the Maria-von-Linden preset and adjust palette size or policy to match the on-site appearance.
