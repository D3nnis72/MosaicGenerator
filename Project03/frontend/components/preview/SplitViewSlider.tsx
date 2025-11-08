'use client';

import Image from 'next/image';
import { useRef, useState } from 'react';

import { cn } from '@/lib/utils';

interface SplitViewSliderProps {
  originalUrl: string | null;
  mosaicUrl: string | null;
}

export function SplitViewSlider({
  originalUrl,
  mosaicUrl,
}: SplitViewSliderProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [position, setPosition] = useState(50);

  if (!originalUrl || !mosaicUrl) {
    return null;
  }

  return (
    <div
      ref={containerRef}
      className='relative h-[420px] w-full overflow-hidden rounded-2xl border border-border/60 bg-muted/30'
      onPointerDown={(event) => {
        event.preventDefault();
        const move = (clientX: number) => {
          const rect = containerRef.current?.getBoundingClientRect();
          if (!rect) return;
          const clamped = Math.max(
            0,
            Math.min(1, (clientX - rect.left) / rect.width)
          );
          setPosition(clamped * 100);
        };
        move(event.clientX);
        const handleMove = (e: PointerEvent) => move(e.clientX);
        const handleUp = () => {
          document.removeEventListener('pointermove', handleMove);
          document.removeEventListener('pointerup', handleUp);
        };
        document.addEventListener('pointermove', handleMove);
        document.addEventListener('pointerup', handleUp);
      }}
    >
      <Image
        src={mosaicUrl}
        alt='Mosaic result'
        fill
        className='object-cover'
        sizes='(min-width: 768px) 560px, 100vw'
        priority
      />
      <div
        className='absolute inset-0 overflow-hidden'
        style={{ width: `${position}%` }}
      >
        <div className='relative h-full w-full'>
          <Image
            src={originalUrl}
            alt='Original'
            fill
            className='object-cover'
            sizes='(min-width: 768px) 560px, 100vw'
            priority
          />
        </div>
      </div>
      <div
        className='pointer-events-none absolute inset-y-0'
        style={{ left: `${position}%`, transform: 'translateX(-50%)' }}
      >
        <div className='relative flex h-full items-center'>
          <div className='h-full w-[2px] rounded-full bg-white/80 shadow-[0_0_8px_rgba(255,255,255,0.6)]' />
          <div className='absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/60 bg-white/90 p-1 shadow'>
            <div className='h-2.5 w-2.5 rounded-full bg-primary' />
          </div>
        </div>
      </div>
      <input
        className={cn(
          'absolute inset-0 z-10 h-full w-full cursor-ew-resize opacity-0'
        )}
        type='range'
        min={0}
        max={100}
        value={position}
        onChange={(event) => setPosition(Number(event.target.value))}
      />
      <div className='absolute bottom-3 left-3 flex items-center gap-2 rounded-full bg-background/80 px-3 py-1 text-xs text-muted-foreground'>
        <span>Original</span>
        <span className='text-primary'>vs</span>
        <span>Mosaic</span>
      </div>
    </div>
  );
}
