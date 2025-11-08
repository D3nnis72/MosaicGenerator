from __future__ import annotations

import base64
import io
import json
import os
import random
from typing import List, Optional

from fastapi import FastAPI, File, Form, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from mosaic.dataset import DatasetCatalog, DatasetNotFoundError, load_image as load_dataset_image
from mosaic.engine import MosaicEngine, MosaicParameters
from mosaic.image_utils import load_image_from_bytes
from .schemas import DatasetInfoResponse, DatasetListResponse, ErrorResponse, MosaicResponse, MosaicSettings

APP_VERSION = "0.1.0"
MAX_DATASET_TILES = int(os.getenv("MOSAIC_MAX_DATASET_TILES", "600"))

app = FastAPI(title="Mosaic Studio API", version=APP_VERSION)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

catalog = DatasetCatalog()


@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok", "version": APP_VERSION}


@app.get("/datasets", response_model=DatasetListResponse)
def list_datasets() -> DatasetListResponse:
    catalog.refresh()
    datasets = [
        DatasetInfoResponse(
            name=info.name,
            num_images=info.num_images,
            samples=info.samples,
            metadata=info.metadata,
        )
        for info in catalog.list()
    ]
    return DatasetListResponse(datasets=datasets)


@app.post(
    "/generate",
    response_model=MosaicResponse,
    responses={400: {"model": ErrorResponse}, 422: {"model": ErrorResponse}},
)
async def generate_mosaic(
    target_image: UploadFile = File(...),
    tiles: Optional[List[UploadFile]] = File(default=None),
    dataset: Optional[str] = Form(default=None),
    settings: Optional[str] = Form(default=None),
):
    try:
        settings_payload = json.loads(settings) if settings else {}
        params = MosaicSettings(**settings_payload)
    except (json.JSONDecodeError, ValueError) as exc:
        raise HTTPException(status_code=400, detail=f"Invalid settings payload: {exc}") from exc

    target_bytes = await target_image.read()
    if not target_bytes:
        raise HTTPException(status_code=400, detail="Target image is empty")

    try:
        target_pil = load_image_from_bytes(target_bytes)
    except Exception as exc:  # noqa: BLE001
        raise HTTPException(status_code=400, detail=f"Failed to read target image: {exc}") from exc

    tile_images = []

    if dataset:
        try:
            catalog.get(dataset)
            dataset_paths = catalog.load_tiles(dataset)
        except DatasetNotFoundError as exc:
            raise HTTPException(status_code=404, detail=f"Dataset '{dataset}' not found") from exc

        if MAX_DATASET_TILES and len(dataset_paths) > MAX_DATASET_TILES:
            rng = random.Random(params.seed)
            dataset_paths = rng.sample(dataset_paths, MAX_DATASET_TILES)

        for path in dataset_paths:
            try:
                tile_images.append(load_dataset_image(path))
            except Exception:
                continue

    if tiles:
        for upload in tiles:
            data = await upload.read()
            if not data:
                continue
            try:
                tile_images.append(load_image_from_bytes(data))
            except Exception:
                continue

    engine_params = MosaicParameters(
        cell_size=params.cell_size,
        feature_method=params.feature_method,
        output_tile_size=params.output_tile_size,
        blend_factor=params.blend_factor,
        top_k=params.top_k,
        reuse_limit=params.reuse_limit,
        palette_size=params.palette_size,
        apply_dither=params.apply_dither,
        seed=params.seed,
        prefer_gpu=params.prefer_gpu,
    )
    engine = MosaicEngine(engine_params)
    result = engine.generate(target_pil, tile_images)

    buffer = io.BytesIO()
    result.image.save(buffer, format="PNG")
    image_base64 = base64.b64encode(buffer.getvalue()).decode("ascii")

    return JSONResponse(
        status_code=200,
        content=MosaicResponse(
            image=f"data:image/png;base64,{image_base64}",
            metadata=result.metadata,
        ).dict(),
    )
