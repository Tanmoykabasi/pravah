import { useEffect, useMemo, useRef, useState } from 'react';
import { Play, Pause, RotateCcw, Wifi, WifiOff, Bell, Activity, ArrowRight } from 'lucide-react';

/**
 * Time-scrubber "Disaster Simulator".
 * Renders a deterministic timeline of T-180 to T-0 minutes before impact
 * and lets the user scrub through it (or auto-play) to see how the basin
 * metrics escalate.
 */
function buildTimeline() {
  const steps = 18;
  const out = [];
  for (let i = 0; i <= steps; i += 1) {
    const t = i / steps;            // 0 .. 1
    const minutes = Math.round(180 - t * 180);
    const offset = 180 - minutes;
    const rainfall = +(8 + t * t * 96).toFixed(1);   // 8 → 104 mm/h
    const gauge = +(0.2 + t * 2.2).toFixed(2);       // 0.20 → 2.40 m
    const flow = Math.min(1, t * 1.05);
    const risk = Math.round(15 + t * 80);
    const status = risk < 30 ? 'SAFE' : risk < 55 ? 'WATCH' : risk < 75 ? 'WARNING' : 'DANGER';
    out.push({ minutes, offset, rainfall, gauge, flow, risk, status });
  }
  return out;
}

function Gauge({ value, max = 100, accent = '#0ea5e9' }) {
  const pct = Math.max(0, Math.min(1, value / max));
  return (
    <div className="relative h-2 w-full overflow-hidden rounded-full bg-slate-100">
      <div
        className="h-full rounded-full transition-all duration-500 ease-out"
        style={{ width: `${pct * 100}%`, background: accent }}
      />
    </div>
  );
}

export default function DrillScreen({ telemetry, onToggleBlackout, isOffline }) {
  const timeline = useMemo(buildTimeline, []);
  const [idx, setIdx] = useState(timeline.length - 6); // start near impact
  const [playing, setPlaying] = useState(false);
  const timer = useRef(null);

  useEffect(() => {
    if (!playing) return;
    timer.current = setInterval(() => {
      setIdx((i) => (i + 1) % timeline.length);
    }, 220);
    return () => clearInterval(timer.current);
  }, [playing, timeline.length]);

  const step = timeline[idx];

  const reset = () => {
    setPlaying(false);
    setIdx(timeline.length - 6);
  };

  return (
    <div className="space-y-6">
      <header>
        <h1 className="font-display text-2xl font-bold text-slate-900">Disaster drill</h1>
        <p className="text-sm text-slate-500">
          Scrub the timeline to rehearse the escalation workflow
        </p>
      </header>

      {/* Timeline scrubber */}
      <div className="glass-strong glass-pad-lg space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="eyebrow">Time to impact</p>
            <p className="font-display mt-1 text-3xl font-bold tracking-tight text-slate-900 tabular">
              T-{String(Math.floor(step.offset / 60)).padStart(2, '0')}:
              {String(step.offset % 60).padStart(2, '0')}:00
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={reset}
              className="flex h-10 w-10 items-center justify-center rounded-xl border border-sky-100 bg-white/70 text-sky-700 transition hover:bg-sky-50"
              aria-label="Reset"
            >
              <RotateCcw className="h-4.5 w-4.5" />
            </button>
            <button
              type="button"
              onClick={() => setPlaying((p) => !p)}
              className="flex h-10 w-10 items-center justify-center rounded-xl bg-sky-600 text-white shadow-soft-sky transition hover:bg-sky-700"
              aria-label={playing ? 'Pause' : 'Play'}
            >
              {playing ? <Pause className="h-4.5 w-4.5" /> : <Play className="h-4.5 w-4.5 translate-x-[1px]" />}
            </button>
          </div>
        </div>

        <input
          type="range"
          className="scrubber"
          min={0}
          max={timeline.length - 1}
          value={idx}
          onChange={(e) => {
            setPlaying(false);
            setIdx(parseInt(e.target.value, 10));
          }}
        />

        <div className="flex justify-between text-[10px] font-semibold uppercase tracking-widest text-slate-400">
          <span>T-3:00:00</span>
          <span>T-1:30:00</span>
          <span>T-0:00:00</span>
        </div>
      </div>

      {/* Metric preview at current step */}
      <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
        <div className="glass glass-pad">
          <p className="eyebrow">Rainfall</p>
          <p className="mt-1 font-display text-2xl font-bold tabular text-sky-700">
            {step.rainfall}<span className="text-sm text-slate-400"> mm/h</span>
          </p>
          <Gauge value={step.rainfall} max={120} accent="#0ea5e9" />
        </div>
        <div className="glass glass-pad">
          <p className="eyebrow">River gauge</p>
          <p className="mt-1 font-display text-2xl font-bold tabular text-indigo-700">
            +{step.gauge}<span className="text-sm text-slate-400"> m</span>
          </p>
          <Gauge value={step.gauge} max={2.6} accent="#6366f1" />
        </div>
        <div className="glass glass-pad">
          <p className="eyebrow">Flow accumulation</p>
          <p className="mt-1 font-display text-2xl font-bold tabular text-emerald-700">
            {Math.round(step.flow * 100)}<span className="text-sm text-slate-400"> %</span>
          </p>
          <Gauge value={step.flow * 100} max={100} accent="#10b981" />
        </div>
      </div>

      {/* Risk preview */}
      <div className={`glass-strong glass-pad-lg flex flex-col items-start justify-between gap-3 md:flex-row md:items-center`}>
        <div>
          <p className="eyebrow">Predicted risk at this offset</p>
          <p className="mt-1 font-display text-3xl font-bold tabular text-slate-900">
            {step.risk}<span className="text-slate-400">/100</span>
          </p>
          <p className="mt-1 text-[12px] text-slate-500">
            Status band: <span className="font-semibold text-slate-700">{step.status}</span>
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className={`pill ${
            step.status === 'SAFE' ? 'pill-safe' :
            step.status === 'WATCH' ? 'pill-watch' :
            step.status === 'WARNING' ? 'pill-warning' : 'pill-danger'
          }`}>
            <Activity className="h-3.5 w-3.5" />
            {step.status}
          </span>
          <span className="pill pill-info">
            <Bell className="h-3.5 w-3.5" />
            {isOffline ? 'Edge mode' : 'Cloud mode'}
          </span>
        </div>
      </div>

      {/* Action */}
      <div className="glass glass-pad flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="font-display text-base font-semibold text-slate-800">
            Engage live network blackout
          </p>
          <p className="text-[12px] text-slate-500">
            Disconnects SSE, simulates GPS walk-in, triggers Edge Ray-Cast and SOS overlay.
          </p>
        </div>
        <button
          type="button"
          onClick={onToggleBlackout}
          className={`flex shrink-0 items-center justify-center gap-2 rounded-2xl px-5 py-3.5 font-display text-sm font-bold uppercase tracking-widest transition-all duration-300 ${
            isOffline
              ? 'bg-emerald-600 text-white shadow-soft-sky hover:bg-emerald-700'
              : 'bg-rose-600 text-white shadow-soft-rose hover:bg-rose-700'
          } active:scale-[0.99]`}
        >
          {isOffline ? (
            <>
              <Wifi className="h-4.5 w-4.5" />
              Reconnect
            </>
          ) : (
            <>
              <WifiOff className="h-4.5 w-4.5" />
              Start blackout drill
              <ArrowRight className="h-4 w-4" />
            </>
          )}
        </button>
      </div>
    </div>
  );
}
