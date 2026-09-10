import { useEffect, useState } from 'react';
import { AlertTriangle, Phone, MapPin, X } from 'lucide-react';
import { startSiren, stopSiren } from '../utils/siren.js';

/**
 * Full-screen crisis overlay shown when the simulated GPS dot is
 * detected INSIDE the hazard polygon while the app is offline.
 * Re-skinned to the light-rose glass theme with sound siren, SMS anchor,
 * and a dismiss button available after a 3-second safety interlock.
 */
export default function SosOverlay({
  active,
  userPosition,
  locationName,
  riskScore,
  isHighRiskScore,
}) {
  const [canClose, setCanClose] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    if (!active) {
      setDismissed(false);
      setCanClose(false);
      return;
    }

    // Safety interlock: enable close button after 3 seconds
    const timer = setTimeout(() => {
      setCanClose(true);
    }, 3000);

    return () => clearTimeout(timer);
  }, [active]);

  useEffect(() => {
    if (active && !dismissed) {
      startSiren();
    } else {
      stopSiren();
    }
    return () => stopSiren();
  }, [active, dismissed]);

  const handleClose = () => {
    stopSiren();
    setDismissed(true);
  };

  if (!active || dismissed) return null;

  const lat = userPosition?.lat?.toFixed(4) ?? '27.60';
  const lon = userPosition?.lon?.toFixed(4) ?? '88.64';
  const loc = (locationName || 'Chungthang').replace(/\s+/g, '_');
  // PRD spec: sms:112?body=PRAVAH_SOS_LAT_LON
  const href = `sms:112?body=PRAVAH_SOS_${loc}_Lat_${lat}_Lon_${lon}`;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-rose-100/40 backdrop-blur-md"
      role="alertdialog"
      aria-live="assertive"
    >
      {/* Animated red alert halo */}
      <div className="pointer-events-none absolute inset-0 animate-flashing-red" />
      <div className="pointer-events-none absolute inset-0 ring-4 ring-rose-300/60 animate-pulse-red" />

      <div className="glass-strong glass-pad-lg relative mx-4 w-full max-w-xl overflow-hidden border-2 border-rose-300 bg-white/95 text-center shadow-glass-lg">
        {/* Close button (appears after 3 seconds) */}
        {canClose ? (
          <button
            type="button"
            onClick={handleClose}
            aria-label="Close alert"
            className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full bg-rose-100/90 text-rose-700 ring-1 ring-rose-300 transition-all duration-200 hover:bg-rose-200 hover:text-rose-900 active:scale-90"
            title="Dismiss emergency overlay"
          >
            <X className="h-4.5 w-4.5" />
          </button>
        ) : (
          <span className="absolute right-4 top-4 rounded-full bg-rose-50/90 px-2.5 py-1 font-mono text-[10px] text-rose-500 ring-1 ring-rose-200/60">
            Dismiss in 3s…
          </span>
        )}

        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-rose-100 text-rose-600 ring-2 ring-rose-300 animate-pulse">
          <AlertTriangle className="h-9 w-9" />
        </div>

        <p className="eyebrow text-rose-700">
          {isHighRiskScore ? 'CRITICAL RISK THRESHOLD · 85+' : 'Edge Ray-Cast · CRITICAL'}
        </p>

        <h2 className="mt-2 font-display text-3xl font-bold tracking-tight text-rose-700 md:text-4xl">
          {isHighRiskScore
            ? `Risk Meter Hit ${Math.round(riskScore || 85)}/100`
            : 'You are inside the hazard zone'}
        </h2>

        <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-slate-600">
          {isHighRiskScore
            ? 'Basin telemetry for Chungthang has breached the critical threshold (85+). Heavy rainfall and river surge pose imminent flash-flood risk. Evacuate to higher ground immediately.'
            : 'The app is offline. The Point-in-Polygon check ran locally against the cached GeoJSON. Move to higher ground immediately and dispatch an SOS.'}
        </p>

        <div className="mx-auto mt-6 inline-flex items-center gap-2 rounded-full bg-rose-50 px-4 py-2 font-mono text-xs text-rose-700 ring-1 ring-rose-200">
          <MapPin className="h-3.5 w-3.5" />
          {lat}°N · {lon}°E · {locationName || 'Chungthang'}
        </div>

        <a
          href={href}
          className="mx-auto mt-8 flex w-full max-w-md items-center justify-center gap-3 rounded-2xl bg-rose-600 px-6 py-5 font-display text-lg font-black uppercase tracking-widest text-white shadow-soft-rose transition-all duration-200 hover:bg-rose-700 active:scale-95"
        >
          <Phone className="h-5 w-5" />
          Send SOS · 112
        </a>

        {canClose && (
          <div className="mt-3">
            <button
              type="button"
              onClick={handleClose}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-rose-600 transition hover:text-rose-800 hover:underline"
            >
              <X className="h-3.5 w-3.5" />
              Dismiss emergency overlay
            </button>
          </div>
        )}

        <p className="mt-4 font-mono text-[10px] uppercase tracking-widest text-rose-700/70">
          sms:112?body=PRAVAH_SOS_{loc}_Lat_{lat}_Lon_{lon}
        </p>

        <p className="mt-2 text-[11px] text-slate-400">
          {canClose
            ? 'Tap close button or reconnect network to dismiss'
            : 'Safety interlock active · Dismiss unlocks in 3 seconds'}
        </p>
      </div>
    </div>
  );
}
