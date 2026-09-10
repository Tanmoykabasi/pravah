# PRAVAH — White/Light-Blue Glass Redesign · Implementation Plan

> **Audience:** another AI agent picking this up. The work so far + the remaining
> steps are described below with file paths, exact content shapes, and the
> design language you must follow.
>
> **Project root:** `C:\Users\USER\Desktop\New folder (3)\pravah\`
> **Goal:** take the previous tactical-dark prototype (`peppy-bonbon-3b3507.netlify.app`)
> and re-skin the entire PRAVAH app in a clean **white + light-blue glass**
> aesthetic, while keeping every backend feature (FastAPI SSE simulator,
> Ray-Cast point-in-polygon, IndexedDB hazard cache, PWA, GPS blackout, SOS
> overlay) intact.

---

## 1. State of the project

### Already done (DO NOT re-do)

- `backend/main.py` + `backend/requirements.txt` — FastAPI simulator with
  `/api/simulate/chungthang` (snapshot) and `/api/simulate/chungthang/stream`
  (SVE every 5 s, 5-step escalation `Safe → Watch → Warning → Danger → Critical`).
- `frontend/package.json`, `vite.config.js`, `postcss.config.js`,
  `tailwind.config.js`, `index.html`, `public/favicon.svg` — all switched to
  the new light theme (Inter + Space Grotesk, sky palette, `theme_color: #eaf3ff`).
- `frontend/src/index.css` — light glass primitives (`.glass`, `.glass-strong`,
  `.glass-soft`, `.pill-safe/watch/warning/danger/critical/neutral/info`,
  `.eyebrow`, `.scrubber` range thumb, Leaflet light-tile tweaks, radar ping).
- `frontend/src/utils/format.js` — `getStatusMeta(status)` returns the new
  light-theme colour map (`text-emerald-700`, `text-amber-700`, …,
  `ring-…-200`, `bar: bg-…-500`).
- `frontend/src/utils/rayCasting.js` — **PRD-spec ray-caster** (untouched,
  GEOJSON order, [lon, lat]).
- `frontend/src/utils/idb.js` — localforage wrapper, keys: `offline_hazard_map`,
  `last_telemetry`, `user_position`.
- `frontend/src/utils/simulator.js` — SSE client with local fallback timeline.
- `frontend/src/utils/siren.js` — Web Audio API dual-osc siren.
- `frontend/src/App.jsx` — orchestrator with splash gate, multi-screen routing
  is handled inside `AppShell`; wires `selectedLocation`, `telemetry`,
  `telemetryLog`, `isOffline`, `userPosition`, `inDangerZone`, the GPS stepper
  on offline, IndexedDB hydration, and the SOS trigger condition
  `inDangerZone && isOffline`.
- `frontend/src/main.jsx` — entry.
- `frontend/src/components/Splash.jsx` — pre-app splash with sync progress
  8 → 100 % and "Enter Live Dashboard" CTA.
- `frontend/src/components/AppShell.jsx` — sticky header + bottom nav with
  5 tabs (`Home`, `Map`, `Alerts`, `Drill`, `System`) + offline banner +
  SOS overlay; routes to `Dashboard`, `MapScreen`, `AlertsScreen`,
  `DrillScreen`, `SettingsScreen` based on `screen` state.
- `frontend/src/components/Dashboard.jsx` — hero risk card, 3-sensor grid
  (rainfall / soil moisture / river gauge), 4 village wards list, basin
  topography tile, drill CTA + blackout toggle, footer.
- `frontend/src/components/MapScreen.jsx` — Leaflet map, hazard polygon,
  radar GPS dot, shelter marker, light overlay summary cards.
- `frontend/src/components/AlertsScreen.jsx` — hero alert banner + ward
  watchlist + live alert feed + telemetry stream tail.
- `frontend/src/components/DrillScreen.jsx` — time-scrubber disaster
  simulator (T-180 → T-0, auto-play, metric gauges, risk preview,
  blackout trigger).

### Still to build (your task)

| # | File | Purpose |
|---|------|---------|
| 1 | `frontend/src/components/SettingsScreen.jsx` | System / PWA / cache status screen, the 5th bottom-nav tab |
| 2 | `frontend/src/components/OfflineBanner.jsx` | Light-blue strip that shows under the header during blackout |
| 3 | `frontend/src/components/SosOverlay.jsx` | Re-skin the full-screen red crisis overlay to match the light theme |
| 4 | `frontend/src/components/SearchBar.jsx` | Re-skin to match the new glass theme (currently still the old dark styling) |
| 5 | `frontend/src/components/RiskScore.jsx` | Delete or leave unused — `Dashboard.jsx` now renders the hero risk inline; not imported anywhere |
| 6 | `frontend/src/components/MetricsCard.jsx` | Delete or leave unused — replaced by inline sensor grid in `Dashboard.jsx` |
| 7 | `frontend/src/components/ShelterCard.jsx` | Delete or leave unused — replaced by `MapScreen.jsx` summary cards |
| 8 | `frontend/src/components/TelemetryLog.jsx` | Delete or leave unused — replaced by `AlertsScreen.jsx` tail |
| 9 | `frontend/src/components/Header.jsx` | Delete or leave unused — replaced by header inside `AppShell.jsx` |
| 10 | `frontend/src/components/NetworkStatus.jsx` | Delete or leave unused — replaced by inline button in `Dashboard.jsx` |

After implementing #1–#4, run the verification in section 4.

---

## 2. Design language to enforce

These are the **non-negotiable** rules. Every new component must obey them.

### Colour palette

- Background: gradient `linear-gradient(180deg, #f4faff 0%, #eaf3ff 60%, #dceeff 100%)` with two soft sky blobs (`bg-sky-200/40` + `bg-sky-300/30` with `blur-3xl`) and a faint dot grid (handled in `index.css`).
- Cards: `glass-strong` for hero / `glass` for body, never solid colours.
  - `glass`: `rounded-2xl border border-white/70 bg-white/65 shadow-glass backdrop-blur-xl`
  - `glass-strong`: same but `bg-white/80 shadow-glass-lg`
  - `glass-soft`: `bg-white/45 border-sky-100/80`
- Primary (interactive): `bg-sky-600` → `bg-sky-700` on hover, white text, `shadow-soft-sky`.
- Status text / bar:
  - SAFE     → `text-emerald-700`, `bg-emerald-50`, `ring-emerald-200`, bar `bg-emerald-500`
  - WATCH    → `text-amber-700`,   `bg-amber-50`,   `ring-amber-200`,   bar `bg-amber-500`
  - WARNING  → `text-orange-700`,  `bg-orange-50`,  `ring-orange-200`,  bar `bg-orange-500`
  - DANGER   → `text-rose-700`,    `bg-rose-50`,    `ring-rose-200`,    bar `bg-rose-500`
  - CRITICAL → `text-rose-700`,    `bg-rose-100`,   `ring-rose-300`,    bar `bg-rose-600`
- Never use the old dark colours (`bg-slate-950`, `text-emerald-400`,
  `text-rose-500` glow, etc.). The new theme is **light, sky-tinted glass**.

### Typography

- `font-display` → `Space Grotesk` for headings, big numbers, hero titles.
- Default (no class) → `Inter` for body.
- Numerals: add `font-display tabular` to any large readout (risk score,
  rainfall, gauge, etc.) so they line up while ticking.
- Eyebrow labels: use the `.eyebrow` class — already defined as
  `text-[10px] font-semibold uppercase tracking-[0.2em] text-sky-700/80`.

### Spacing & radius

- Card padding: `glass-pad` (`p-5 md:p-6`) for normal cards, `glass-pad-lg`
  (`p-6 md:p-8`) for hero / drill cards.
- Radii: `rounded-2xl` everywhere; the bottom-nav pill is also `rounded-2xl`.
- Generous vertical rhythm: `space-y-6` between sections, `space-y-2` /
  `space-y-3` between items in a list.

### Animations

- Soft pulse on status dots: `animate-soft-pulse` (defined in
  `tailwind.config.js`, keyframes `opacity 0.55 → 1`).
- Radar ping on the GPS marker is unchanged (defined in `index.css`).
- The flashing red `animate-flashing-red` is still defined but should only
  be used in the **SOS overlay** body, not on the whole shell — that was a
  dark-theme legacy choice. The new whole-shell blackout halo is
  implemented in `AppShell.jsx` as a soft rose ring with `shadow-soft-rose`.
- Hover: cards simply darken their background (`hover:bg-white/90`).

---

## 3. Component specs

### 3.1 `SettingsScreen.jsx` (5th tab, currently a stub)

Purpose: show PWA + cache + sensor mesh status. Use the same `glass` +
`glass-strong` primitives. Two-column grid on desktop, single column on
mobile.

Layout (top → bottom):

1. **Header** — "System status" + "PRAVAH is running edge-first".
2. **Hero card** (`glass-strong`) — big "All systems operational" pill +
   "Live Edge Intelligence" subtitle, like the `AlertsScreen` hero.
3. **Telemetry Cache** card (`glass`) — list of IDB keys with status:
   - `offline_hazard_map` (GeoJSON polygon) — pulled live via
     `getHazardPolygon()`. Show "Cached · {N} vertices" or "Not yet cached".
   - `last_telemetry` (last frame) — pulled via `getLastTelemetry()`. Show
     last `risk_score` / `status` or "—".
   - `user_position` — pulled via `getUserPosition()`. Show lat/lon
     formatted to 4 dp, or "—".
4. **Network** card (`glass`) — show "Connected" or "Offline" pill,
   latency, and a **Reconnect / Simulate Blackout** button wired to
   `onToggleBlackout`. Use the same primary/rose button styling as
   `Dashboard.jsx`.
5. **Sensor mesh** card (`glass`) — 3 read-only rows: "14 LoRa towers
   online", "INSAT-3DR Synced", "LATENCY 42 ms" (or read from a prop
   if you want, otherwise hardcode the demo numbers).
6. **About** card (`glass`) — short paragraph describing the prototype +
   GitHub-style footer with the build version.
7. **Danger zone** card (`glass` with `ring-1 ring-rose-200`) — "Reset
   cached data" button that calls `clearAll()` from
   `../utils/idb.js`. Show a confirm `window.confirm` first.

Props to use: `telemetry`, `isOffline`, `onToggleBlackout`, `bootError`.

Imports you'll need:
```js
import { useEffect, useState } from 'react';
import { Database, Wifi, WifiOff, RefreshCcw, Trash2, Shield, Cpu } from 'lucide-react';
import {
  getHazardPolygon, getLastTelemetry, getUserPosition, clearAll,
} from '../utils/idb.js';
import { getStatusMeta } from '../utils/format.js';
```

#### Skeleton to follow (don't copy verbatim — adapt):

```jsx
export default function SettingsScreen({ telemetry, isOffline, onToggleBlackout, bootError }) {
  const [cache, setCache] = useState({ poly: null, last: null, pos: null });

  useEffect(() => {
    (async () => {
      const [poly, last, pos] = await Promise.all([
        getHazardPolygon(),
        getLastTelemetry(),
        getUserPosition(),
      ]);
      setCache({ poly, last, pos });
    })();
  }, [telemetry]);   // re-pull when a new frame lands

  const handleClear = async () => {
    if (window.confirm('Reset all cached hazard data?')) {
      await clearAll();
      setCache({ poly: null, last: null, pos: null });
    }
  };

  return (
    <div className="space-y-6">
      <header>
        <h1 className="font-display text-2xl font-bold text-slate-900">System</h1>
        <p className="text-sm text-slate-500">PWA cache, sensor mesh and offline controls</p>
      </header>
      {/* ...build the cards described above, using the glass primitives... */}
    </div>
  );
}
```

### 3.2 `OfflineBanner.jsx`

A small strip rendered just under the header in `AppShell.jsx` when
`isOffline === true`.

Imports:
```js
import { WifiOff, HardDrive } from 'lucide-react';
import { getStatusMeta } from '../utils/format.js';
```

Shape (must match `AppShell.jsx`'s `<OfflineBanner telemetry={telemetry} />`):

```jsx
export default function OfflineBanner({ telemetry }) {
  const meta = getStatusMeta(telemetry?.status);
  const last = telemetry?.timestamp
    ? new Date(telemetry.timestamp).toLocaleTimeString()
    : 'unknown';
  return (
    <div className="border-b border-rose-200 bg-rose-50/80 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-2 md:px-6">
        <div className="flex min-w-0 items-center gap-2 text-rose-800">
          <WifiOff className="h-4 w-4 shrink-0" />
          <p className="truncate text-[11px] font-semibold uppercase tracking-widest">
            Offline mode · cached sensor mesh data · GPS lock active
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-2 text-[11px]">
          <span className="hidden items-center gap-1.5 text-rose-700 sm:inline-flex">
            <HardDrive className="h-3.5 w-3.5" />
            Last sync {last}
          </span>
          <span className={`pill ${meta.pill} !text-[9.5px]`}>{meta.label}</span>
        </div>
      </div>
    </div>
  );
}
```

### 3.3 `SosOverlay.jsx` — re-skin to the light theme

Replace the existing dark/red overlay with a **light-red glass** version
that still screams "emergency" but matches the rest of the design.

Imports:
```js
import { useEffect } from 'react';
import { AlertTriangle, Phone, MapPin, X } from 'lucide-react';
import { startSiren, stopSiren } from '../utils/siren.js';
```

Required behaviour (unchanged):
- Calls `startSiren()` when `active === true`, `stopSiren()` on unmount.
- Builds the SMS href as
  `sms:112?body=PRAVAH_SOS_${loc}_Lat_${lat}_Lon_${lon}`
  using `userPosition` and `locationName`.
- Props: `active`, `userPosition`, `locationName`.
- Returns `null` when not active.

Layout (full-screen overlay):
- Backdrop: `fixed inset-0 z-50 bg-rose-100/40 backdrop-blur-md` (NOT
  dark — use light rose tint).
- Two soft pulsing rings: outer `ring-4 ring-rose-300/60` with
  `animate-pulse-red`, inner `animate-flashing-red` (defined in
  `tailwind.config.js`).
- Centre card: `glass-strong glass-pad-lg max-w-xl border-2 border-rose-300
  bg-white/85`. The card title should use `text-rose-700` and
  `font-display text-3xl font-bold tracking-tight`.
- Icon: a `h-16 w-16` rounded-full badge with `bg-rose-100 text-rose-600
  ring-2 ring-rose-300` and `animate-pulse`, containing `<AlertTriangle />`.
- Big SOS button: full-width `bg-rose-600 hover:bg-rose-700 text-white
  rounded-2xl py-5 font-display text-lg font-black uppercase tracking-widest
  shadow-soft-rose active:scale-95` containing `<Phone />` + "Send SOS · 112".
- Below the button, render the `sms:` href in a monospaced caption for
  transparency.
- (Optional) Close button: top-right `<X />` that calls a no-op (the PRD
  doesn't define dismissing the overlay, so just render a small hint like
  "Reconnect to dismiss" instead).

### 3.4 `SearchBar.jsx` — re-skin

The current file uses dark colours (`bg-slate-950/60`, `text-slate-100`,
`border-slate-700`). Re-skin it to match the new theme. Imports and
component signature stay identical; just change the classnames.

Required behaviour:
- Controlled input bound to local `query` state.
- On focus, show a dropdown of `KNOWN_LOCATIONS` matching the query.
- `KNOWN_LOCATIONS` must still include `{ name: 'Chungthang', lat: 27.6,
  lon: 88.64, blurb: 'Teesta River Basin, Sikkim' }`.
- Clicking a row calls `onSelect(loc)` and clears the dropdown.
- The "Search location · try Chungthang" placeholder stays.

Visual style:
- Input wrapper: `rounded-2xl border border-sky-100 bg-white/80 backdrop-blur-md
  shadow-glass`.
- Focus ring: `focus:border-sky-400 focus:ring-2 focus:ring-sky-200/60`.
- Placeholder: `placeholder:text-slate-400`.
- Dropdown panel: `rounded-2xl border border-sky-100 bg-white/95 shadow-glass-lg
  backdrop-blur-xl`.
- Result row hover: `hover:bg-sky-50`.
- Result badge (location pin): `bg-sky-100 text-sky-700 ring-1 ring-sky-200`.
- Mono coordinate suffix: `font-mono text-[11px] text-slate-500`.

### 3.5 / 3.6 / 3.7 / 3.8 / 3.9 / 3.10 — cleanup

These files are leftover from the first dark-theme build and are no
longer imported anywhere. They will not show up in the production bundle
because Vite tree-shakes them, but they will warn in the console if you
import them. Recommended action: **delete them** to keep the codebase
clean. The current import graph uses only:

- `App.jsx` → `Splash`, `AppShell`, `utils/simulator`, `utils/idb`,
  `utils/rayCasting`, `utils/siren`
- `AppShell.jsx` → `Dashboard`, `MapScreen`, `AlertsScreen`,
  `DrillScreen`, `SettingsScreen`, `SosOverlay`, `OfflineBanner`,
  `utils/format`
- `Dashboard.jsx` → `SearchBar`, `utils/format`
- `MapScreen.jsx` → `react-leaflet`, `leaflet`, `react-dom/server`,
  `lucide-react`, `utils/format`
- `AlertsScreen.jsx` → `lucide-react`, `utils/format`
- `DrillScreen.jsx` → `lucide-react`
- `Splash.jsx` → `lucide-react`

So the safe-to-delete list is: `RiskScore.jsx`, `MetricsCard.jsx`,
`ShelterCard.jsx`, `TelemetryLog.jsx`, `Header.jsx`, `NetworkStatus.jsx`.

To delete, use the **Trash** tool / move to Recycle Bin, **not** the
PowerShell `Remove-Item` (Windows safety policy).

---

## 4. Verification steps (run after #1–#4 are in)

From `C:\Users\USER\Desktop\New folder (3)\pravah\frontend\`:

```powershell
npm run build
```

Expect:
- `vite v5.x building for production...`
- 1644-ish modules transformed
- `dist/index.html`, `dist/assets/index-*.{js,css}`, `dist/sw.js`,
  `dist/workbox-*.js`, `dist/manifest.webmanifest` generated.
- 0 errors. Warnings about deprecated `glob` (transitive) are fine.

Then a runtime smoke test:

```powershell
# 1) Start backend (background)
cd C:\Users\USER\Desktop\New folder (3)\pravah\backend
python -m uvicorn main:app --host 0.0.0.0 --port 8000

# 2) Start frontend dev server (background)
cd C:\Users\USER\Desktop\New folder (3)\pravah\frontend
npm run dev

# 3) Confirm both up
curl http://localhost:8000/                       # expect 200 JSON
curl http://localhost:5173/                       # expect 200 HTML
curl http://localhost:5173/api/simulate/chungthang # expect 200 JSON via Vite proxy
```

Then open `http://localhost:5173/` in a browser and walk the demo:

1. Splash screen → "Enter Live Dashboard" button enabled when sync = 100 %.
2. Type "Chungthang" → dashboard appears, risk = 20 (Safe), emerald bar.
3. Wait ~15 s → risk escalates through Watch / Warning; status pill +
   bar colour change accordingly.
4. Tap **Simulate Network Blackout** → offline banner appears, rose ring
   around viewport, GPS dot walks east.
5. After ~5 s the dot enters the polygon → **light-red SOS overlay**
   appears with a siren and a giant `Send SOS · 112` button.
6. Tap **Reconnect** (anywhere) → overlay clears, stream resumes.

A short PowerShell probe of the SSE stream (3 frames in 12 s, risk 20 →
45 → 65) is in the README. The expected log line is:
```
FRAME-1  data: {"timestamp": "...", "risk_score": 20, "status": "SAFE", ...}
FRAME-2  data: ... "risk_score": 45, "status": "WATCH", ...
FRAME-3  data: ... "risk_score": 65, "status": "WARNING", ...
```

---

## 5. Critical "do not break" invariants

These were already verified in the previous build. Re-verify after the
redesign:

- The PRD's **Ray-Cast algorithm** is still the literal spec in
  `frontend/src/utils/rayCasting.js` (don't refactor it).
- The PRD's **Hybrid Risk** formula `0.60·D + 0.40·ML` is still
  implemented in `backend/main.py::_compute_hybrid_risk`.
- The SSE payload in `backend/main.py` still matches the schema in
  `README.md` §6 verbatim.
- The SMS URI scheme is `sms:112?body=PRAVAH_SOS_${loc}_Lat_${lat}_Lon_${lon}`.
- `App.jsx` is the only place that owns `selectedLocation`,
  `isOffline`, `userPosition`, and the GPS stepper. Don't duplicate that
  logic into individual screens.
- `getStatusMeta` is the single source of truth for status colours.
  Don't hardcode emerald/amber/rose in screen components — call
  `getStatusMeta(status)` instead.
- The PWA manifest in `vite.config.js` now uses `theme_color: '#eaf3ff'`
  and `background_color: '#f4faff'` — leave them. The PWA install
  banner will pick those up.

---

## 6. Optional polish (only if time permits)

- Add a small "Map ↔ Home" link inside `MapScreen.jsx` so users can hop
  back to the dashboard without the bottom nav.
- Add a "Last 3 alerts" strip on the home dashboard between the hero and
  the sensor grid, populated from `telemetryLog`.
- Add a one-time tooltip on the SOS button reminding the user to
  unlock their phone's SMS permissions.

These are nice-to-haves. Ship the four required files first.

---

## 7. Hand-off checklist

Before you stop, confirm:

- [x] `SettingsScreen.jsx` exists and is imported by `AppShell.jsx`
      (already wired — no change needed there).
- [x] `OfflineBanner.jsx` exists and is imported by `AppShell.jsx`
      (already wired).
- [x] `SosOverlay.jsx` is re-skinned to the light theme, retains the
      siren, retains the `sms:112?body=…` anchor.
- [x] `SearchBar.jsx` matches the new glass theme.
- [x] The 6 unused dark-theme files are removed.
- [x] `npm run build` succeeds.
- [x] The smoke walk-through in section 4 works end-to-end.
- [x] No `bg-slate-950` / `text-emerald-400` / `animate-glow-rose`
      references remain in any component under `frontend/src/components/`
      except where intentional (e.g. the SOS overlay's rose accents).
