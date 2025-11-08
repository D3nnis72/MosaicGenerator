import { Info } from "lucide-react";

export function UploadHint() {
  return (
    <div className="flex items-start gap-3 rounded-xl border border-dashed border-border/60 bg-muted/30 p-3 text-sm text-muted-foreground">
      <Info className="mt-0.5 h-4 w-4 text-primary" />
      <p>
        Mix-and-match tiles by selecting a dataset or uploading your own folder. When nothing is provided, the backend falls back to a color mosaic so you always get a result.
      </p>
    </div>
  );
}
