"use client";

import { useCallback, useState } from "react";
import Image from "next/image";
import { UploadCloud } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface TargetImageUploaderProps {
  previewUrl: string | null;
  onFileSelect: (file: File | null) => void;
  disabled?: boolean;
}

export function TargetImageUploader({ previewUrl, onFileSelect, disabled }: TargetImageUploaderProps) {
  const [dragActive, setDragActive] = useState(false);

  const handleFiles = useCallback(
    (files: FileList | null) => {
      if (!files || files.length === 0) {
        onFileSelect(null);
        return;
      }
      const [file] = files;
      onFileSelect(file);
    },
    [onFileSelect]
  );

  return (
    <Card>
      <CardHeader className="pb-4">
        <CardTitle>Target Image</CardTitle>
        <CardDescription>Drag & drop a photo or pick one from your library.</CardDescription>
      </CardHeader>
      <CardContent className="pt-0">
        <label
          className={`relative flex h-56 w-full cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed border-border/80 bg-background/40 transition ${
            dragActive ? "border-primary/60 bg-primary/5" : "hover:border-primary/40"
          } ${disabled ? "pointer-events-none opacity-60" : ""}`}
          onDragEnter={(event) => {
            event.preventDefault();
            event.stopPropagation();
            setDragActive(true);
          }}
          onDragLeave={(event) => {
            event.preventDefault();
            event.stopPropagation();
            setDragActive(false);
          }}
          onDragOver={(event) => {
            event.preventDefault();
            event.stopPropagation();
          }}
          onDrop={(event) => {
            event.preventDefault();
            event.stopPropagation();
            setDragActive(false);
            handleFiles(event.dataTransfer.files);
          }}
        >
          <input
            type="file"
            accept="image/*"
            className="hidden"
            disabled={disabled}
            onChange={(event) => handleFiles(event.target.files)}
          />
          {previewUrl ? (
            <div className="relative h-full w-full overflow-hidden rounded-xl">
              <Image src={previewUrl} alt="Preview" fill className="object-cover" sizes="(min-width: 768px) 420px, 100vw" />
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center gap-3 text-center text-sm text-muted-foreground">
              <UploadCloud className="h-9 w-9 text-primary" />
              <div>
                <p className="font-medium text-foreground">Drop an image here</p>
                <p>PNG, JPG up to ~10MB</p>
              </div>
              <Button type="button" variant="outline" size="sm" disabled={disabled}>
                Browse files
              </Button>
            </div>
          )}
        </label>
      </CardContent>
    </Card>
  );
}
