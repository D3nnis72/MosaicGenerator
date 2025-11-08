'use client';

import { useCallback, useState } from 'react';
import { FolderUp, Trash2, X } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

type FileEntry = FileSystemEntry & {
  readonly isFile: true;
  file(
    successCallback: (file: File) => void,
    errorCallback?: (error: DOMException) => void
  ): void;
};

type DirectoryEntry = FileSystemEntry & {
  readonly isDirectory: true;
  createReader(): FileSystemDirectoryReader;
};

interface TileUploadManagerProps {
  tiles: File[];
  onAdd: (files: File[] | null) => void;
  onRemove: (index: number) => void;
  onClear: () => void;
}

function isFileEntry(entry: FileSystemEntry): entry is FileEntry {
  return entry.isFile;
}

function isDirectoryEntry(entry: FileSystemEntry): entry is DirectoryEntry {
  return entry.isDirectory;
}

async function collectFilesFromEntry(entry: FileSystemEntry): Promise<File[]> {
  if (isFileEntry(entry)) {
    return await new Promise<File[]>((resolve, reject) => {
      entry.file(
        (file) => resolve([file]),
        (error) => reject(error)
      );
    });
  }

  if (isDirectoryEntry(entry)) {
    const reader = entry.createReader();
    const entries: FileSystemEntry[] = [];

    const readAll = (): Promise<void> =>
      new Promise((resolve, reject) => {
        const readChunk = () => {
          reader.readEntries(
            (batch) => {
              if (batch.length === 0) {
                resolve();
                return;
              }
              entries.push(...batch);
              readChunk();
            },
            (error) => reject(error)
          );
        };
        readChunk();
      });

    await readAll();
    const nestedFiles = await Promise.all(
      entries.map((child) => collectFilesFromEntry(child))
    );
    return nestedFiles.flat();
  }

  return [];
}

async function extractDroppedFiles(
  event: React.DragEvent<HTMLLabelElement>
): Promise<File[]> {
  const items = event.dataTransfer?.items;
  if (!items) {
    return Array.from(event.dataTransfer?.files ?? []);
  }

  const filePromises = Array.from(items)
    .filter((item) => item.kind === 'file')
    .map(async (item) => {
      const entry = (item as DataTransferItem & {
        webkitGetAsEntry?: () => FileSystemEntry | null;
      }).webkitGetAsEntry?.();
      if (entry) {
        try {
          const files = await collectFilesFromEntry(entry);
          return files;
        } catch {
          const file = item.getAsFile();
          return file ? [file] : [];
        }
      }
      const fallbackFile = item.getAsFile();
      return fallbackFile ? [fallbackFile] : [];
    });

  const nested = await Promise.all(filePromises);
  return nested.flat();
}

export function TileUploadManager({
  tiles,
  onAdd,
  onRemove,
  onClear,
}: TileUploadManagerProps) {
  const [dragActive, setDragActive] = useState(false);

  const handleChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const files = event.target.files ? Array.from(event.target.files) : [];
      onAdd(files);
      event.target.value = '';
    },
    [onAdd]
  );

  const handleDrop = useCallback(
    async (event: React.DragEvent<HTMLLabelElement>) => {
      event.preventDefault();
      event.stopPropagation();
      setDragActive(false);
      const files = await extractDroppedFiles(event);
      onAdd(files);
    },
    [onAdd]
  );

  return (
    <Card>
      <CardHeader className='pb-4'>
        <CardTitle className='flex items-center gap-2 text-base'>
          <FolderUp className='h-4 w-4 text-primary' />
          Custom Tiles
        </CardTitle>
        <CardDescription>
          Drop a folder of tiles or mix with datasets for hybrid mosaics.
        </CardDescription>
      </CardHeader>
      <CardContent className='space-y-4 pt-0'>
        <label
          className={`flex h-32 cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-border/70 bg-background/40 text-center text-sm text-muted-foreground transition ${
            dragActive
              ? 'border-primary/60 bg-primary/5'
              : 'hover:border-primary/40'
          }`}
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
          onDrop={handleDrop}
        >
          <input
            type='file'
            accept='image/*'
            multiple
            className='hidden'
            onChange={handleChange}
          />
          <p className='font-medium text-foreground'>Add tile images</p>
          <p>
            {tiles.length
              ? `${tiles.length} selected`
              : 'Drop or browse images'}
          </p>
        </label>

        {tiles.length > 0 && (
          <div className='max-h-40 overflow-auto rounded-xl border border-border/60 bg-muted/20'>
            <ul className='divide-y divide-border/60 text-sm'>
              {tiles.map((file, index) => (
                <li
                  key={`${file.name}-${index}`}
                  className='flex items-center justify-between px-4 py-2'
                >
                  <span className='truncate text-muted-foreground'>
                    {file.name}
                  </span>
                  <Button
                    type='button'
                    variant='ghost'
                    size='sm'
                    onClick={() => onRemove(index)}
                  >
                    <X className='h-4 w-4' />
                  </Button>
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className='flex justify-end'>
          <Button
            type='button'
            variant='ghost'
            size='sm'
            onClick={onClear}
            disabled={tiles.length === 0}
          >
            <Trash2 className='mr-2 h-4 w-4' />
            Clear tiles
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
