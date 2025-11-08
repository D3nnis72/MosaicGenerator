import { Sparkles } from "lucide-react";

export function Header() {
  return (
    <header className="mb-12 space-y-4">
      <div className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-secondary/60 px-3 py-1 text-xs uppercase tracking-widest text-muted-foreground">
        <Sparkles className="h-3.5 w-3.5" />
        Mosaic Studio
      </div>
      <div className="space-y-3">
        <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">Photo Mosaic Playground</h1>
        <p className="max-w-2xl text-base text-muted-foreground">
          Upload an image, pick curated tile datasets, and tune feature matching parameters to craft research-grade mosaics powered by PyTorch + FastAPI.
        </p>
      </div>
    </header>
  );
}
