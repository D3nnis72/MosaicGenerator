"use client";

import { useCallback, useState } from "react";

import type { MosaicMetadata } from "@/components/preview/MosaicPreview";
import { generateMosaic } from "@/services/apiClient";

interface GenerateOptions {
  target: File;
  tiles: File[];
  dataset: string | null;
  settings: Record<string, unknown>;
}

export interface MosaicResult {
  image: string;
  metadata: MosaicMetadata;
}

export function useMosaicEngine() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<MosaicResult | null>(null);

  const run = useCallback(async ({ target, tiles, dataset, settings }: GenerateOptions) => {
    setLoading(true);
    setError(null);
    try {
      const response = await generateMosaic({
        target,
        tiles,
        dataset,
        settings,
      });
      setResult({
        image: response.image,
        metadata: response.metadata as MosaicMetadata,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unexpected error");
      setResult(null);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    loading,
    error,
    result,
    setError,
    run,
  };
}
