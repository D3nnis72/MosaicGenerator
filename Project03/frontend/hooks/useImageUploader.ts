"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

export function useImageUploader() {
  const [targetFile, setTargetFile] = useState<File | null>(null);
  const [targetPreview, setTargetPreview] = useState<string | null>(null);
  const [tileFiles, setTileFiles] = useState<File[]>([]);

  useEffect(() => {
    if (!targetFile) {
      setTargetPreview(null);
      return;
    }
    const url = URL.createObjectURL(targetFile);
    setTargetPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [targetFile]);

  const updateTarget = useCallback((file: File | null) => {
    setTargetFile(file);
  }, []);

  const addTiles = useCallback((files: FileList | File[] | null) => {
    if (!files) return;
    const list = Array.from(files);
    setTileFiles((current) => [...current, ...list]);
  }, []);

  const removeTile = useCallback((index: number) => {
    setTileFiles((current) => current.filter((_, i) => i !== index));
  }, []);

  const clearTiles = useCallback(() => setTileFiles([]), []);

  const summary = useMemo(() => {
    if (tileFiles.length === 0) return "No custom tiles";
    if (tileFiles.length === 1) return `${tileFiles[0].name}`;
    return `${tileFiles.length} custom tiles`;
  }, [tileFiles]);

  return {
    targetFile,
    targetPreview,
    updateTarget,
    tileFiles,
    addTiles,
    removeTile,
    clearTiles,
    tileSummary: summary,
  };
}
