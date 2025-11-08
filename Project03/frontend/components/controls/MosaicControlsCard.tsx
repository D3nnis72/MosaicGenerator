'use client';

import { useMemo } from 'react';
import { Cpu, Shuffle } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';

export type FeatureMethod = 'lab' | 'hsv' | 'sobel' | 'hybrid';

export interface MosaicControlsState {
  cellSize: number;
  outputTileSize: number;
  blendFactor: number;
  topK: number;
  reuseLimit: number;
  featureMethod: FeatureMethod;
  paletteSize: number;
  applyDither: boolean;
  preferGpu: boolean;
  seed: number;
}

interface MosaicControlsCardProps {
  state: MosaicControlsState;
  onChange: (partial: Partial<MosaicControlsState>) => void;
  onRandomizeSeed?: () => void;
}

export function MosaicControlsCard({
  state,
  onChange,
  onRandomizeSeed,
}: MosaicControlsCardProps) {
  const sliders = useMemo(
    () =>
      [
        {
          id: 'cellSize',
          label: 'Cell Size',
          min: 8,
          max: 120,
          step: 1,
          value: state.cellSize,
          description: 'Grid size in pixels for feature matching',
        },
        {
          id: 'outputTileSize',
          label: 'Tile Size',
          min: 16,
          max: 160,
          step: 4,
          value: state.outputTileSize,
          description: 'Rendered tile size in the final mosaic',
        },
        {
          id: 'blendFactor',
          label: 'Blend',
          min: 0,
          max: 1,
          step: 0.05,
          value: state.blendFactor,
          description:
            'Blend original patch into tiles for smoother transitions',
        },
        {
          id: 'topK',
          label: 'Top-K',
          min: 1,
          max: 12,
          step: 1,
          value: state.topK,
          description: 'Randomly pick among the K best tile matches',
        },
        {
          id: 'reuseLimit',
          label: 'Reuse Limit',
          min: 0,
          max: 40,
          step: 1,
          value: state.reuseLimit,
          description: 'Maximum times a tile can be reused (0 = unlimited)',
        },
        {
          id: 'paletteSize',
          label: 'Palette',
          min: 4,
          max: 64,
          step: 1,
          value: state.paletteSize,
          description: 'Palette size for fallback color mosaic',
        },
      ] as const,
    [state]
  );

  return (
    <Card>
      <CardHeader className='pb-4'>
        <CardTitle>Engine Controls</CardTitle>
        <CardDescription>
          Feature extraction, randomness, and fallback tuning.
        </CardDescription>
      </CardHeader>
      <CardContent className='space-y-6 pt-0'>
        <div className='grid gap-5 md:grid-cols-2'>
          <div className='space-y-3'>
            <Label className='text-xs uppercase tracking-wide text-muted-foreground'>
              Feature Method
            </Label>
            <Select
              value={state.featureMethod}
              onValueChange={(value: FeatureMethod) =>
                onChange({ featureMethod: value })
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent className='bg-background/95 backdrop-blur-md'>
                <SelectItem value='lab'>Lab mean color</SelectItem>
                <SelectItem value='hsv'>HSV histogram</SelectItem>
                <SelectItem value='sobel'>Sobel energy</SelectItem>
                <SelectItem value='hybrid'>Hybrid (Lab + Sobel)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className='space-y-3'>
            <Label className='text-xs uppercase tracking-wide text-muted-foreground'>
              Seed
            </Label>
            <div className='flex items-center gap-3'>
              <Input
                type='number'
                value={state.seed}
                onChange={(event) =>
                  onChange({ seed: Number(event.target.value) })
                }
                className='w-32'
              />
              <Button
                type='button'
                variant='ghost'
                size='sm'
                onClick={onRandomizeSeed}
              >
                <Shuffle className='h-4 w-4' />
              </Button>
            </div>
          </div>
        </div>

        <div className='grid gap-4'>
          {sliders.map((slider) => (
            <div key={slider.id} className='space-y-2'>
              <div className='flex items-center justify-between text-sm'>
                <Label className='text-sm font-medium text-foreground'>
                  {slider.label}
                </Label>
                <span className='tabular-nums text-xs text-muted-foreground'>
                  {slider.id === 'blendFactor'
                    ? slider.value.toFixed(2)
                    : slider.value}
                </span>
              </div>
              <Slider
                value={[slider.value]}
                min={slider.min}
                max={slider.max}
                step={slider.step}
                onValueChange={([value]) =>
                  onChange({
                    [slider.id]:
                      slider.id === 'blendFactor'
                        ? Number(value)
                        : Math.round(value),
                  } as Partial<MosaicControlsState>)
                }
              />
              <p className='text-xs text-muted-foreground'>
                {slider.description}
              </p>
            </div>
          ))}
        </div>

        <div className='grid gap-4 md:grid-cols-2'>
          <div className='flex items-center justify-between rounded-xl border border-border/60 bg-muted/20 px-4 py-3'>
            <div>
              <p className='text-sm font-medium'>GPU Acceleration</p>
              <p className='text-xs text-muted-foreground'>
                Run Torch on CUDA when available
              </p>
            </div>
            <Switch
              checked={state.preferGpu}
              onCheckedChange={(checked) => onChange({ preferGpu: checked })}
            >
              <span className='sr-only'>Toggle GPU</span>
            </Switch>
          </div>
          <div className='flex items-center justify-between rounded-xl border border-border/60 bg-muted/20 px-4 py-3'>
            <div>
              <p className='text-sm font-medium'>Fallback Dithering</p>
              <p className='text-xs text-muted-foreground'>
                Enable Floyd–Steinberg on color fallback
              </p>
            </div>
            <Switch
              checked={state.applyDither}
              onCheckedChange={(checked) => onChange({ applyDither: checked })}
            >
              <span className='sr-only'>Toggle dithering</span>
            </Switch>
          </div>
        </div>

        <div className='rounded-xl border border-border/60 bg-muted/20 px-4 py-3 text-xs text-muted-foreground'>
          <p className='flex items-center gap-2 text-sm text-foreground'>
            <Cpu className='h-4 w-4 text-primary' />
            Engine Tips
          </p>
          <ul className='mt-2 space-y-1 list-disc pl-5'>
            <li>Lower cell size + GPU yields higher fidelity matches.</li>
            <li>Increase Top-K with randomness for varied textures.</li>
            <li>Reuse limit prevents overused tiles in large mosaics.</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}
