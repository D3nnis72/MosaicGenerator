import { Gauge, Grid, Timer, Zap } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import type { MosaicMetadata } from "@/components/preview/MosaicPreview";

interface MetricsPanelProps {
  metadata: MosaicMetadata | null;
}

const placeholders = [
  { label: "Grid", icon: Grid, value: "–" },
  { label: "Runtime", icon: Timer, value: "–" },
  { label: "Tiles", icon: Gauge, value: "–" },
  { label: "Mode", icon: Zap, value: "–" },
];

export function MetricsPanel({ metadata }: MetricsPanelProps) {
  const rows = metadata?.grid_rows ?? 0;
  const cols = metadata?.grid_cols ?? 0;
  const runtime = metadata?.runtime_s ? `${metadata.runtime_s.toFixed(2)} s` : "–";
  const tiles = metadata?.unique_tiles_used ?? metadata?.tiles_available ?? "–";
  const mode = metadata?.feature_method ?? metadata?.fallback ?? "–";

  const metrics = [
    { label: "Grid", icon: Grid, value: rows && cols ? `${rows} × ${cols}` : "–" },
    { label: "Runtime", icon: Timer, value: runtime },
    { label: "Tiles", icon: Gauge, value: tiles },
    { label: "Mode", icon: Zap, value: mode },
  ];

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm">Analytics</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-3 pt-0 sm:grid-cols-2">
        {(metadata ? metrics : placeholders).map((metric) => (
          <div
            key={metric.label}
            className="rounded-xl border border-border/60 bg-muted/30 px-4 py-3 text-sm"
          >
            <div className="flex items-center gap-2 text-muted-foreground">
              <metric.icon className="h-4 w-4" />
              <span>{metric.label}</span>
            </div>
            <p className="mt-1 text-base font-semibold text-foreground">{metric.value}</p>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
