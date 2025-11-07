"use client";

import { useEffect, useMemo, useState } from "react";

import { ActionBar } from "@/components/ActionBar";
import { ImageUploaderCard } from "@/components/ImageUploaderCard";
import { MetaBar } from "@/components/MetaBar";
import { PreviewPane } from "@/components/PreviewPane";
import { TilingControls } from "@/components/TilingControls";
import { generateMosaic, MosaicMeta, MosaicResponse } from "@/lib/api";

const DEFAULT_ROWS = 48;
const DEFAULT_COLS = 36;
const DEFAULT_TILE = 20;

export default function Page() {
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [result, setResult] = useState<MosaicResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [view, setView] = useState<"original" | "mosaic" | "side-by-side">("side-by-side");
  const [showGrid, setShowGrid] = useState(true);

  const [tilingMode, setTilingMode] = useState<"grid" | "tile">("grid");
  const [rows, setRows] = useState(DEFAULT_ROWS);
  const [cols, setCols] = useState(DEFAULT_COLS);
  const [tilePx, setTilePx] = useState(DEFAULT_TILE);
  const [mode, setMode] = useState<"rgb" | "grayscale">("grayscale");
  const [paletteK, setPaletteK] = useState(6);
  const [policy, setPolicy] = useState<"crop_to_multiple" | "pad_reflect_to_multiple">("crop_to_multiple");

  useEffect(() => {
    if (!file) {
      setPreviewUrl(null);
      return;
    }
    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);
    return () => URL.revokeObjectURL(objectUrl);
  }, [file]);

  const disableRun = useMemo(() => !file, [file]);

  const meta: MosaicMeta | null = result?.meta ?? null;

  async function handleRun() {
    if (!file) return;
    setLoading(true);
    setError(null);
    try {
      const payload = {
        file,
        mode,
        paletteK,
        policy,
        tilingMode,
        rows: tilingMode === "grid" ? rows : undefined,
        cols: tilingMode === "grid" ? cols : undefined,
        tilePx: tilingMode === "tile" ? tilePx : undefined,
      } as const;
      const response = await generateMosaic(payload);
      setResult(response);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
      setResult(null);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <h1 className="text-3xl font-semibold">Mosaic Builder</h1>
        <p className="text-sm text-slate-400">
          Upload an image, tweak tiling and palette controls, and generate a Conv2d-driven mosaic.
        </p>
      </header>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-4">
          <ImageUploaderCard previewUrl={previewUrl} onFileChange={setFile} />
          <TilingControls
            tilingMode={tilingMode}
            rows={rows}
            cols={cols}
            tilePx={tilePx}
            mode={mode}
            paletteK={paletteK}
            policy={policy}
            onUpdate={(partial) => {
              if (partial.tilingMode) setTilingMode(partial.tilingMode);
              if (partial.rows !== undefined) setRows(partial.rows);
              if (partial.cols !== undefined) setCols(partial.cols);
              if (partial.tilePx !== undefined) setTilePx(partial.tilePx);
              if (partial.mode) setMode(partial.mode);
              if (partial.paletteK !== undefined) setPaletteK(partial.paletteK);
              if (partial.policy) setPolicy(partial.policy);
            }}
          />
          <ActionBar
            onRun={handleRun}
            loading={loading}
            disableRun={disableRun}
            downloadUrl={result?.images.preview_mosaic}
          />
          {error && (
            <div className="rounded-md border border-red-500/40 bg-red-500/10 px-3 py-2 text-sm text-red-200">
              {error}
            </div>
          )}
        </div>

        <div className="space-y-4">
          <PreviewPane
            originalUrl={previewUrl ?? result?.images.preview_original}
            mosaicUrl={result?.images.preview_mosaic}
            meta={meta}
            view={view}
            onViewChange={setView}
            showGrid={showGrid}
            onToggleGrid={setShowGrid}
          />
          <MetaBar meta={meta} />
        </div>
      </div>
    </div>
  );
}

