"use client";

import { useMemo } from "react";
import { Download, Eye, EyeOff, ImageOff } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

import { SplitViewSlider } from "./SplitViewSlider";

export interface MosaicMetadata {
  grid_rows?: number;
  grid_cols?: number;
  cell_size?: number;
  runtime_s?: number;
  tiles_available?: number;
  unique_tiles_used?: number;
  feature_method?: string;
  fallback?: string | null;
}

interface MosaicPreviewProps {
  originalUrl: string | null;
  mosaicUrl: string | null;
  metadata: MosaicMetadata | null;
  loading: boolean;
  onDownload?: () => void;
}

export function MosaicPreview({ originalUrl, mosaicUrl, metadata, loading, onDownload }: MosaicPreviewProps) {
  const hasResult = Boolean(mosaicUrl);

  const summary = useMemo(() => {
    if (!metadata) return null;
    return [
      metadata.grid_rows && metadata.grid_cols ? `${metadata.grid_rows}×${metadata.grid_cols} cells` : null,
      metadata.cell_size ? `${metadata.cell_size}px patches` : null,
      metadata.unique_tiles_used ? `${metadata.unique_tiles_used} tiles used` : null,
      metadata.runtime_s ? `${metadata.runtime_s.toFixed(1)}s` : null,
      metadata.fallback ? `Fallback: ${metadata.fallback}` : null,
    ]
      .filter(Boolean)
      .join(" · ");
  }, [metadata]);

  return (
    <Card className="h-full">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between gap-4">
          <div>
            <CardTitle>Preview</CardTitle>
            <CardDescription>Compare original and generated mosaic interactively.</CardDescription>
          </div>
          <Button type="button" variant="outline" size="sm" onClick={onDownload} disabled={!hasResult}>
            <Download className="mr-2 h-4 w-4" />
            Download PNG
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4 pt-0">
        <div className="relative">
          {loading && (
            <div className="absolute inset-0 z-10 flex items-center justify-center rounded-2xl border border-border/60 bg-background/80 backdrop-blur">
              <Eye className="h-6 w-6 animate-pulse text-primary" />
            </div>
          )}
          {hasResult ? (
            <SplitViewSlider originalUrl={originalUrl} mosaicUrl={mosaicUrl} />
          ) : originalUrl ? (
            <div className="relative h-[420px] w-full overflow-hidden rounded-2xl border border-border/60">
              <img src={originalUrl} alt="Original" className="h-full w-full object-cover" />
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-background/90 to-transparent p-4 text-xs text-muted-foreground">
                Upload tiles or run the generator to see the mosaic.
              </div>
            </div>
          ) : (
            <div className="flex h-[420px] flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-border/60 text-sm text-muted-foreground">
              <ImageOff className="h-8 w-8" />
              <p>No preview yet. Upload an image to get started.</p>
            </div>
          )}
        </div>
        <div className="rounded-xl border border-border/60 bg-muted/30 px-4 py-3 text-sm">
          {summary ? (
            <p className="text-muted-foreground">{summary}</p>
          ) : (
            <p className="flex items-center gap-2 text-muted-foreground">
              <EyeOff className="h-4 w-4" />
              Result metadata will appear after generation.
            </p>)
          }
        </div>
      </CardContent>
    </Card>
  );
}
