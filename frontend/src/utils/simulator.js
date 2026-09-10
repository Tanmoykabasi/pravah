/**
 * SSE client for the FastAPI simulator. Falls back to a built-in
 * local timeline so the demo still works even when the backend is down.
 */

const FALLBACK_TIMELINE = [
  { risk_score: 20, status: 'SAFE' },
  { risk_score: 45, status: 'WATCH' },
  { risk_score: 65, status: 'WARNING' },
  { risk_score: 85, status: 'DANGER' },
  { risk_score: 95, status: 'CRITICAL' },
];

const HAZARD_POLYGON_FALLBACK = {
  type: 'Polygon',
  coordinates: [
    [
      [88.64, 27.6],
      [88.65, 27.6],
      [88.65, 27.61],
      [88.64, 27.61],
      [88.64, 27.6],
    ],
  ],
};

/**
 * Open a Server-Sent Events stream to the backend simulator.
 * @param {string} location   e.g. "Chungthang"
 * @param {(payload: object) => void} onTelemetry
 * @returns {{ close: () => void }}
 */
export function startSimulationStream(location, onTelemetry) {
  // Vite dev-server proxies /api -> http://localhost:8000
  const url = `/api/simulate/${encodeURIComponent(
    location.toLowerCase()
  )}/stream`;

  let es = null;
  let closed = false;
  let fallbackTimer = null;

  const startFallback = () => {
    // Pure local timeline so the dashboard is never empty.
    let i = 0;
    fallbackTimer = setInterval(() => {
      if (closed) return;
      const step = FALLBACK_TIMELINE[i % FALLBACK_TIMELINE.length];
      onTelemetry({
        timestamp: new Date().toISOString(),
        location,
        risk_score: step.risk_score,
        status: step.status,
        metrics: {
          rainfall_intensity: `${8 + i * 18} mm/hr`,
          river_gauge: `+${(0.2 + i * 0.5).toFixed(1)}m`,
          flow_accumulation: ['Low', 'Moderate', 'Elevated', 'High', 'Severe'][i % 5],
        },
        hazard_polygon: HAZARD_POLYGON_FALLBACK,
        safe_shelter: { lat: 27.62, lon: 88.63, elevation: '2100m' },
      });
      i += 1;
    }, 5000);
  };

  try {
    es = new EventSource(url);

    es.addEventListener('open', () => {
      // Connected
    });

    es.addEventListener('telemetry', (e) => {
      try {
        const data = JSON.parse(e.data);
        onTelemetry(data);
      } catch (err) {
        // eslint-disable-next-line no-console
        console.warn('Bad telemetry frame', err);
      }
    });

    es.addEventListener('error', () => {
      // Browser will auto-retry; if it gives up, fall back to local timeline
      if (es && es.readyState === EventSource.CLOSED) {
        es.close();
        es = null;
        startFallback();
      }
    });
  } catch {
    startFallback();
  }

  return {
    close: () => {
      closed = true;
      if (es) es.close();
      if (fallbackTimer) clearInterval(fallbackTimer);
    },
  };
}
