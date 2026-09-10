# PRAVAH — Predictive Runoff Assessment & Vulnerability Alert Hub

A hackathon prototype that demonstrates **Cloud-to-Edge** flash-flood prediction:
the cloud (FastAPI simulator) pushes escalating risk telemetry, the PWA caches
the hazard polygon into IndexedDB, and the edge (browser) runs a pure-JS
ray-casting point-in-polygon check to trigger an offline SOS even when the
network is gone.

> **Demo scenario:** Type `Chungthang` into the search bar to fire up the
> *Teesta 2023 Flood Simulator*. Watch the risk score climb, click
> **Simulate Network Blackout**, and the blue GPS dot will walk straight into
> the red danger polygon. The screen flashes red, a siren wails, and a
> one-tap **SEND SOS · 112** anchor appears.

---

## 1. Architecture

```
 ┌────────────────────────┐         SSE /api/simulate/.../stream        ┌──────────────────┐
 │  FastAPI Simulator     │  ───────────────────────────────────────▶   │  React (Vite)    │
 │  Teesta 2023 timeline  │     telemetry frames every 5 s              │  PWA + Tailwind  │
 │  Safe → Critical       │     (risk, metrics, hazard_polygon)         │  react-leaflet   │
 └────────────────────────┘                                                └────────┬─────────┘
                                                                                   │
                                                                                   │ save GeoJSON
                                                                                   ▼
                                                                          ┌──────────────────┐
                                                                          │   IndexedDB      │
                                                                          │  offline_hazard  │
                                                                          │      _map        │
                                                                          └────────┬─────────┘
                                                                                   │
                                                                                   │ on Blackout
                                                                                   ▼
                                                                       Ray-Cast (pure JS)
                                                                       GPS inside polygon?
                                                                                   │ YES
                                                                                   ▼
                                                                       🔴 SOS Overlay +
                                                                          Web-Audio siren +
                                                                          sms:112 anchor
```

### Tech stack

| Layer        | Tool                                                            |
| ------------ | --------------------------------------------------------------- |
| Frontend     | React 18 + Vite 5 + Tailwind CSS 3                              |
| Map          | `react-leaflet` 4 + OpenStreetMap tiles (cached by service w.)  |
| PWA / cache  | `vite-plugin-pwa` (Workbox runtime caching for shell + tiles)   |
| Offline DB   | `localforage` (IndexedDB) — key `offline_hazard_map`            |
| Audio        | Web Audio API (generated siren, no binary asset)                |
| Backend      | Python 3.11+ · FastAPI · Uvicorn · Server-Sent Events           |

---

## 2. Folder layout

```
pravah/
├── backend/
│   ├── main.py            # FastAPI app + SSE simulator
│   └── requirements.txt
└── frontend/
    ├── index.html
    ├── package.json
    ├── postcss.config.js
    ├── tailwind.config.js
    ├── vite.config.js     # PWA plugin + /api proxy
    ├── public/
    │   └── favicon.svg
    └── src/
        ├── App.jsx                 # orchestrator (stream, GPS, ray-cast, blackout)
        ├── main.jsx
        ├── index.css               # tailwind + leaflet dark theme
        ├── components/
        │   ├── Dashboard.jsx       # Bento grid layout
        │   ├── Header.jsx
        │   ├── SearchBar.jsx
        │   ├── RiskScore.jsx       # massive, glow-on-change readout
        │   ├── MetricsCard.jsx     # rainfall / gauge / flow
        │   ├── MapView.jsx         # hazard polygon, GPS radar dot, shelter
        │   ├── NetworkStatus.jsx   # Simulate Blackout button
        │   ├── ShelterCard.jsx
        │   ├── TelemetryLog.jsx
        │   └── SosOverlay.jsx      # flashing red, siren, sms:112 anchor
        └── utils/
            ├── rayCasting.js       # PRD-spec algorithm
            ├── idb.js              # localforage wrapper
            ├── simulator.js        # SSE client + local fallback timeline
            ├── siren.js            # Web Audio siren generator
            └── format.js           # status → colour mapping
```

---

## 3. Running it locally

You need **Python 3.11+** and **Node 18+** installed.

### Terminal A — backend (port 8000)

```bash
cd backend
python -m pip install -r requirements.txt
python -m uvicorn main:app --host 0.0.0.0 --port 8000
```

Sanity checks:

```bash
curl http://localhost:8000/
curl http://localhost:8000/api/simulate/chungthang
```

### Terminal B — frontend (port 5173)

```bash
cd frontend
npm install
npm run dev
```

Open <http://localhost:5173>. The Vite dev server proxies `/api/*` to the
FastAPI backend, so SSE works straight from a single origin.

---

## 4. The full demo script (≈ 60 seconds)

1. **Type "Chungthang"** in the search bar → map flies to 27.60°N, 88.64°E.
2. The simulator connects to `/api/simulate/chungthang/stream` and a
   telemetry frame arrives every 5 s. The risk score climbs
   **20 → 45 → 65 → 85 → 95** (Safe → Critical).
3. While the dashboard is online, the GeoJSON hazard polygon is written
   to IndexedDB under `offline_hazard_map`. The map renders it in amber
   while the score is Watch / Warning, and switches to red at Danger /
   Critical.
4. Click **Simulate Network Blackout**. The SSE stream is disconnected,
   the wrapper border starts flashing rose, and the simulated GPS dot
   begins walking east.
5. After ~5 s the dot crosses into the polygon. The local
   `isInsideHazardZone()` ray-caster flips `true`, the full-screen SOS
   overlay slams in, a Web-Audio siren wails, and the giant
   **SEND SOS · 112** anchor appears.
6. (Optional) Toggle Reconnect to return to Cloud Mode. The cached data
   remains in IndexedDB so a hard reload still shows the last frame.

---

## 5. Core algorithms (per PRD §5)

### Hybrid Risk Engine

```
R_total = (0.60 × DeterministicScore) + (0.40 × MLProbability)
```

Lives in `backend/main.py::_compute_hybrid_risk()` and is exposed at
`POST /api/hybrid-risk` for the team that wants to plug in the ML
component later.

### Edge Ray-Cast (frontend, pure JS)

Implemented in `frontend/src/utils/rayCasting.js` exactly as specified:

```js
function isPointInPolygon(point, vs) {
  const x = point[0], y = point[1];
  let inside = false;
  for (let i = 0, j = vs.length - 1; i < vs.length; j = i++) {
    const xi = vs[i][0], yi = vs[i][1];
    const xj = vs[j][0], yj = vs[j][1];
    const intersect =
      yi > y !== yj > y &&
      x < ((xj - xi) * (y - yi)) / (yj - yi) + xi;
    if (intersect) inside = !inside;
  }
  return inside;
}
```

The SOS anchor is built as

```html
<a href="sms:112?body=PRAVAH_SOS_Chungthang_Lat_27.60_Lon_88.64">
  SEND SOS · 112
</a>
```

(Lat / Lon are interpolated from the live simulated GPS coordinates.)

---

## 6. Telemetry payload (matches PRD §3 verbatim)

```json
{
  "timestamp": "2023-10-03T18:30:00Z",
  "location": "Chungthang, Sikkim",
  "lat": 27.60,
  "lon": 88.64,
  "risk_score": 85,
  "status": "DANGER",
  "metrics": {
    "rainfall_intensity": "72 mm/hr",
    "river_gauge": "+1.8m (Critical)",
    "flow_accumulation": "High"
  },
  "hazard_polygon": {
    "type": "Polygon",
    "coordinates": [
      [[88.64, 27.60], [88.65, 27.60], [88.65, 27.61], [88.64, 27.61], [88.64, 27.60]]
    ]
  },
  "safe_shelter": {
    "lat": 27.62,
    "lon": 88.63,
    "elevation": "2100m",
    "name": "Chungthang Helipad Shelter"
  }
}
```

---

## 7. UI / UX notes

- **Dark command-center theme** (`bg-slate-950`) with a **Bento grid** of
  glassmorphic cards (`bg-slate-900/50`, `backdrop-blur-md`,
  `border-slate-800`, `rounded-2xl`).
- Status colours: Safe = emerald, Watch = amber, Warning = orange,
  Danger / Critical = rose. The massive risk number picks up a
  text-shadow glow that intensifies as the band worsens.
- Animations are all defined in `tailwind.config.js`:
  `pulse-red`, `radar`, `flashing-red`, `glow-emerald/amber/rose`.
- The simulated GPS marker is a Lucide `Crosshair` with a custom
  `radar-ping` keyframe. It swaps to rose when the user is inside the
  hazard zone.
- The **Blackout** state adds an `animate-flashing-red` background tint
  plus a 4-px animated rose border around the whole viewport.

---

## 8. PWA behaviour

`vite-plugin-pwa` is configured in `vite.config.js`:

- Pre-caches the JS / CSS / HTML / SVG / WAV shell on first load.
- `CacheFirst` strategy for `tile.openstreetmap.org` so the map works
  even when the simulator is unreachable.
- `devOptions.enabled: true` keeps the service worker active in dev so
  the offline demo works on the day.

To test the installable shell:

```bash
cd frontend
npm run build
npm run preview
```

Open <http://localhost:4173> in Chrome, then DevTools → Application →
Service Workers → confirm `activated` and the manifest is detected.

---

## 9. License & credits

Built as a hackathon prototype. Map tiles © OpenStreetMap contributors.
No proprietary datasets are bundled.
