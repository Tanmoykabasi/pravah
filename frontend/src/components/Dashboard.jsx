import { useState } from 'react';
import { CloudRain, Droplets, Waves, Bell, MapPin, RefreshCcw, WifiOff, Wifi, ArrowRight } from 'lucide-react';
import SearchBar from './SearchBar.jsx';
import { getStatusMeta } from '../utils/format.js';

function SensorCard({ icon: Icon, label, value, unit, sub, tone = 'sky' }) {
  const toneMap = {
    sky:    { ring: 'ring-sky-200',    icon: 'bg-sky-100 text-sky-700',  text: 'text-sky-700',    chip: 'bg-sky-50 text-sky-700' },
    emerald:{ ring: 'ring-emerald-200',icon: 'bg-emerald-100 text-emerald-700', text: 'text-emerald-700', chip: 'bg-emerald-50 text-emerald-700' },
    indigo: { ring: 'ring-indigo-200', icon: 'bg-indigo-100 text-indigo-700', text: 'text-indigo-700', chip: 'bg-indigo-50 text-indigo-700' },
  };
  const t = toneMap[tone] || toneMap.sky;
  return (
    <div className={`glass glass-pad flex h-full flex-col justify-between bg-white/70 ring-1 ${t.ring}`}>
      <div className="flex items-center justify-between">
        <div className={`flex h-9 w-9 items-center justify-center rounded-xl ${t.icon}`}>
          <Icon className="h-4.5 w-4.5" />
        </div>
        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_2px_rgba(16,185,129,0.5)]" />
      </div>
      <div className="mt-3">
        <div className="flex items-baseline gap-1">
          <span className={`font-display text-2xl font-bold ${t.text}`}>{value}</span>
          {unit && <span className="text-xs font-semibold text-slate-500">{unit}</span>}
        </div>
        <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
          {label}
        </p>
      </div>
      <div className="mt-3 flex items-center justify-between text-[11px]">
        <span className={`pill !px-2 !py-0.5 !text-[9.5px] ${t.chip}`}>{sub}</span>
      </div>
    </div>
  );
}

function WardRow({ ward, onClick }) {
  const meta = getStatusMeta(ward.status);
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full items-center justify-between gap-3 rounded-2xl border border-white/70 bg-white/65 px-4 py-3.5 text-left transition-colors hover:bg-white/90"
    >
      <div className="flex min-w-0 items-center gap-3">
        <span
          className={`h-2.5 w-2.5 shrink-0 rounded-full ${meta.bar} shadow-[0_0_10px_2px_rgba(14,165,233,0.3)]`}
        />
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-slate-800">{ward.name}</p>
          <p className="truncate text-[11px] text-slate-500">{ward.sub}</p>
        </div>
      </div>
      <div className="flex shrink-0 flex-col items-end">
        <span className={`font-display text-sm font-bold ${meta.text}`}>
          {ward.risk}<span className="text-slate-400">/100</span>
        </span>
        <span className={`pill ${meta.pill} !px-2 !py-0.5 !text-[9.5px]`}>
          {meta.label}
        </span>
      </div>
    </button>
  );
}

export default function Dashboard({
  telemetry,
  isOffline,
  onToggleBlackout,
  userPosition,
  inDangerZone,
  wards,
  onSelectLocation,
  selectedLocation,
}) {
  const meta = getStatusMeta(telemetry?.status);
  const score = telemetry?.risk_score ?? 0;
  const metrics = telemetry?.metrics || {};

  const rainfallNum = parseFloat(metrics.rainfall_intensity) || 0;
  const rainfallBand = rainfallNum < 30 ? 'Normal' : rainfallNum < 60 ? 'Rising' : 'Critical';
  const riverNum = parseFloat(metrics.river_gauge) || 0;
  const flowBand = metrics.flow_accumulation || 'Low';

  return (
    <div className="space-y-6">
      {/* Location bar + status row */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="flex-1">
          <SearchBar
            onSelect={onSelectLocation}
            selectedLocation={selectedLocation}
            userPosition={userPosition}
          />
        </div>
        <div className="flex shrink-0 items-center gap-2 text-[11px] text-slate-500">
          <span className="hidden md:inline-flex items-center gap-1.5 rounded-full border border-sky-100 bg-white/70 px-3 py-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
            Agastyamuni Base Stn. · RF 868 MHz
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-sky-100 bg-white/70 px-3 py-1.5 font-semibold text-slate-600">
            Sync · 30 s ago
          </span>
        </div>
      </div>

      {/* Hero risk card */}
      <section className="glass-strong glass-pad-lg relative overflow-hidden">
        <div className="pointer-events-none absolute -right-12 -top-12 h-44 w-44 rounded-full bg-sky-200/50 blur-3xl" />
        <div className="pointer-events-none absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-sky-400 via-sky-500 to-sky-300" />

        <div className="relative flex flex-col items-start justify-between gap-6 md:flex-row md:items-center">
          <div>
            <span className={`pill ${meta.pill}`}>
              <span className="h-1.5 w-1.5 animate-soft-pulse rounded-full bg-current" />
              Civic Status · {meta.label}
            </span>
            <h1 className="mt-3 font-display text-3xl font-bold tracking-tight text-slate-900 md:text-4xl">
              {meta.label === 'Safe'
                ? 'You are safe'
                : meta.label === 'Standby'
                ? 'Awaiting telemetry'
                : `Stay alert — ${meta.label}`}
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              {(selectedLocation ? (telemetry?.location || selectedLocation.name) : 'Your Location')} · Composite basin risk
            </p>
          </div>

          <div className="flex items-end gap-3">
            <div className={`font-display tabular text-7xl font-bold leading-none tracking-tighter ${meta.text}`}>
              {Math.round(score)}
            </div>
            <div className="pb-2 text-slate-400">
              <div className="text-xs font-semibold uppercase tracking-widest">/ 100</div>
              <div className="mt-1 flex items-center gap-1 text-[11px] text-sky-600">
                <RefreshCcw className="h-3 w-3 animate-spin" />
                live
              </div>
            </div>
          </div>
        </div>

        {/* Segmented gauge */}
        <div className="relative mt-6">
          <div className="mb-2 flex items-center justify-between text-[11px] font-semibold uppercase tracking-widest text-slate-500">
            <span>Composite basin risk level</span>
            <span className={meta.text}>{meta.label} · {Math.round(score)}/100</span>
          </div>
          <div className="flex h-3 w-full gap-1 rounded-full bg-sky-50 p-0.5 ring-1 ring-sky-100">
            <div
              className={`h-full rounded-full transition-all duration-700 ease-out ${meta.bar}`}
              style={{ width: `${Math.max(4, Math.min(100, score))}%` }}
            />
          </div>
          <div className="mt-1.5 flex justify-between text-[10px] text-slate-400">
            <span>0 · Baseline</span>
            <span>Warning 65</span>
            <span>100 · Max</span>
          </div>
        </div>
      </section>

      {/* 3-sensor grid */}
      <section>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="font-display text-sm font-bold uppercase tracking-widest text-slate-600">
            Hydrological sensors · live mesh
          </h2>
          <span className="pill pill-info !text-[10px]">3 nodes online</span>
        </div>
        <div className="grid grid-cols-3 gap-3 md:gap-4">
          <SensorCard
            icon={CloudRain}
            label="Rainfall"
            value={rainfallNum || '—'}
            unit="mm/h"
            sub={rainfallBand}
            tone="sky"
          />
          <SensorCard
            icon={Droplets}
            label="Soil moisture"
            value="34"
            unit="%"
            sub="Stable"
            tone="emerald"
          />
          <SensorCard
            icon={Waves}
            label="River gauge"
            value={riverNum ? riverNum.toFixed(1) : '—'}
            unit="m"
            sub={flowBand}
            tone="indigo"
          />
        </div>
      </section>

      {/* Village wards */}
      <section>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="font-display text-sm font-bold uppercase tracking-widest text-slate-600">
            Nearby village wards &amp; river basins
          </h2>
          <span className="text-[11px] font-semibold text-slate-400">
            {wards?.length || 0} monitored
          </span>
        </div>
        <div className="space-y-2">
          {wards?.map((w) => (
            <WardRow key={w.id} ward={w} />
          ))}
        </div>
      </section>

      {/* Basin topography tile */}
      <section className="relative overflow-hidden rounded-2xl border border-white/70 bg-white/65 shadow-glass backdrop-blur-md">
        <div className="absolute inset-0 bg-gradient-to-tr from-sky-100/60 via-white/0 to-sky-200/40" />
        <div className="relative flex items-end justify-between p-5 md:p-6">
          <div>
            <span className="pill pill-info !text-[10px]">Basin Topography</span>
            <p className="mt-2 font-display text-lg font-semibold text-slate-800">
              Mandakini Catchment · 1,820 m
            </p>
            <p className="text-[12px] text-slate-500">
              {selectedLocation ? (telemetry?.location || selectedLocation.name) : 'Your Location · Teesta Basin'}
            </p>
          </div>
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-sky-50 text-sky-700 ring-1 ring-sky-200">
            <MapPin className="h-6 w-6" />
          </div>
        </div>
      </section>

      {/* Drill CTA */}
      <section className="glass glass-pad flex flex-col gap-3">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-rose-50 text-rose-600 ring-1 ring-rose-200">
            <Bell className="h-5 w-5" />
          </div>
          <div>
            <p className="font-display text-base font-semibold text-slate-800">
              Emergency readiness drill
            </p>
            <p className="text-[12px] text-slate-500">
              Test siren triggers, mesh evacuation paths and SOS pipeline.
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={onToggleBlackout}
          className={`flex w-full items-center justify-center gap-2 rounded-2xl px-4 py-3.5 font-display text-sm font-bold uppercase tracking-widest transition-all duration-300 ${
            isOffline
              ? 'bg-emerald-600 text-white shadow-soft-sky hover:bg-emerald-700'
              : 'bg-sky-600 text-white shadow-soft-sky hover:bg-sky-700'
          } active:scale-[0.99]`}
        >
          {isOffline ? (
            <>
              <Wifi className="h-4.5 w-4.5" />
              Reconnect to cloud
            </>
          ) : (
            <>
              <WifiOff className="h-4.5 w-4.5" />
              Simulate network blackout
            </>
          )}
        </button>
      </section>

      {/* Footer status */}
      <footer className="flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-500">
        <span>© 2026 PRAVAH · Cloud-to-Edge disaster intelligence</span>
        <span className="font-display">
          {inDangerZone
            ? 'Edge Ray-Cast · INSIDE hazard zone'
            : 'Edge Ray-Cast · outside hazard zone'}
        </span>
      </footer>
    </div>
  );
}
