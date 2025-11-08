"use client";

import { Loader2 } from "lucide-react";

import { cn } from "@/lib/utils";

interface ProgressOverlayProps {
  active: boolean;
  message?: string;
}

export function ProgressOverlay({ active, message }: ProgressOverlayProps) {
  return (
    <div
      className={cn(
        "pointer-events-none absolute inset-0 flex items-center justify-center rounded-2xl bg-background/70 backdrop-blur-sm transition-opacity",
        active ? "opacity-100" : "opacity-0"
      )}
    >
      <div className="flex flex-col items-center gap-2 text-sm text-muted-foreground">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
        <p>{message ?? "Generating mosaic..."}</p>
      </div>
    </div>
  );
}
