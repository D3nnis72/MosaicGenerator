"use client";

import { Layers, RefreshCw } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export interface DatasetOption {
  name: string;
  numImages: number;
  samples: string[];
  metadata?: Record<string, unknown>;
}

interface TileDatasetSelectorProps {
  datasets: DatasetOption[];
  value: string | null;
  onChange: (value: string | null) => void;
  onRefresh?: () => void;
  loading?: boolean;
}

const NONE_OPTION = "__none__";

export function TileDatasetSelector({ datasets, value, onChange, onRefresh, loading }: TileDatasetSelectorProps) {
  return (
    <Card>
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-base">
          <Layers className="h-4 w-4 text-primary" />
          Tile Dataset
        </CardTitle>
        <CardDescription>Select a curated tile set or stick with custom uploads.</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4 pt-0">
        <div className="flex items-center gap-2">
          <Label className="text-xs uppercase tracking-wide text-muted-foreground">Available sets</Label>
          {onRefresh && (
            <Button type="button" variant="ghost" size="sm" onClick={onRefresh} disabled={loading}>
              <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            </Button>
          )}
        </div>
        <Select value={value ?? NONE_OPTION} onValueChange={(val) => onChange(val === NONE_OPTION ? null : val)}>
          <SelectTrigger>
            <SelectValue placeholder="Choose dataset or none" />
          </SelectTrigger>
          <SelectContent className="bg-background/95 backdrop-blur-sm">
            <SelectGroup>
              <SelectLabel>Datasets</SelectLabel>
              <SelectItem value={NONE_OPTION}>None (upload tiles)</SelectItem>
              {datasets.map((dataset) => (
                <SelectItem key={dataset.name} value={dataset.name}>
                  {dataset.name} · {dataset.numImages} tiles
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>
        {value && (
          <div className="rounded-xl border border-border/60 bg-muted/30 p-3 text-xs text-muted-foreground">
            <p className="font-medium text-foreground">{value}</p>
            {datasets
              .find((dataset) => dataset.name === value)
              ?.metadata?.description && <p>{String(datasets.find((d) => d.name === value)?.metadata?.description)}</p>}
            <p className="mt-2 text-[11px] uppercase tracking-wide">Samples</p>
            <div className="mt-1 flex flex-wrap gap-1 text-[11px]">
              {datasets
                .find((dataset) => dataset.name === value)
                ?.samples.slice(0, 6)
                .map((sample) => (
                  <span key={sample} className="rounded bg-secondary px-2 py-0.5">
                    {sample}
                  </span>
                ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
