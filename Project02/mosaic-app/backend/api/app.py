from __future__ import annotations

import base64
from io import BytesIO
from typing import Optional

from fastapi import FastAPI, File, Form, HTTPException, UploadFile
from PIL import Image

from engine import MosaicParams, make_mosaic
from engine.io import pil_to_tensor, tensor_to_pil

app = FastAPI(title="Mosaic API", version="0.1.0")


def _to_data_url(image) -> str:
    buffer = BytesIO()
    image.save(buffer, format="PNG")
    encoded = base64.b64encode(buffer.getvalue()).decode("utf-8")
    return f"data:image/png;base64,{encoded}"


@app.get("/api/health")
def health() -> dict:
    return {"status": "ok"}


@app.post("/api/mosaic")
async def create_mosaic(
    image: UploadFile = File(...),
    rows: Optional[int] = Form(None),
    cols: Optional[int] = Form(None),
    tile_px: Optional[int] = Form(None),
    mode: str = Form("rgb"),
    palette_k: int = Form(0),
    policy: str = Form("crop_to_multiple"),
    device: str = Form("cpu"),
) -> dict:
    try:
        contents = await image.read()
        with BytesIO(contents) as buffer:
            pil_image = Image.open(buffer).convert("RGB")
    except Exception as exc:  # noqa: BLE001
        raise HTTPException(status_code=400, detail="Invalid image upload") from exc

    try:
        pil_mode = "RGB" if mode == "rgb" else "L"
        input_tensor = pil_to_tensor(pil_image.convert(pil_mode), mode)
        params = MosaicParams(
            mode=mode,
            rows=rows,
            cols=cols,
            tile_px=tile_px,
            palette_k=palette_k,
            policy=policy,  # type: ignore[arg-type]
            device=device,
        )
        result = make_mosaic(input_tensor, params)
    except Exception as exc:  # noqa: BLE001
        raise HTTPException(status_code=400, detail=str(exc)) from exc

    original_data_url = _to_data_url(pil_image.convert(pil_mode))
    mosaic_image = tensor_to_pil(result.mosaic.squeeze(0), mode=mode)
    mosaic_data_url = _to_data_url(mosaic_image)

    response = {
        "meta": {
            "input_hw": list(result.meta.input_hw),
            "processed_hw": list(result.meta.processed_hw),
            "rows": result.meta.rows,
            "cols": result.meta.cols,
            "tile_size": list(result.meta.tile_size),
            "mode": result.meta.mode,
            "palette_k": result.meta.palette_k,
            "policy": result.meta.policy,
            "adjustments": result.meta.adjustments,
        },
        "images": {
            "preview_original": original_data_url,
            "preview_mosaic": mosaic_data_url,
        },
    }
    return response

