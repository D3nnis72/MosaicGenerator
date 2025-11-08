"use client";

import { useCallback, useState } from "react";

import type { MosaicControlsState } from "@/components/controls/MosaicControlsCard";

const DEFAULT_SETTINGS: MosaicControlsState = {
  cellSize: 40,
  outputTileSize: 64,
  blendFactor: 0.15,
  topK: 3,
  reuseLimit: 12,
  featureMethod: "lab",
  paletteSize: 16,
  applyDither: true,
  preferGpu: true,
  seed: 42,
};

export function useMosaicSettings(initial: Partial<MosaicControlsState> = {}) {
  const [settings, setSettings] = useState<MosaicControlsState>({
    ...DEFAULT_SETTINGS,
    ...initial,
  });

  const updateSettings = useCallback((partial: Partial<MosaicControlsState>) => {
    setSettings((current) => ({ ...current, ...partial }));
  }, []);

  const randomizeSeed = useCallback(() => {
    const seed = Math.floor(Math.random() * 10_000);
    setSettings((current) => ({ ...current, seed }));
  }, []);

  return {
    settings,
    updateSettings,
    randomizeSeed,
  };
}
