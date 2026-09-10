import { useEffect, useState } from 'react';
import {
  Database,
  Wifi,
  WifiOff,
  RefreshCcw,
  Trash2,
  Shield,
  Cpu,
  Radio,
  HardDrive,
  Info,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';
import {
  getHazardPolygon,
  getLastTelemetry,
  getUserPosition,
  clearAll,
} from '../utils/idb.js';
import { getStatusMeta } from '../utils/format.js';

export default function SettingsScreen({
  telemetry,
  isOffline,
  onToggleBlackout,
  bootError,
}) {
  const [cache, setCache] = useState({ poly: null, last: null, pos: null });
  const [refreshing, setRefreshing] = useState(false);
  const meta = getStatusMeta(telemetry?.status);

  const loadCache = async () => {
    try {
      const [poly, last, pos] = await Promise.all([
        getHazardPolygon(),
        getLastTelemetry(),
        getUserPosition(),
      ]);
      setCache({ poly, last, pos });
    } catch (e) {
      console.error('Failed to read IndexedDB cache:', e);
    }
  };

  useEffect(() => {
    loadCache();
  }, [telemetry]);

  const handleManualRefresh = async () => {
    setRefreshing(true);
    await loadCache();
    setTimeout(() => setRefreshing(false), 400);
  };

  const handleClear = async () => {
    if (window.confirm('Reset all cached hazard and telemetry data in IndexedDB?')) {
      await clearAll();
      setCache({ poly: null, last: null, pos: null });
    }
  };

  const vertexCount = cache.poly?.coordinates?.[0]?.length
    ? Math.max(0, cache.poly.coordinates[0].length - 1)
    : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <header className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-slate-900">System</h1>
          <p className="text-sm text-slate-500">
            PWA cache, sensor mesh and offline edge controls
          </p>
        </div>
        <button
          type="button"
          onClick={handleManualRefresh}
          className="glass flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-sky-700 transition hover:bg-white/90 active:scale-95"
          title="Refresh cached values"
        >
          <RefreshCcw className={`h-3.5 w-3.5 ${refreshing ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </header>

      {/* Hero Status Card */}
      <div className="glass-strong glass-pad-lg relative overflow-hidden border border-white/80">
        <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <div
              className={`flex h-12 w-12 items-center justify-center rounded-2xl ring-1 ${
                isOffline
                  ? 'bg-rose-50 text-rose-600 ring-rose-200'
                  : 'bg-sky-50 text-sky-600 ring-sky-200'
              }`}
            >
              <Cpu className="h-6 w-6" />
            </div>
            <div>
              <p className="eyebrow">Edge Architecture</p>
              <h2 className="mt-0.5 font-display text-xl font-bold text-slate-900">
                {isOffline ? 'Offline Standalone Mode' : 'Live Cloud & Edge Sync'}
              </h2>
              <p className="text-xs text-slate-500">
                {isOffline
                  ? 'Executing local Ray-Cast Point-in-Polygon against IndexedDB cache'
                  : 'FastAPI SSE streaming telemetry with resilient localforage persistence'}
              </p>
            </div>
          </div>
          <span className={`pill ${isOffline ? 'pill-danger' : 'pill-safe'}`}>
            <span className="h-1.5 w-1.5 animate-soft-pulse rounded-full bg-current" />
            {isOffline ? 'OFFLINE EDGE' : 'ALL SYSTEMS NOMINAL'}
          </span>
        </div>
      </div>

      {/* 2-column responsive layout */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {/* Telemetry & IDB Cache Card */}
        <div className="glass glass-pad flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center gap-2">
              <Database className="h-4.5 w-4.5 text-sky-600" />
              <h3 className="font-display text-sm font-bold uppercase tracking-wider text-slate-700">
                IndexedDB Cache Status
              </h3>
            </div>
            <p className="mt-1 text-xs text-slate-500">
              Cached local models used during communication blackouts.
            </p>

            <div className="mt-4 space-y-3">
              {/* Hazard Polygon */}
              <div className="flex items-center justify-between rounded-xl bg-white/60 p-3 ring-1 ring-slate-100">
                <div className="flex items-center gap-2.5">
                  <Shield className="h-4 w-4 text-sky-600" />
                  <div>
                    <p className="text-xs font-semibold text-slate-800">offline_hazard_map</p>
                    <p className="text-[11px] text-slate-500">GeoJSON danger boundary</p>
                  </div>
                </div>
                <span
                  className={`pill !text-[10px] ${
                    vertexCount > 0 ? 'pill-safe' : 'pill-neutral'
                  }`}
                >
                  {vertexCount > 0 ? `Cached · ${vertexCount} vertices` : 'Not yet cached'}
                </span>
              </div>

              {/* Last Telemetry Frame */}
              <div className="flex items-center justify-between rounded-xl bg-white/60 p-3 ring-1 ring-slate-100">
                <div className="flex items-center gap-2.5">
                  <HardDrive className="h-4 w-4 text-sky-600" />
                  <div>
                    <p className="text-xs font-semibold text-slate-800">last_telemetry</p>
                    <p className="text-[11px] text-slate-500">Latest sensor snapshot</p>
                  </div>
                </div>
                <span className="pill pill-info !text-[10px]">
                  {cache.last
                    ? `Risk ${Math.round(cache.last.risk_score ?? 0)} · ${cache.last.status || 'OK'}`
                    : '—'}
                </span>
              </div>

              {/* User Position */}
              <div className="flex items-center justify-between rounded-xl bg-white/60 p-3 ring-1 ring-slate-100">
                <div className="flex items-center gap-2.5">
                  <Radio className="h-4 w-4 text-sky-600" />
                  <div>
                    <p className="text-xs font-semibold text-slate-800">user_position</p>
                    <p className="text-[11px] text-slate-500">Cached GPS coordinates</p>
                  </div>
                </div>
                <span className="font-mono text-xs text-slate-600">
                  {cache.pos
                    ? `${cache.pos.lat?.toFixed(4)}°N, ${cache.pos.lon?.toFixed(4)}°E`
                    : '—'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Network & Connectivity Card */}
        <div className="glass glass-pad flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {isOffline ? (
                  <WifiOff className="h-4.5 w-4.5 text-rose-600" />
                ) : (
                  <Wifi className="h-4.5 w-4.5 text-sky-600" />
                )}
                <h3 className="font-display text-sm font-bold uppercase tracking-wider text-slate-700">
                  Network Connectivity
                </h3>
              </div>
              <span className={`pill ${isOffline ? 'pill-danger' : 'pill-safe'}`}>
                {isOffline ? 'Offline' : 'Connected'}
              </span>
            </div>
            <p className="mt-1 text-xs text-slate-500">
              Real-time telemetry uplink to Chungthang monitoring station.
            </p>

            <div className="mt-4 space-y-2.5">
              <div className="flex items-center justify-between rounded-xl bg-white/60 p-3 ring-1 ring-slate-100 text-xs">
                <span className="font-medium text-slate-600">Link Protocol</span>
                <span className="font-mono font-semibold text-slate-800">
                  {isOffline ? 'Local Fallback' : 'Server-Sent Events (SSE)'}
                </span>
              </div>
              <div className="flex items-center justify-between rounded-xl bg-white/60 p-3 ring-1 ring-slate-100 text-xs">
                <span className="font-medium text-slate-600">Round-trip Latency</span>
                <span className="font-mono font-semibold text-emerald-700">
                  {isOffline ? '0 ms (Local Edge)' : '42 ms'}
                </span>
              </div>
              <div className="flex items-center justify-between rounded-xl bg-white/60 p-3 ring-1 ring-slate-100 text-xs">
                <span className="font-medium text-slate-600">Active Alert Status</span>
                <span className={`pill ${meta.pill} !py-0.5 !text-[10px]`}>
                  {meta.label}
                </span>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={onToggleBlackout}
            className={`flex w-full items-center justify-center gap-2 rounded-2xl px-4 py-3 font-display text-xs font-bold uppercase tracking-widest transition-all duration-200 ${
              isOffline
                ? 'bg-emerald-600 text-white shadow-soft-sky hover:bg-emerald-700'
                : 'bg-sky-600 text-white shadow-soft-sky hover:bg-sky-700'
            } active:scale-[0.99]`}
          >
            {isOffline ? (
              <>
                <Wifi className="h-4 w-4" />
                Reconnect to cloud
              </>
            ) : (
              <>
                <WifiOff className="h-4 w-4" />
                Simulate network blackout
              </>
            )}
          </button>
        </div>

        {/* Sensor Mesh Card */}
        <div className="glass glass-pad space-y-4">
          <div className="flex items-center gap-2">
            <Radio className="h-4.5 w-4.5 text-sky-600" />
            <h3 className="font-display text-sm font-bold uppercase tracking-wider text-slate-700">
              Sensor Mesh Telemetry
            </h3>
          </div>
          <p className="text-xs text-slate-500">
            Field sensor nodes reporting across Teesta River catchment.
          </p>

          <div className="space-y-2.5">
            <div className="flex items-center justify-between rounded-xl bg-white/60 p-3 ring-1 ring-slate-100">
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                <span className="text-xs font-medium text-slate-700">LoRa Gateway Mesh</span>
              </div>
              <span className="text-xs font-bold text-slate-800">14 Towers Online</span>
            </div>
            <div className="flex items-center justify-between rounded-xl bg-white/60 p-3 ring-1 ring-slate-100">
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                <span className="text-xs font-medium text-slate-700">INSAT-3DR Feed</span>
              </div>
              <span className="text-xs font-bold text-slate-800">Synced · 15m Interval</span>
            </div>
            <div className="flex items-center justify-between rounded-xl bg-white/60 p-3 ring-1 ring-slate-100">
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-sky-500 shadow-[0_0_8px_rgba(14,165,233,0.5)]" />
                <span className="text-xs font-medium text-slate-700">Edge Point-in-Polygon</span>
              </div>
              <span className="text-xs font-bold text-slate-800">Ray-Casting v1.2</span>
            </div>
          </div>
        </div>

        {/* About & Specs */}
        <div className="glass glass-pad space-y-4">
          <div className="flex items-center gap-2">
            <Info className="h-4.5 w-4.5 text-sky-600" />
            <h3 className="font-display text-sm font-bold uppercase tracking-wider text-slate-700">
              About PRAVAH
            </h3>
          </div>
          <p className="text-xs leading-relaxed text-slate-600">
            PRAVAH is a resilient Early Warning System designed for Himalayan river basins.
            By coupling satellite-based rainfall estimates, hydrological gauge sensors, and
            local browser-based geospatial ray casting, PRAVAH triggers emergency SOS routing
            even when all cloud infrastructure goes dark.
          </p>
          <div className="rounded-xl bg-sky-50/70 p-3 ring-1 ring-sky-200/60 text-[11px] text-sky-900 space-y-1">
            <div className="flex justify-between">
              <span className="font-medium text-sky-800">Theme</span>
              <span className="font-semibold">White & Light-Blue Glass</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium text-sky-800">PWA Target</span>
              <span className="font-semibold">Progressive Web App (Offline-First)</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium text-sky-800">Build Version</span>
              <span className="font-mono font-semibold">2.4.0-edge-glass</span>
            </div>
          </div>
        </div>
      </div>

      {/* Danger Zone */}
      <div className="glass glass-pad border border-rose-200/80 bg-rose-50/40">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-rose-100 text-rose-600 ring-1 ring-rose-200">
              <AlertTriangle className="h-4.5 w-4.5" />
            </div>
            <div>
              <h4 className="font-display text-sm font-bold text-rose-900">Danger Zone</h4>
              <p className="text-xs text-rose-700/80">
                Purge all cached GeoJSON hazard maps and offline telemetry records from this device.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleClear}
            className="flex shrink-0 items-center justify-center gap-2 rounded-xl bg-white px-4 py-2 text-xs font-bold text-rose-700 ring-1 ring-rose-300 shadow-sm transition hover:bg-rose-50 active:scale-95"
          >
            <Trash2 className="h-3.5 w-3.5" />
            Reset cached data
          </button>
        </div>
      </div>
    </div>
  );
}
