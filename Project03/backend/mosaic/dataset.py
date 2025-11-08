from __future__ import annotations

import json
import os
from dataclasses import dataclass, field
from pathlib import Path
from typing import Dict, Iterable, List, Optional

from PIL import Image

IMAGE_EXTENSIONS = {".png", ".jpg", ".jpeg", ".bmp", ".tiff", ".webp"}


@dataclass
class DatasetInfo:
    name: str
    path: Path
    num_images: int
    samples: List[str] = field(default_factory=list)
    metadata: Dict[str, str] = field(default_factory=dict)

    def to_dict(self) -> Dict[str, object]:
        data = {
            "name": self.name,
            "num_images": self.num_images,
            "samples": self.samples,
        }
        data.update(self.metadata)
        return data


class DatasetNotFoundError(RuntimeError):
    pass


class DatasetCatalog:
    def __init__(self, data_root: Optional[Path] = None) -> None:
        env_root = os.getenv("MOSAIC_DATA_ROOT")
        if data_root is None:
            if env_root:
                data_root = Path(env_root)
            else:
                data_root = Path(__file__).resolve().parents[1] / "data"
        self.data_root = data_root
        self._datasets: Dict[str, DatasetInfo] = {}
        self.refresh()

    def refresh(self) -> None:
        self._datasets.clear()
        if not self.data_root.exists():
            return
        for path in sorted(self.data_root.iterdir()):
            if not path.is_dir():
                continue
            dataset_name = path.name
            info = self._build_info(dataset_name, path)
            if info.num_images > 0:
                self._datasets[dataset_name] = info

    def _build_info(self, name: str, path: Path) -> DatasetInfo:
        image_paths = list(self._iter_image_files(path))
        metadata = self._read_metadata(path)
        samples = [str(p.relative_to(path)) for p in image_paths[:6]]
        return DatasetInfo(name=name, path=path, num_images=len(image_paths), samples=samples, metadata=metadata)

    def list(self) -> List[DatasetInfo]:
        return list(self._datasets.values())

    def get(self, name: str) -> DatasetInfo:
        try:
            return self._datasets[name]
        except KeyError as exc:
            raise DatasetNotFoundError(name) from exc

    def load_tiles(self, name: str) -> List[Path]:
        info = self.get(name)
        return list(self._iter_image_files(info.path))

    def _iter_image_files(self, path: Path) -> Iterable[Path]:
        for file_path in sorted(path.rglob("*")):
            if file_path.is_file() and file_path.suffix.lower() in IMAGE_EXTENSIONS:
                yield file_path

    def _read_metadata(self, path: Path) -> Dict[str, str]:
        meta_path = path / "metadata.json"
        if not meta_path.exists():
            return {}
        try:
            data = json.loads(meta_path.read_text())
        except json.JSONDecodeError:
            return {}
        return {k: v for k, v in data.items() if isinstance(v, (str, int, float))}


def load_image(path: Path) -> Image.Image:
    with Image.open(path) as image:
        return image.convert("RGB")
