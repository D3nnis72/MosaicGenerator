"use client";

import { useMemo, useState } from "react";

import { MosaicControlsCard } from "@/components/controls/MosaicControlsCard";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { AppContainer } from "@/components/layout/AppContainer";
import { MosaicPreview } from "@/components/preview/MosaicPreview";
import { MetricsPanel } from "@/components/feedback/MetricsPanel";
import { NotificationToast } from "@/components/feedback/NotificationToast";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { TileDatasetSelector } from "@/components/upload/TileDatasetSelector";
import { TileUploadManager } from "@/components/upload/TileUploadManager";
import { TargetImageUploader } from "@/components/upload/TargetImageUploader";
import { UploadHint } from "@/components/upload/UploadHint";
import { useDatasetList } from "@/hooks/useDatasetList";
import { useImageUploader } from "@/hooks/useImageUploader";
import { useMosaicEngine } from "@/hooks/useMosaicEngine";
import { useMosaicSettings } from "@/hooks/useMosaicSettings";

interface ToastState {
  message: string;
  variant: "success" | "error";
}

export default function MosaicStudioPage() {
  const { targetFile, targetPreview, updateTarget, tileFiles, addTiles, removeTile, clearTiles } = useImageUploader();
  const { datasets, loading: datasetsLoading, error: datasetError, refresh } = useDatasetList();
  const { settings, updateSettings, randomizeSeed } = useMosaicSettings();
  const { loading, error, result, setError, run } = useMosaicEngine();

  const [selectedDataset, setSelectedDataset] = useState<string | null>(null);
  const [toast, setToast] = useState<ToastState | null>(null);

  const payloadSettings = useMemo(
    () => ({
      cell_size: settings.cellSize,
      output_tile_size: settings.outputTileSize,
      blend_factor: settings.blendFactor,
      top_k: settings.topK,
      reuse_limit: settings.reuseLimit,
      feature_method: settings.featureMethod,
      palette_size: settings.paletteSize,
      apply_dither: settings.applyDither,
      prefer_gpu: settings.preferGpu,
      seed: settings.seed,
    }),
    [settings]
  );

  async function handleGenerate() {
    if (!targetFile) {
      setError("Upload a target image first");
      setToast({ message: "Please upload an image", variant: "error" });
      return;
    }
    try {
      setError(null);
      await run({
        target: targetFile,
        tiles: tileFiles,
        dataset: selectedDataset,
        settings: payloadSettings,
      });
      setToast({ message: "Mosaic generated", variant: "success" });
    } catch (err) {
      console.error(err);
      setToast({ message: "Failed to generate mosaic", variant: "error" });
    }
  }

  function handleDownload() {
    if (!result?.image) return;
    const link = document.createElement("a");
    link.href = result.image;
    link.download = "mosaic.png";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  return (
    <AppContainer>
      <Header />

      <div className="grid gap-8 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)]">
        <div className="space-y-6">
          <TargetImageUploader previewUrl={targetPreview} onFileSelect={updateTarget} disabled={loading} />
          <TileDatasetSelector
            datasets={datasets}
            value={selectedDataset}
            onChange={setSelectedDataset}
            onRefresh={refresh}
            loading={datasetsLoading}
          />
          <TileUploadManager tiles={tileFiles} onAdd={addTiles} onRemove={removeTile} onClear={clearTiles} />
          <UploadHint />
        </div>

        <div className="space-y-6">
          <div className="relative">
            <MosaicPreview
              originalUrl={targetPreview}
              mosaicUrl={result?.image ?? null}
              metadata={result?.metadata ?? null}
              loading={loading}
              onDownload={handleDownload}
            />
          </div>
          <MetricsPanel metadata={result?.metadata ?? null} />
          <Card>
            <CardContent className="flex items-center justify-between gap-4 p-6">
              <div className="space-y-1">
                <p className="text-sm font-medium">Ready to build the mosaic?</p>
                <p className="text-xs text-muted-foreground">
                  The backend blends dataset tiles with torch.cdist matching. No tiles? Fallback color mosaic kicks in automatically.
                </p>
              </div>
              <Button type="button" size="lg" onClick={handleGenerate} disabled={loading || !targetFile}>
                {loading ? "Generating…" : "Generate Mosaic"}
              </Button>
            </CardContent>
          </Card>
          <MosaicControlsCard state={settings} onChange={updateSettings} onRandomizeSeed={randomizeSeed} />
        </div>
      </div>

      {(error || datasetError) && !toast && (
        <div className="mt-6 rounded-xl border border-red-500/40 bg-red-500/10 p-4 text-sm text-red-200">
          {error ?? datasetError?.message}
        </div>
      )}

      {toast && (
        <div className="fixed bottom-6 right-6">
          <NotificationToast
            message={toast.message}
            variant={toast.variant}
            onDismiss={() => setToast(null)}
          />
        </div>
      )}

      <Footer />
    </AppContainer>
  );
}
