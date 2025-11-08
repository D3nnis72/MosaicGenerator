from __future__ import annotations

from typing import Any, Dict, Optional

from pydantic import BaseModel, Field, validator

from mosaic.features import SUPPORTED_METHODS, FeatureMethod


class MosaicSettings(BaseModel):
    cell_size: int = Field(40, ge=4, le=512)
    feature_method: FeatureMethod = Field("lab")
    output_tile_size: int = Field(64, ge=4, le=1024)
    blend_factor: float = Field(0.15, ge=0.0, le=1.0)
    top_k: int = Field(1, ge=1, le=64)
    reuse_limit: int = Field(0, ge=0, le=1024)
    palette_size: int = Field(16, ge=2, le=256)
    apply_dither: bool = True
    seed: int = Field(42)
    prefer_gpu: bool = True

    @validator("feature_method")
    def validate_method(cls, value: FeatureMethod) -> FeatureMethod:
        if value not in SUPPORTED_METHODS:
            raise ValueError(f"Unsupported feature method: {value}")
        return value


class DatasetInfoResponse(BaseModel):
    name: str
    num_images: int
    samples: list[str]
    metadata: Dict[str, Any] = Field(default_factory=dict)


class DatasetListResponse(BaseModel):
    datasets: list[DatasetInfoResponse]


class MosaicResponse(BaseModel):
    image: str
    metadata: Dict[str, Any]


class ErrorResponse(BaseModel):
    detail: str
