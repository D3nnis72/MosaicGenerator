'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';

const IMAGE_MIME_REGEX = /^image\//;
const IMAGE_EXT_REGEX = /\.(png|jpe?g|bmp|gif|tiff?|webp)$/i;

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

  const addTiles = useCallback((files: File[] | null) => {
    if (!files || files.length === 0) return;
    const filtered = files.filter((file) => {
      if (IMAGE_MIME_REGEX.test(file.type)) return true;
      return IMAGE_EXT_REGEX.test(file.name);
    });
    if (filtered.length === 0) return;
    setTileFiles((current) => [...current, ...filtered]);
  }, []);

  const removeTile = useCallback((index: number) => {
    setTileFiles((current) => current.filter((_, i) => i !== index));
  }, []);

  const clearTiles = useCallback(() => setTileFiles([]), []);

  const summary = useMemo(() => {
    if (tileFiles.length === 0) return 'No custom tiles';
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
