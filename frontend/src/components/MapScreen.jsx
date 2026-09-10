import { useMemo } from 'react';
import { MapContainer, TileLayer, Polygon, Marker, useMap } from 'react-leaflet';
import L from 'leaflet';
import { renderToStaticMarkup } from 'react-dom/server';
import { Crosshair, Tent, Mountain, Navigation, Layers } from 'lucide-react';
import { getStatusMeta } from '../utils/format.js';

function lucideDivIcon(IconComp, color, { ping = false, danger = false } = {}) {
  const html = `
    <div class="relative h-7 w-7">
      ${ping ? `<span class="radar-ping ${danger ? 'radar-ping--danger' : ''}"></span>` : ''}
      <div class="relative flex h-7 w-7 items-center justify-center rounded-full bg-white shadow-md"
           style="box-shadow:0 0 0 2px ${color}, 0 6px 14px rgba(15,23,42,0.18);">
        ${renderToStaticMarkup(<IconComp className="h-4 w-4" color={color} strokeWidth={2.5} />)}
      </div>
    </div>`;
  return L.divIcon({
    className: 'leaflet-div-icon',
    html,
    iconSize: [28, 28],
    iconAnchor: [14, 14],
  });
}

function MapRecenter({ center, zoom }) {
  const map = useMap();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useMemo(() => {
    if (center) map.flyTo(center, zoom, { duration: 1.2 });
  }, [center?.[0], center?.[1]]);
  return null;
}

export default function MapScreen({ telemetry, userPosition, selectedLocation, inDangerZone }) {
  const meta = getStatusMeta(telemetry?.status);
  const isCritical = telemetry?.status === 'DANGER' || telemetry?.status === 'CRITICAL';

  const center = useMemo(
    () => [selectedLocation?.lat ?? 27.6, selectedLocation?.lon ?? 88.64],
    [selectedLocation]
  );

  const hazardRing = useMemo(() => {
    if (!telemetry?.hazard_polygon?.coordinates?.[0]) return null;
    return telemetry.hazard_polygon.coordinates[0].map(([lon, lat]) => [lat, lon]);
  }, [telemetry?.hazard_polygon]);

  const userIcon = useMemo(
    () => lucideDivIcon(Crosshair, inDangerZone ? '#f43f5e' : '#0ea5e9', { ping: true, danger: inDangerZone }),
    [inDangerZone]
  );
  const shelterIcon = useMemo(() => lucideDivIcon(Tent, '#10b981', { ping: false }), []);

  return (
    <div className="space-y-4">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-slate-900">Evacuation HUD</h1>
          <p className="text-sm text-slate-500">
            {selectedLocation ? (telemetry?.location || selectedLocation.name) : 'Your Location'} · live terrain view
          </p>
        </div>
        <span className={`pill ${meta.pill}`}>
          <Layers className="h-3.5 w-3.5" />
          {meta.label}
        </span>
      </header>

      {/* Map */}
      <div className="glass overflow-hidden p-1.5">
        <div className="h-[460px] overflow-hidden rounded-2xl">
          <MapContainer
            center={center}
            zoom={14}
            scrollWheelZoom
            className="h-full w-full"
            style={{ minHeight: 460 }}
          >
            <TileLayer
              attribution='&copy; OpenStreetMap'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <MapRecenter center={center} zoom={14} />
            {hazardRing && (
              <Polygon
                positions={hazardRing}
                pathOptions={{
                  color: isCritical ? '#f43f5e' : '#f59e0b',
                  weight: 2,
                  fillColor: isCritical ? '#f43f5e' : '#f59e0b',
                  fillOpacity: isCritical ? 0.25 : 0.15,
                  dashArray: isCritical ? null : '6 6',
                }}
              />
            )}
            {userPosition && (
              <Marker
                position={[userPosition.lat, userPosition.lon]}
                icon={userIcon}
              />
            )}
            {telemetry?.safe_shelter && (
              <Marker
                position={[telemetry.safe_shelter.lat, telemetry.safe_shelter.lon]}
                icon={shelterIcon}
              />
            )}
          </MapContainer>
        </div>
      </div>

      {/* Evacuation summary cards */}
      <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
        <div className="glass glass-pad flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-sky-100 text-sky-700 ring-1 ring-sky-200">
            <Navigation className="h-5 w-5" />
          </div>
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-widest text-slate-500">Your position</p>
            <p className="font-display text-sm font-semibold tabular text-slate-800">
              {userPosition?.lat?.toFixed(4)}°N · {userPosition?.lon?.toFixed(4)}°E
            </p>
          </div>
        </div>
        <div className="glass glass-pad flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700 ring-1 ring-emerald-200">
            <Tent className="h-5 w-5" />
          </div>
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-widest text-slate-500">Safe shelter</p>
            <p className="font-display text-sm font-semibold text-slate-800">
              {telemetry?.safe_shelter?.name || 'Chungthang Helipad'}
            </p>
          </div>
        </div>
        <div className="glass glass-pad flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-100 text-indigo-700 ring-1 ring-indigo-200">
            <Mountain className="h-5 w-5" />
          </div>
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-widest text-slate-500">Elevation</p>
            <p className="font-display text-sm font-semibold text-slate-800">
              {telemetry?.safe_shelter?.elevation || '2100 m'}
            </p>
          </div>
        </div>
      </div>

      {/* Hazard summary */}
      {hazardRing && (
        <div className="glass glass-pad flex items-center justify-between">
          <div>
            <p className="eyebrow">Hazard Polygon</p>
            <p className="mt-1 font-display text-sm font-semibold text-slate-800">
              {hazardRing.length - 1} vertices · {(telemetry?.hazard_polygon?.coordinates?.[0]?.[0]?.[1]?.toFixed(3))}°N start
            </p>
          </div>
          <span className={`pill ${inDangerZone ? 'pill-danger' : 'pill-safe'}`}>
            {inDangerZone ? 'GPS inside zone' : 'GPS outside zone'}
          </span>
        </div>
      )}
    </div>
  );
}
