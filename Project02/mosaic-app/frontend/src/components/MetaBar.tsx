import { MosaicMeta } from '@/lib/api';

type MetaBarProps = {
  meta?: MosaicMeta | null;
};

const badgeClass =
  'rounded-full border border-slate-700 bg-slate-800/80 px-3 py-1 text-xs font-medium text-slate-200';

export function MetaBar({ meta }: MetaBarProps) {
  if (!meta) {
    return (
      <div className='rounded-xl border border-slate-800 bg-slate-900/40 p-3 text-sm text-slate-500'>
        Mosaic metadata will appear here after processing.
      </div>
    );
  }

  return (
    <div className='flex flex-wrap gap-2 rounded-xl border border-slate-800 bg-slate-900/60 p-3'>
      <span className={badgeClass}>
        Input: {meta.input_hw[1]}×{meta.input_hw[0]}
      </span>
      <span className={badgeClass}>
        Processed: {meta.processed_hw[1]}×{meta.processed_hw[0]}
      </span>
      <span className={badgeClass}>
        Grid: {meta.cols}×{meta.rows}
      </span>
      <span className={badgeClass}>
        Tile: {meta.tile_size[1]}×{meta.tile_size[0]} px
      </span>
      <span className={badgeClass}>Mode: {meta.mode}</span>
      <span className={badgeClass}>Palette k: {meta.palette_k}</span>
      <span className={badgeClass}>
        Policy: {meta.policy.replaceAll('_', ' ')}
      </span>
    </div>
  );
}
