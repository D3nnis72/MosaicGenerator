"use client";

import useSWR from "swr";

import type { DatasetOption } from "@/components/upload/TileDatasetSelector";
import { fetchDatasets } from "@/services/apiClient";

export function useDatasetList() {
  const { data, error, isLoading, mutate } = useSWR("datasets", fetchDatasets, {
    revalidateOnFocus: false,
  });

  const datasets: DatasetOption[] = (data?.datasets ?? []).map((dataset) => ({
    name: dataset.name,
    numImages: dataset.num_images,
    samples: dataset.samples,
    metadata: dataset.metadata,
  }));

  return {
    datasets,
    loading: isLoading,
    error: error instanceof Error ? error : null,
    refresh: () => mutate(),
  };
}
