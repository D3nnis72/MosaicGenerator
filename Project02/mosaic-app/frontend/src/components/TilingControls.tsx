"use client";

import * as Tabs from "@radix-ui/react-tabs";
import clsx from "clsx";

type TilingControlsProps = {
  tilingMode: "grid" | "tile";
  rows: number;
  cols: number;
  tilePx: number;
  mode: "rgb" | "grayscale";
  paletteK: number;
  policy: "crop_to_multiple" | "pad_reflect_to_multiple";
  onUpdate: (partial: Partial<Omit<TilingControlsProps, "onUpdate">>) => void;
};

export function TilingControls({
  tilingMode,
  rows,
  cols,
  tilePx,
  mode,
  paletteK,
  policy,
  onUpdate,
}: TilingControlsProps) {
  return (
    <div className="space-y-4 rounded-xl border border-slate-800 bg-slate-900/40 p-4">
      <Tabs.Root value={tilingMode} onValueChange={(value) => onUpdate({ tilingMode: value as "grid" | "tile" })}>
        <Tabs.List className="mb-4 inline-flex rounded-md border border-slate-700 bg-slate-800/60 p-1">
          <Tabs.Trigger
            value="grid"
            className={clsx(
              "rounded px-3 py-1 text-sm transition",
              tilingMode === "grid" ? "bg-slate-700 text-white" : "text-slate-300 hover:bg-slate-700/40",
            )}
          >
            Rows & Columns
          </Tabs.Trigger>
          <Tabs.Trigger
            value="tile"
            className={clsx(
              "rounded px-3 py-1 text-sm transition",
              tilingMode === "tile" ? "bg-slate-700 text-white" : "text-slate-300 hover:bg-slate-700/40",
            )}
          >
            Tile Size
          </Tabs.Trigger>
        </Tabs.List>

        <Tabs.Content value="grid" className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <label className="flex flex-col gap-1 text-sm text-slate-300">
              Rows
              <input
                type="number"
                min={1}
                value={rows}
                onChange={(event) => onUpdate({ rows: Number(event.target.value) })}
                className="rounded-md border border-slate-700 bg-slate-800 px-3 py-2 text-slate-100 focus:border-slate-500 focus:outline-none"
              />
            </label>
            <label className="flex flex-col gap-1 text-sm text-slate-300">
              Columns
              <input
                type="number"
                min={1}
                value={cols}
                onChange={(event) => onUpdate({ cols: Number(event.target.value) })}
                className="rounded-md border border-slate-700 bg-slate-800 px-3 py-2 text-slate-100 focus:border-slate-500 focus:outline-none"
              />
            </label>
          </div>
        </Tabs.Content>

        <Tabs.Content value="tile" className="space-y-3">
          <label className="flex flex-col gap-1 text-sm text-slate-300">
            Tile size (px)
            <input
              type="number"
              min={1}
              value={tilePx}
              onChange={(event) => onUpdate({ tilePx: Number(event.target.value) })}
              className="rounded-md border border-slate-700 bg-slate-800 px-3 py-2 text-slate-100 focus:border-slate-500 focus:outline-none"
            />
          </label>
        </Tabs.Content>
      </Tabs.Root>

      <div className="grid grid-cols-2 gap-3">
        <label className="flex flex-col gap-1 text-sm text-slate-300">
          Colour mode
          <select
            value={mode}
            onChange={(event) => onUpdate({ mode: event.target.value as "rgb" | "grayscale" })}
            className="rounded-md border border-slate-700 bg-slate-800 px-3 py-2 text-slate-100 focus:border-slate-500 focus:outline-none"
          >
            <option value="rgb">RGB</option>
            <option value="grayscale">Grayscale</option>
          </select>
        </label>

        <label className="flex flex-col gap-1 text-sm text-slate-300">
          Palette k
          <input
            type="number"
            min={0}
            max={12}
            value={paletteK}
            onChange={(event) => onUpdate({ paletteK: Number(event.target.value) })}
            className="rounded-md border border-slate-700 bg-slate-800 px-3 py-2 text-slate-100 focus:border-slate-500 focus:outline-none"
          />
        </label>

        <label className="col-span-2 flex flex-col gap-1 text-sm text-slate-300">
          Policy
          <select
            value={policy}
            onChange={(event) =>
              onUpdate({ policy: event.target.value as "crop_to_multiple" | "pad_reflect_to_multiple" })
            }
            className="rounded-md border border-slate-700 bg-slate-800 px-3 py-2 text-slate-100 focus:border-slate-500 focus:outline-none"
          >
            <option value="crop_to_multiple">Crop to multiple</option>
            <option value="pad_reflect_to_multiple">Pad (reflect)</option>
          </select>
        </label>
      </div>
    </div>
  );
}

