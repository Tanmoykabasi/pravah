import { useCallback, useEffect, useRef, useState } from 'react';
import Splash from './components/Splash.jsx';
import AppShell from './components/AppShell.jsx';
import { startSimulationStream } from './utils/simulator.js';
import {
  saveHazardPolygon,
  saveLastTelemetry,
  getHazardPolygon,
  getLastTelemetry,
  saveUserPosition,
  getUserPosition,
} from './utils/idb.js';
import { isInsideHazardZone } from './utils/rayCasting.js';
import { primeAudio } from './utils/siren.js';

const CHUNGTHANG = { name: 'Chungthang', lat: 27.6, lon: 88.64 };

// Simulated user starts just outside the danger zone (west of it) and walks
// east into the polygon once Blackout is engaged.
const USER_START = { lat: 27.6005, lon: 88.6395 };
const USER_TARGET = { lat: 27.605, lon: 88.645 };

const WARDS = [
  { id: 't1', name: 'Tilwara Ward',        sub: 'River bed · +0.1m calm',       risk: 18, status: 'SAFE' },
  { id: 'a2', name: 'Agastyamuni Center',  sub: 'Urban drainage · clear',       risk: 24, status: 'SAFE' },
  { id: 'g3', name: 'Guptkashi Upstream',  sub: 'Catchment drizzle · vigilance',risk: 48, status: 'WATCH' },
  { id: 'r4', name: 'Rampur (Low-lying)',  sub: 'Sensor mesh #08 active',       risk: 56, status: 'WATCH' },
];

export default function App() {
  const [booted, setBooted] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [telemetry, setTelemetry] = useState(null);
  const [telemetryLog, setTelemetryLog] = useState([]);
  const [isOffline, setIsOffline] = useState(false);
  const [userPosition, setUserPosition] = useState(USER_START);
  const [inDangerZone, setInDangerZone] = useState(false);
  const [bootError, setBootError] = useState(null);

  const streamRef = useRef(null);

  // Hydrate cached state from IndexedDB on mount
  useEffect(() => {
    (async () => {
      try {
        const [last, poly, pos] = await Promise.all([
          getLastTelemetry(),
          getHazardPolygon(),
          getUserPosition(),
        ]);
        if (last) setTelemetry(last);
        if (pos && typeof pos.lat === 'number') setUserPosition(pos);
        if (!last && poly) {
          setTelemetry((prev) => prev ?? { hazard_polygon: poly });
        }
      } catch (err) {
        setBootError(err?.message || String(err));
      }
    })();
  }, []);

  // (Re)start the SSE stream when location changes or we exit Blackout
  useEffect(() => {
    if (!selectedLocation) {
      streamRef.current?.close();
      streamRef.current = null;
      return;
    }
    if (isOffline) {
      streamRef.current?.close();
      streamRef.current = null;
      return;
    }
    const stream = startSimulationStream(selectedLocation.name, async (frame) => {
      setTelemetry(frame);
      setTelemetryLog((prev) => [...prev.slice(-19), frame]);
      try {
        if (frame.hazard_polygon) await saveHazardPolygon(frame.hazard_polygon);
        await saveLastTelemetry(frame);
      } catch {
        // ignore — IDB may be unavailable in private mode
      }
    });
    streamRef.current = stream;
    return () => {
      stream.close();
      streamRef.current = null;
    };
  }, [selectedLocation, isOffline]);

  // Persist the simulated user position
  useEffect(() => {
    saveUserPosition(userPosition).catch(() => {});
  }, [userPosition]);

  // Edge Ray-Cast: re-evaluate every time the GPS or polygon changes
  useEffect(() => {
    if (!telemetry?.hazard_polygon) {
      setInDangerZone(false);
      return;
    }
    const inside = isInsideHazardZone(
      userPosition.lon,
      userPosition.lat,
      telemetry.hazard_polygon
    );
    setInDangerZone(inside);
  }, [userPosition, telemetry?.hazard_polygon]);

  // While offline, walk the simulated GPS toward the danger zone
  useEffect(() => {
    if (!isOffline) return;
    const id = setInterval(() => {
      setUserPosition((prev) => {
        const dx = USER_TARGET.lon - prev.lon;
        const dy = USER_TARGET.lat - prev.lat;
        const dist = Math.hypot(dx, dy);
        if (dist < 0.0008) return USER_TARGET;
        const step = 0.18;
        return {
          lat: prev.lat + (dy / dist) * step * 0.001,
          lon: prev.lon + (dx / dist) * step * 0.001,
        };
      });
    }, 800);
    return () => clearInterval(id);
  }, [isOffline]);

  const handleSelectLocation = useCallback((loc) => {
    primeAudio();
    setSelectedLocation(loc);
    setTelemetryLog([]);
  }, []);

  const handleToggleBlackout = useCallback(() => {
    setIsOffline((v) => !v);
  }, []);

  if (!booted) {
    return <Splash onDone={() => setBooted(true)} />;
  }

  return (
    <AppShell
      selectedLocation={selectedLocation}
      onSelectLocation={handleSelectLocation}
      telemetry={telemetry}
      telemetryLog={telemetryLog}
      isOffline={isOffline}
      onToggleBlackout={handleToggleBlackout}
      userPosition={userPosition}
      inDangerZone={inDangerZone}
      wards={WARDS}
      bootError={bootError}
    />
  );
}
