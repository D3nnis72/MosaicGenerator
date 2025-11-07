export type MosaicMeta = {
  input_hw: [number, number];
  processed_hw: [number, number];
  rows: number;
  cols: number;
  tile_size: [number, number];
  mode: "rgb" | "grayscale";
  palette_k: number;
  policy: "crop_to_multiple" | "pad_reflect_to_multiple";
  adjustments: Record<string, number>;
};

export type MosaicResponse = {
  meta: MosaicMeta;
  images: {
    preview_original: string;
    preview_mosaic: string;
  };
};

export type MosaicPayload = {
  file: File;
  mode: "rgb" | "grayscale";
  paletteK: number;
  policy: "crop_to_multiple" | "pad_reflect_to_multiple";
  tilingMode: "grid" | "tile";
  rows?: number;
  cols?: number;
  tilePx?: number;
};

export async function generateMosaic(payload: MosaicPayload): Promise<MosaicResponse> {
  const form = new FormData();
  form.append("image", payload.file);
  form.append("mode", payload.mode);
  form.append("palette_k", String(payload.paletteK));
  form.append("policy", payload.policy);

  if (payload.tilingMode === "grid") {
    if (payload.rows != null) form.append("rows", String(payload.rows));
    if (payload.cols != null) form.append("cols", String(payload.cols));
  } else if (payload.tilePx != null) {
    form.append("tile_px", String(payload.tilePx));
  }

  const response = await fetch("/api/mosaic", {
    method: "POST",
    body: form,
  });

  if (!response.ok) {
    const detail = await response.text();
    throw new Error(detail || "Failed to generate mosaic");
  }

  return response.json();
}

