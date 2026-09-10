"""
PRAVAH Backend - FastAPI Simulator
Teesta 2023 Flood Simulator
Serves the simulated telemetry feed as Server-Sent Events (SSE).
"""
from __future__ import annotations

import asyncio
import json
from datetime import datetime, timezone
from typing import AsyncGenerator, Dict, List

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse, JSONResponse
from pydantic import BaseModel

# ----------------------------------------------------------------------------
# App
# ----------------------------------------------------------------------------
app = FastAPI(
    title="PRAVAH Simulator",
    description="Predictive Runoff Assessment & Vulnerability Alert Hub - Backend",
    version="0.1.0",
)

# Permissive CORS so the Vite dev server (5173) can talk to us on 8000.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ----------------------------------------------------------------------------
# Static reference data - Chungthang, Sikkim (Teesta River Basin)
# Coordinates: lat 27.60, lon 88.64
# ----------------------------------------------------------------------------
CHUNGTHANG = {
    "name": "Chungthang, Sikkim",
    "lat": 27.60,
    "lon": 88.64,
}

HAZARD_POLYGON = {
    "type": "Polygon",
    "coordinates": [
        [
            [88.64, 27.60],
            [88.65, 27.60],
            [88.65, 27.61],
            [88.64, 27.61],
            [88.64, 27.60],
        ]
    ],
}

SAFE_SHELTER = {
    "lat": 27.62,
    "lon": 88.63,
    "elevation": "2100m",
    "name": "Chungthang Helipad Shelter",
}

# ----------------------------------------------------------------------------
# The 5-step escalation that the PRD demands:
# Safe (20) -> Watch (45) -> Warning (65) -> Danger (85) -> Critical (95)
# ----------------------------------------------------------------------------
ESCALATION_STEPS: List[Dict] = [
    {
        "risk_score": 20,
        "status": "SAFE",
        "metrics": {
            "rainfall_intensity": "8 mm/hr",
            "river_gauge": "+0.2m (Normal)",
            "flow_accumulation": "Low",
        },
    },
    {
        "risk_score": 45,
        "status": "WATCH",
        "metrics": {
            "rainfall_intensity": "28 mm/hr",
            "river_gauge": "+0.7m (Rising)",
            "flow_accumulation": "Moderate",
        },
    },
    {
        "risk_score": 65,
        "status": "WARNING",
        "metrics": {
            "rainfall_intensity": "48 mm/hr",
            "river_gauge": "+1.2m (High)",
            "flow_accumulation": "Elevated",
        },
    },
    {
        "risk_score": 85,
        "status": "DANGER",
        "metrics": {
            "rainfall_intensity": "72 mm/hr",
            "river_gauge": "+1.8m (Critical)",
            "flow_accumulation": "High",
        },
    },
    {
        "risk_score": 95,
        "status": "CRITICAL",
        "metrics": {
            "rainfall_intensity": "104 mm/hr",
            "river_gauge": "+2.4m (Extreme)",
            "flow_accumulation": "Severe",
        },
    },
]


# ----------------------------------------------------------------------------
# Pydantic models
# ----------------------------------------------------------------------------
class SimulateRequest(BaseModel):
    location: str


# ----------------------------------------------------------------------------
# Helpers
# ----------------------------------------------------------------------------
def _build_payload(step: Dict) -> Dict:
    """Build a telemetry frame for the given escalation step."""
    return {
        "timestamp": datetime.now(timezone.utc).isoformat().replace("+00:00", "Z"),
        "location": CHUNGTHANG["name"],
        "lat": CHUNGTHANG["lat"],
        "lon": CHUNGTHANG["lon"],
        "risk_score": step["risk_score"],
        "status": step["status"],
        "metrics": step["metrics"],
        "hazard_polygon": HAZARD_POLYGON,
        "safe_shelter": SAFE_SHELTER,
    }


def _compute_hybrid_risk(deterministic: float, ml_prob: float) -> float:
    """
    Hybrid Risk Engine per PRD Section 5:
    R_total = (0.60 * DeterministicScore) + (0.40 * MLProbability)
    Both inputs are 0-100.
    """
    return round(0.60 * deterministic + 0.40 * ml_prob, 2)


# ----------------------------------------------------------------------------
# Routes
# ----------------------------------------------------------------------------
@app.get("/")
def root():
    return {
        "service": "PRAVAH Simulator",
        "status": "online",
        "endpoints": {
            "snapshot": "GET /api/simulate/chungthang",
            "stream": "GET /api/simulate/chungthang/stream (SSE)",
            "hybrid": "POST /api/hybrid-risk",
        },
    }


@app.get("/api/simulate/chungthang")
def get_chungthang_snapshot():
    """Return the *current* (latest) snapshot, useful for a one-shot fetch."""
    return JSONResponse(_build_payload(ESCALATION_STEPS[-1]))


@app.get("/api/simulate/chungthang/stream")
async def stream_chungthang(request: Request):
    """
    Server-Sent Events stream. Emits one frame every 5 seconds, cycling
    through the 5 escalation steps so the dashboard animates a flash-flood
    timeline (Safe -> Watch -> Warning -> Danger -> Critical).
    """

    async def event_generator() -> AsyncGenerator[str, None]:
        idx = 0
        try:
            while True:
                if await request.is_disconnected():
                    break
                step = ESCALATION_STEPS[idx % len(ESCALATION_STEPS)]
                payload = _build_payload(step)
                # SSE wire format
                yield f"event: telemetry\ndata: {json.dumps(payload)}\n\n"
                idx += 1
                await asyncio.sleep(5)
        except asyncio.CancelledError:
            # Client disconnected cleanly
            return

    headers = {
        "Cache-Control": "no-cache",
        "X-Accel-Buffering": "no",  # disable proxy buffering
        "Connection": "keep-alive",
    }
    return StreamingResponse(event_generator(), media_type="text/event-stream", headers=headers)


@app.post("/api/hybrid-risk")
def hybrid_risk(deterministic: float, ml_prob: float):
    """
    Hybrid Risk Engine endpoint.
    Body: { "deterministic": 0-100, "ml_prob": 0-100 }
    """
    score = _compute_hybrid_risk(deterministic, ml_prob)
    if score < 40:
        band = "SAFE"
    elif score < 60:
        band = "WATCH"
    elif score < 80:
        band = "WARNING"
    else:
        band = "DANGER"
    return {"total_risk": score, "band": band}


# ----------------------------------------------------------------------------
# Entrypoint
# ----------------------------------------------------------------------------
if __name__ == "__main__":
    import uvicorn

    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
