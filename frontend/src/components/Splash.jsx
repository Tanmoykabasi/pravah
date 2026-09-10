import { useEffect, useState } from 'react';
import { ShieldCheck, Waves, ArrowRight, CheckCircle2, RefreshCcw } from 'lucide-react';

const STAGES = [
  { at: 20, label: 'Polling LoRa sensor mesh…' },
  { at: 45, label: 'Calibrating river gauge telemetry…' },
  { at: 70, label: 'Caching 1800 m hazard contours offline…' },
  { at: 90, label: 'Indexing GeoJSON into IndexedDB…' },
  { at: 100, label: 'System ready · live early warning active' },
];

export default function Splash({ onDone }) {
  const [pct, setPct] = useState(8);
  const [stage, setStage] = useState(STAGES[0].label);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const t = setInterval(() => {
      setPct((p) => {
        const next = Math.min(100, p + Math.floor(Math.random() * 11) + 4);
        const s = STAGES.find((x) => p <= x.at) || STAGES[STAGES.length - 1];
        setStage(s.label);
        if (next >= 100) {
          clearInterval(t);
          setReady(true);
        }
        return next;
      });
    }, 280);
    return () => clearInterval(t);
  }, []);

  return (
    <div className="relative flex min-h-screen w-full flex-col bg-sky-soft">
      {/* Soft aurora blobs */}
      <div className="pointer-events-none absolute -left-32 -top-32 h-96 w-96 rounded-full bg-sky-200/60 blur-3xl" />
      <div className="pointer-events-none absolute -right-32 top-40 h-96 w-96 rounded-full bg-sky-300/50 blur-3xl" />
      <div className="pointer-events-none absolute bottom-0 left-1/2 h-80 w-[60%] -translate-x-1/2 rounded-full bg-white/40 blur-3xl" />

      <div className="relative z-10 mx-auto flex w-full max-w-3xl flex-1 flex-col items-stretch justify-between gap-12 px-6 py-10">
        {/* Top metadata */}
        <div className="flex flex-col items-center gap-3 text-center">
          <span className="pill pill-info">
            <ShieldCheck className="h-3.5 w-3.5" />
            NDMA · Sensor Mesh Online
          </span>
          <span className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-sky-700">
            <span className="h-2 w-2 animate-soft-pulse rounded-full bg-sky-500" />
            Tactical Early Warning Mode
          </span>
        </div>

        {/* Center branding */}
        <div className="flex flex-1 flex-col items-center justify-center text-center">
          <div className="relative mb-6 flex items-center justify-center">
            <div className="absolute h-32 w-32 rounded-full bg-sky-300/40 blur-2xl animate-soft-pulse" />
            <div className="relative flex h-24 w-24 items-center justify-center rounded-3xl bg-white/80 shadow-glass-lg ring-1 ring-sky-100 backdrop-blur-xl">
              <Waves className="h-12 w-12 text-sky-600" strokeWidth={1.6} />
            </div>
          </div>
          <h1 className="font-display text-5xl font-bold tracking-[0.18em] text-sky-900 md:text-6xl">
            PRAVAH
          </h1>
          <p className="mt-3 max-w-md text-sm text-slate-600">
            Predictive Runoff Assessment &amp; Vulnerability Alert Hub
          </p>
          <div className="mt-5 inline-flex items-center gap-2 rounded-full border border-sky-100 bg-white/70 px-3.5 py-1.5 text-[11px] font-semibold uppercase tracking-widest text-sky-800 shadow-glass">
            <span className="h-2 w-2 rounded-full bg-sky-500" />
            Teesta River Basin · 27.60°N · 88.64°E
          </div>
        </div>

        {/* Bottom sync card */}
        <div className="glass-strong glass-pad-lg space-y-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm font-semibold text-slate-700">
              <RefreshCcw className="h-4 w-4 animate-spin text-sky-600" />
              {stage}
            </div>
            <span className="font-display text-base font-bold text-sky-700 tabular">
              {pct}%
            </span>
          </div>

          <div className="h-2.5 w-full overflow-hidden rounded-full bg-sky-100/80">
            <div
              className="h-full rounded-full bg-gradient-to-r from-sky-400 to-sky-600 shadow-[0_0_16px_rgba(14,165,233,0.55)] transition-all duration-300 ease-out"
              style={{ width: `${pct}%` }}
            />
          </div>

          <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-500">
            <span className="inline-flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
              Last sync · 2 h ago
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-md bg-sky-50 px-2 py-1 font-semibold text-sky-700 ring-1 ring-sky-100">
              14 LoRa Towers Online
            </span>
            <span className="font-display text-[11px] font-bold text-sky-700">
              LATENCY 42 ms
            </span>
          </div>

          <button
            type="button"
            onClick={onDone}
            disabled={!ready}
            className={`flex w-full items-center justify-center gap-2 rounded-2xl py-4 font-display text-sm font-bold uppercase tracking-widest transition-all duration-300 ${
              ready
                ? 'bg-sky-600 text-white shadow-soft-sky hover:bg-sky-700 active:scale-[0.98]'
                : 'cursor-not-allowed bg-slate-100 text-slate-400'
            } ${ready ? 'animate-soft-pulse' : ''}`}
          >
            {ready ? (
              <>
                <CheckCircle2 className="h-4.5 w-4.5" />
                Enter Live Dashboard
                <ArrowRight className="h-4 w-4" />
              </>
            ) : (
              <>Preparing telemetry stream…</>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
