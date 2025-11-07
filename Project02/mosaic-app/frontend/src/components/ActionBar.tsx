type ActionBarProps = {
  onRun: () => void;
  loading: boolean;
  disableRun: boolean;
  downloadUrl?: string | null;
};

export function ActionBar({ onRun, loading, disableRun, downloadUrl }: ActionBarProps) {
  return (
    <div className="flex items-center gap-3">
      <button
        onClick={onRun}
        disabled={disableRun || loading}
        className="inline-flex items-center gap-2 rounded-md bg-blue-500 px-4 py-2 text-sm font-semibold text-white transition disabled:cursor-not-allowed disabled:bg-blue-500/50"
      >
        {loading ? "Processing…" : "Generate mosaic"}
      </button>

      <a
        href={downloadUrl ?? undefined}
        download={downloadUrl ? "mosaic.png" : undefined}
        className="rounded-md border border-slate-700 bg-slate-900 px-4 py-2 text-sm text-slate-200 transition hover:border-slate-500"
        aria-disabled={!downloadUrl}
        onClick={(event) => {
          if (!downloadUrl) event.preventDefault();
        }}
      >
        Download
      </a>
    </div>
  );
}

