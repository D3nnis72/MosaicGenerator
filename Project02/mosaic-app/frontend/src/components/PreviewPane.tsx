"use client";

import clsx from "clsx";
import type { CSSProperties } from "react";
import { MosaicMeta } from "@/lib/api";

type PreviewPaneProps = {
  originalUrl?: string | null;
  mosaicUrl?: string | null;
  meta?: MosaicMeta | null;
  view: "original" | "mosaic" | "side-by-side";
  onViewChange: (view: "original" | "mosaic" | "side-by-side") => void;
  showGrid: boolean;
  onToggleGrid: (next: boolean) => void;
};

const viewOptions: PreviewPaneProps["view"][] = ["original", "mosaic", "side-by-side"];

function gridOverlayStyle(meta?: MosaicMeta | null, active?: boolean) {
  if (!meta || !active) return undefined;
  const rows = meta.rows;
  const cols = meta.cols;
  return {
    backgroundImage:
      "linear-gradient(rgba(255,255,255,0.2) 1px, transparent 1px)," +
      "linear-gradient(90deg, rgba(255,255,255,0.2) 1px, transparent 1px)",
    backgroundSize: `${100 / cols}% ${100 / rows}%`,
  } satisfies CSSProperties;
}

export function PreviewPane({
  originalUrl,
  mosaicUrl,
  meta,
  view,
  onViewChange,
  showGrid,
  onToggleGrid,
}: PreviewPaneProps) {
  const overlayStyle = gridOverlayStyle(meta, showGrid);

  return (
    <div className="space-y-4 rounded-xl border border-slate-800 bg-slate-900/40 p-4">
      <div className="flex items-center justify-between">
        <div className="flex gap-2">
          {viewOptions.map((option) => (
            <button
              key={option}
              onClick={() => onViewChange(option)}
              className={clsx(
                "rounded-md px-3 py-1 text-sm transition",
                view === option ? "bg-slate-700 text-white" : "bg-slate-800 text-slate-300 hover:bg-slate-700",
              )}
            >
              {option === "side-by-side" ? "Side by side" : option.charAt(0).toUpperCase() + option.slice(1)}
            </button>
          ))}
        </div>
        <label className="flex items-center gap-2 text-sm text-slate-300">
          <input
            type="checkbox"
            checked={showGrid}
            onChange={(event) => onToggleGrid(event.target.checked)}
            className="h-4 w-4 rounded border-slate-700 bg-slate-900"
          />
          Show grid
        </label>
      </div>

      <div className="grid gap-4" style={{ gridTemplateColumns: view === "side-by-side" ? "1fr 1fr" : "1fr" }}>
        {(view === "original" || view === "side-by-side") && (
          <div className="relative overflow-hidden rounded-lg border border-slate-800 bg-slate-950/60">
            {originalUrl ? (
              <img src={originalUrl} alt="Original" className="h-full w-full object-contain" />
            ) : (
              <EmptyState label="Upload an image to preview" />
            )}
          </div>
        )}

        {(view === "mosaic" || view === "side-by-side") && (
          <div className="relative overflow-hidden rounded-lg border border-slate-800 bg-slate-950/60">
            {mosaicUrl ? (
              <div className="relative">
                <img src={mosaicUrl} alt="Mosaic" className="h-full w-full object-contain" />
                {showGrid && meta ? (
                  <div className="pointer-events-none absolute inset-0" style={overlayStyle} />
                ) : null}
              </div>
            ) : (
              <EmptyState label="Generate a mosaic to preview" />
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function EmptyState({ label }: { label: string }) {
  return (
    <div className="flex h-64 items-center justify-center text-sm text-slate-500">
      {label}
    </div>
  );
}

