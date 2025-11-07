'use client';

import { ChangeEvent, DragEvent, useCallback, useState } from 'react';
import clsx from 'clsx';

type ImageUploaderCardProps = {
  previewUrl?: string | null;
  onFileChange: (file: File | null) => void;
};

export function ImageUploaderCard({
  previewUrl,
  onFileChange,
}: ImageUploaderCardProps) {
  const [isDragging, setIsDragging] = useState(false);

  const handleChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0] ?? null;
      onFileChange(file);
    },
    [onFileChange]
  );

  const handleDrop = useCallback(
    (event: DragEvent<HTMLLabelElement>) => {
      event.preventDefault();
      setIsDragging(false);
      const file = event.dataTransfer.files?.[0] ?? null;
      onFileChange(file);
    },
    [onFileChange]
  );

  const handleDragOver = useCallback(
    (event: DragEvent<HTMLLabelElement>) => {
      event.preventDefault();
      if (!isDragging) {
        setIsDragging(true);
      }
    },
    [isDragging]
  );

  const handleDragLeave = useCallback(() => {
    setIsDragging(false);
  }, []);

  return (
    <div className='rounded-xl border border-slate-800 bg-slate-900/40 p-4'>
      <label
        htmlFor='image-upload'
        className={clsx(
          'flex h-48 w-full cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed',
          previewUrl
            ? 'border-slate-700'
            : isDragging
            ? 'border-blue-500 bg-blue-500/10'
            : 'border-slate-800 hover:border-slate-600'
        )}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        {previewUrl ? (
          <img
            src={previewUrl}
            alt='Uploaded preview'
            className='h-full w-full rounded-lg object-cover'
          />
        ) : (
          <>
            <span className='text-sm text-slate-300'>
              Drag & drop or click to upload an image
            </span>
            <span className='text-xs text-slate-500'>
              PNG, JPEG • up to a few MB
            </span>
          </>
        )}
      </label>
      <input
        id='image-upload'
        type='file'
        accept='image/png,image/jpeg,image/jpg'
        onChange={handleChange}
        className='hidden'
      />
    </div>
  );
}
