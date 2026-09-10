import { Bell, CloudRain, Waves, Activity, AlertTriangle, ShieldCheck } from 'lucide-react';
import { getStatusMeta } from '../utils/format.js';

function timeAgo(iso) {
  if (!iso) return '—';
  const t = new Date(iso).getTime();
  const dt = Math.max(0, Date.now() - t);
  if (dt < 60_000) return `${Math.floor(dt / 1000)} s ago`;
  if (dt < 3_600_000) return `${Math.floor(dt / 60_000)} m ago`;
  return new Date(iso).toLocaleTimeString();
}

export default function AlertsScreen({ telemetry, telemetryLog, wards, inDangerZone, isOffline }) {
  const meta = getStatusMeta(telemetry?.status);

  const liveAlerts = [
    {
      id: 'c1',
      title: 'Heavy precipitation band',
      detail:
        'Satellite shows a 30 mm/h cell over the upper catchment — expected to persist 2 h.',
      level: 'WATCH',
      time: telemetry?.timestamp || new Date().toISOString(),
      icon: CloudRain,
    },
    {
      id: 'r2',
      title: 'River gauge rising',
      detail:
        'Mandakini at Agastyamuni reading +0.7 m and climbing 6 cm / 5 min.',
      level: telemetry?.risk_score >= 60 ? 'WARNING' : 'WATCH',
      time: telemetry?.timestamp || new Date().toISOString(),
      icon: Waves,
    },
    {
      id: 'e3',
      title: 'Edge Ray-Cast (offline check)',
      detail: inDangerZone
        ? 'GPS dot is INSIDE the cached hazard polygon. Dispatching SOS workflow.'
        : 'Cached polygon active · GPS outside · no SOS required.',
      level: inDangerZone ? 'DANGER' : 'SAFE',
      time: new Date().toISOString(),
      icon: AlertTriangle,
    },
    {
      id: 'n4',
      title: isOffline ? 'Network blacked out' : 'Network nominal',
      detail: isOffline
        ? 'PWA + IndexedDB active. No new SSE frames. Use Edge Mode controls.'
        : 'SSE stream connected · 14 LoRa towers reporting · LATENCY 42 ms.',
      level: isOffline ? 'WARNING' : 'SAFE',
      time: new Date().toISOString(),
      icon: Activity,
    },
  ];

  return (
    <div className="space-y-6">
      <header>
        <h1 className="font-display text-2xl font-bold text-slate-900">Active alerts</h1>
        <p className="text-sm text-slate-500">
          Real-time intelligence across the Teesta basin
        </p>
      </header>

      {/* Hero alert banner */}
      <div className={`glass-strong glass-pad-lg relative overflow-hidden border-2 ${meta.ring} ${
        telemetry?.status === 'DANGER' || telemetry?.status === 'CRITICAL'
          ? 'border-rose-300'
          : telemetry?.status === 'WARNING'
          ? 'border-orange-300'
          : 'border-sky-200'
      }`}>
        <div className="flex flex-col items-start gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-4">
            <div className={`flex h-12 w-12 items-center justify-center rounded-2xl ring-1 ${meta.ring} bg-white/80 ${meta.text}`}>
              <Bell className="h-6 w-6" />
            </div>
            <div>
              <p className="eyebrow">{meta.label} · composite</p>
              <p className="mt-1 font-display text-2xl font-bold text-slate-900 tabular">
                {Math.round(telemetry?.risk_score ?? 0)}<span className="text-slate-400"> / 100</span>
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className={`pill ${meta.pill}`}>{meta.label}</span>
            <span className="pill pill-neutral">
              <span className="h-1.5 w-1.5 animate-soft-pulse rounded-full bg-sky-500" />
              {timeAgo(telemetry?.timestamp)}
            </span>
          </div>
        </div>
      </div>

      {/* Wards list */}
      <section>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="font-display text-sm font-bold uppercase tracking-widest text-slate-600">
            Village ward watchlist
          </h2>
          <span className="text-[11px] font-semibold text-slate-400">
            {wards?.length || 0} monitored
          </span>
        </div>
        <div className="space-y-2">
          {wards?.map((w) => {
            const m = getStatusMeta(w.status);
            return (
              <div
                key={w.id}
                className="glass glass-pad flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <span className={`h-2.5 w-2.5 rounded-full ${m.bar}`} />
                  <div>
                    <p className="text-sm font-semibold text-slate-800">{w.name}</p>
                    <p className="text-[11px] text-slate-500">{w.sub}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`font-display text-sm font-bold ${m.text}`}>
                    {w.risk}<span className="text-slate-400">/100</span>
                  </span>
                  <span className={`pill ${m.pill} !text-[9.5px]`}>{m.label}</span>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Live feed */}
      <section>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="font-display text-sm font-bold uppercase tracking-widest text-slate-600">
            Live alert feed
          </h2>
          <span className="text-[11px] font-semibold text-slate-400">
            {liveAlerts.length} active
          </span>
        </div>
        <div className="space-y-2">
          {liveAlerts.map((a) => {
            const m = getStatusMeta(a.level);
            const Icon = a.icon;
            return (
              <div key={a.id} className="glass glass-pad flex items-start gap-3">
                <div className={`mt-0.5 flex h-9 w-9 items-center justify-center rounded-xl ring-1 ${meta.ring === 'ring-sky-200' ? 'ring-sky-200 bg-sky-50 text-sky-700' : m.ring + ' ' + m.text}`}>
                  <Icon className="h-4.5 w-4.5" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <p className="truncate text-sm font-semibold text-slate-800">{a.title}</p>
                    <span className={`pill ${m.pill} !text-[9.5px]`}>{m.label}</span>
                  </div>
                  <p className="mt-0.5 text-[12px] text-slate-500">{a.detail}</p>
                  <p className="mt-1 text-[10px] uppercase tracking-widest text-slate-400">
                    {timeAgo(a.time)}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Stream tail */}
      {telemetryLog?.length > 0 && (
        <section>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="font-display text-sm font-bold uppercase tracking-widest text-slate-600">
              Telemetry stream · tail
            </h2>
            <span className="pill pill-neutral !text-[9.5px]">
              <ShieldCheck className="h-3 w-3 text-emerald-600" /> Verified
            </span>
          </div>
          <div className="glass glass-pad">
            <div className="max-h-64 overflow-auto rounded-xl bg-slate-900/95 p-3 font-mono text-[11px] leading-relaxed">
              {telemetryLog.slice(-8).reverse().map((t, i) => (
                <div key={i} className="truncate">
                  <span className="text-slate-500">
                    [{new Date(t.timestamp).toISOString().substring(11, 19)}]
                  </span>{' '}
                  <span className="text-sky-300">PRAVAH</span>{' '}
                  <span className="text-slate-200">
                    risk={t.risk_score} status={t.status}
                  </span>{' '}
                  <span className="text-emerald-300">
                    {t.metrics?.rainfall_intensity} {t.metrics?.river_gauge}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
