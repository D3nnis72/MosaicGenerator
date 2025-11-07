from __future__ import annotations

from dataclasses import dataclass
from typing import Optional

import torch


@dataclass
class PaletteResult:
    colors: torch.Tensor  # [k, C]
    assignments: torch.Tensor  # [N]


def kmeans_colors(
    samples: torch.Tensor,
    k: int,
    *,
    max_iters: int = 20,
    tol: float = 1e-4,
    seed: int = 1234,
) -> PaletteResult:
    """Simple k-means clustering on color vectors.

    Args:
        samples: Tensor of shape [N, C] containing colour vectors in [0, 1].
        k: Number of clusters.
    """

    if k <= 0 or samples.size(0) == 0:
        raise ValueError("k must be positive and samples must be non-empty")

    generator = torch.Generator(device=samples.device).manual_seed(seed)
    indices = torch.randperm(samples.size(0), generator=generator)[:k]
    centroids = samples[indices].clone()

    for _ in range(max_iters):
        distances = torch.cdist(samples, centroids, p=2)
        assignments = torch.argmin(distances, dim=1)

        new_centroids = torch.stack(
            [samples[assignments == i].mean(dim=0) if (assignments == i).any() else centroids[i]
             for i in range(k)]
        )

        shift = torch.norm(new_centroids - centroids, p=2)
        centroids = new_centroids
        if shift < tol:
            break

    return PaletteResult(colors=centroids, assignments=assignments)


def quantize_palette(tile_colors: torch.Tensor, k: int) -> torch.Tensor:
    """Quantise tile colours to a k-colour palette."""

    if k <= 0:
        return tile_colors

    result = kmeans_colors(tile_colors, k)
    return result.colors[result.assignments]

