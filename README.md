# PRAVAH — Predictive Runoff Assessment & Vulnerability Alert Hub

PRAVAH is a modern, edge-first Early Warning System (EWS) designed for Himalayan river basins. It pairs cloud-based satellite and hydrological telemetry streaming with local browser-based geospatial ray casting, guaranteeing emergency SOS escalation even during complete communication blackouts.

Styled in a **Modern White & Light-Blue Glass** aesthetic with live interactive Leaflet maps, multi-screen command HUDs, and progressive web app (PWA) caching.

---

## 1. Quick Demo Guide & Secret Trigger

> **Presenting PRAVAH:**
> 1. **Default State**: The app opens displaying **Your Location** (`27.6005°N, 88.6395°E · GPS Locked`), demonstrating real-time civic readiness.
> 2. **Secret Demo Trigger**: Click the **Your Location** bar or the discreet crosshair button (**`⌖`**) on the right. This instantly switches the location to **Chungthang** (Teesta River Basin, Sikkim) and initiates the live simulation stream.
> 3. **Automatic SOS at 85 Risk**: Watch the risk score climb (**20 → 45 → 65 → 85**). As soon as the meter hits **85**, the full-screen **SOS Overlay** slams in with a wailing dual-oscillator audio siren and emergency 112 dispatch.
> 4. **3-Second Dismiss Interlock**: After a 3-second safety interlock, the close button (`✕`) unlocks, allowing the presenter to silence the siren and dismiss the overlay. Clicking the secret `⌖` button again toggles back to "Your Location" for repeated demonstrations.
> 5. **Network Blackout & Edge Ray-Cast**: Click **Simulate Network Blackout**. The network drops, the offline banner appears, and the simulated GPS dot begins walking east into the hazard zone. The pure JavaScript **Ray-Casting** algorithm locally validates the breach against the cached GeoJSON in IndexedDB, independently triggering the offline SOS pipeline.

---

## 2. Architecture

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
                                                                                   │ on Blackout / GPS walk
                                                                                   ▼
                                                                       Ray-Cast (pure JS)
                                                                       GPS inside polygon?
                                                                                   │ YES
                                                                                   ▼
                                                                       🔴 SOS Overlay +
                                                                          Web-Audio siren +
                                                                          sms:112 anchor
```

### Tech Stack

| Layer        | Tool                                                                         |
| ------------ | ---------------------------------------------------------------------------- |
| **Frontend** | React 18 · Vite 5 · Tailwind CSS 3 (Inter + Space Grotesk)                   |
| **Theme**    | White & Sky-Blue Glass (`backdrop-blur-xl`, custom light glass shadows)      |
| **Map**      | `react-leaflet` 4 + OpenStreetMap tiles (Workbox service worker caching)     |
| **PWA**      | `vite-plugin-pwa` (Workbox runtime caching for app shell, icons, audio)       |
| **Offline DB**| `localforage` (IndexedDB) keys: `offline_hazard_map`, `last_telemetry`, `user_position` |
| **Audio**    | Web Audio API (real-time generated dual-oscillator emergency siren)          |
| **Backend**  | Python 3.11+ · FastAPI · Uvicorn · Server-Sent Events (SSE)                  |

---

## 3. Project Structure

```
pravah/
├── backend/
│   ├── main.py                  # FastAPI server + SSE simulator (Teesta 2023 dataset)
│   └── requirements.txt         # FastAPI, Uvicorn, Pydantic
└── frontend/
    ├── index.html
    ├── package.json
    ├── tailwind.config.js       # Light sky palette, soft shadows & animations
    ├── vite.config.js           # PWA manifest, service worker & API proxy
    ├── public/
    │   └── favicon.svg
    └── src/
        ├── App.jsx              # Root state orchestrator (SSE, GPS, Ray-Cast, IDB)
        ├── main.jsx
        ├── index.css            # Glassmorphic primitives (.glass, .glass-strong, pills)
        ├── components/
        │   ├── AppShell.jsx         # Sticky translucent header + floating 5-tab bottom nav
        │   ├── Dashboard.jsx        # Hero risk gauge, 3-sensor grid, ward list, topography
        │   ├── MapScreen.jsx        # Evacuation HUD with Leaflet, hazard polygon & shelters
        │   ├── AlertsScreen.jsx     # Composite risk banner, ward watchlist & live alerts
        │   ├── DrillScreen.jsx      # Time-scrubber disaster simulator (T-180 to T-0)
        │   ├── SettingsScreen.jsx   # System telemetry, IDB cache inspector & reset controls
        │   ├── SearchBar.jsx        # "Your Location" bar with secret demo trigger (⌖)
        │   ├── SosOverlay.jsx       # Light-rose glass crisis modal, siren, 3s close button
        │   ├── OfflineBanner.jsx    # Translucent blackout status banner
        │   └── Splash.jsx           # Startup synchronization gate
        └── utils/
            ├── rayCasting.js    # PRD-spec Ray-Casting Point-in-Polygon algorithm
            ├── idb.js           # LocalForage IndexedDB wrapper
            ├── simulator.js     # SSE client with built-in local fallback
            ├── siren.js         # Web Audio dual-oscillator sound synthesizer
            └── format.js        # Color tokens & status pill mappings
```

---

## 4. Running Locally

### Prerequisites
- **Python 3.11+**
- **Node.js 18+**

---

### Step 1: Backend Server (Port 8000)

```powershell
cd "backend"
python -m pip install -r requirements.txt
python -m uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

Health verification:
```powershell
curl http://localhost:8000/
curl http://localhost:8000/api/simulate/chungthang
```

---

### Step 2: Frontend Dev Server (Port 5173)

In a second terminal:

```powershell
cd "frontend"
npm install
npm run dev
```

Open your browser at **`http://localhost:5173/`**.

*(Vite proxies `/api/*` requests to port 8000 automatically).*

---

## 5. Live Demonstration Walkthrough

| Step | Action | Expected Behaviour |
| :--- | :--- | :--- |
| **1** | Open app | **Splash screen** synchronizes local storage, then unlocks the **Live Dashboard**. |
| **2** | Default View | Dashboard displays **"Your Location"** with `GPS LOCKED` and basin baseline metrics. |
| **3** | **Secret Trigger** | Click the **"Your Location"** bar or the **`⌖`** button on the right. Location updates to **Chungthang** and begins streaming live SSE frames. |
| **4** | Risk Escalation | Risk score climbs: `Safe (20)` → `Watch (45)` → `Warning (65)`. Gauges update in real time. |
| **5** | **SOS Trigger at 85** | When the score hits **85 (Danger)**, the **SOS Overlay** slams in and the audio siren begins wailing. |
| **6** | Dismiss SOS | After 3 seconds, click **`✕`** or **"Dismiss emergency overlay"** to silence the siren. |
| **7** | **Offline Blackout** | Click **"Simulate network blackout"**. The network drops, the offline banner appears, and the GPS dot walks into the cached hazard polygon. The **Edge Ray-Caster** triggers the offline SOS pipeline. |
| **8** | Multi-screen HUD | Navigate through bottom tabs: **Map** (terrain & shelter route), **Alerts** (ward watchlist), **Drill** (time scrubber), and **System** (IndexedDB cache viewer). |

---

## 6. Core Algorithms

### 1. Hybrid Risk Engine (PRD §5)

```
R_total = (0.60 × DeterministicScore) + (0.40 × MLProbability)
```
Located in `backend/main.py::_compute_hybrid_risk()` and accessible via `POST /api/hybrid-risk`.

### 2. Edge Ray-Casting Point-in-Polygon (PRD §4)

Runs locally inside the client (`frontend/src/utils/rayCasting.js`) against the cached GeoJSON hazard polygon:

```js
export function isInsideHazardZone(lon, lat, polygon) {
  const ring = polygon?.coordinates?.[0];
  if (!ring || ring.length < 3) return false;
  let inside = false;
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const xi = ring[i][0], yi = ring[i][1];
    const xj = ring[j][0], yj = ring[j][1];
    const intersect =
      yi > lat !== yj > lat &&
      lon < ((xj - xi) * (lat - yi)) / (yj - yi) + xi;
    if (intersect) inside = !inside;
  }
  return inside;
}
```

---

## 7. Telemetry Schema (SSE /api/simulate/chungthang/stream)

```json
{
  "timestamp": "2026-09-10T18:30:00Z",
  "location": "Chungthang, Sikkim",
  "lat": 27.60,
  "lon": 88.64,
  "risk_score": 85,
  "status": "DANGER",
  "metrics": {
    "rainfall_intensity": "82 mm/hr",
    "river_gauge": "+2.4m",
    "soil_moisture": "78%",
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

## 8. License & Acknowledgments

- Map tiles © [OpenStreetMap](https://www.openstreetmap.org/copyright) contributors.
- Icons by [Lucide](https://lucide.dev/).
- Designed and built as an edge-first disaster mitigation command center for the Teesta River Basin.
