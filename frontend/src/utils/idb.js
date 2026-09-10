/**
 * IndexedDB wrapper (via localforage) for the offline hazard map.
 * The PRD requires the GeoJSON polygon to be saved under the key
 * 'offline_hazard_map' so that the Edge Ray-Casting check can run
 * during a simulated network blackout.
 */
import localforage from 'localforage';

const store = localforage.createInstance({
  name: 'pravah',
  storeName: 'hazard_cache',
  description: 'Offline hazard polygons + last-known telemetry',
});

export const KEYS = {
  HAZARD_POLYGON: 'offline_hazard_map',
  LAST_TELEMETRY: 'last_telemetry',
  USER_POSITION: 'user_position',
};

export async function saveHazardPolygon(polygon) {
  await store.setItem(KEYS.HAZARD_POLYGON, polygon);
}

export async function getHazardPolygon() {
  return store.getItem(KEYS.HAZARD_POLYGON);
}

export async function saveLastTelemetry(payload) {
  await store.setItem(KEYS.LAST_TELEMETRY, payload);
}

export async function getLastTelemetry() {
  return store.getItem(KEYS.LAST_TELEMETRY);
}

export async function saveUserPosition(pos) {
  await store.setItem(KEYS.USER_POSITION, pos);
}

export async function getUserPosition() {
  return store.getItem(KEYS.USER_POSITION);
}

export async function clearAll() {
  await store.clear();
}
