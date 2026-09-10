/**
 * Pure-JS Point-in-Polygon check using Ray-Casting.
 * Spec (PRD Section 5):
 *
 *   function isPointInPolygon(point, vs) {
 *     var x = point[0], y = point[1];
 *     var inside = false;
 *     for (var i = 0, j = vs.length - 1; i < vs.length; j = i++) {
 *       var xi = vs[i][0], yi = vs[i][1];
 *       var xj = vs[j][0], yj = vs[j][1];
 *       var intersect = ((yi > y) != (yj > y))
 *           && (x < (xj - xi) * (y - yi) / (yj - yi) + xi);
 *       if (intersect) inside = !inside;
 *     }
 *     return inside;
 *   }
 *
 * Convention used here: GeoJSON-style [longitude, latitude] ordering.
 * We expose both `isPointInPolygon([lon,lat], polygon)` and a
 * `isInsideHazardZone` helper that unwraps the GeoJSON Polygon shape.
 */

/** @param {[number, number]} point  [lon, lat] */
/** @param {Array<[number, number]>} vs  polygon ring, [[lon, lat], ...] */
export function isPointInPolygon(point, vs) {
  const x = point[0];
  const y = point[1];
  let inside = false;
  for (let i = 0, j = vs.length - 1; i < vs.length; j = i++) {
    const xi = vs[i][0];
    const yi = vs[i][1];
    const xj = vs[j][0];
    const yj = vs[j][1];
    const intersect =
      yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi;
    if (intersect) inside = !inside;
  }
  return inside;
}

/**
 * GeoJSON Polygon has shape:
 *   { type: "Polygon", coordinates: [ [ [lon,lat], ... ] ] }
 * Returns true if [lon, lat] is inside the first ring.
 */
export function isInsideHazardZone(lon, lat, geojsonPolygon) {
  if (!geojsonPolygon || !Array.isArray(geojsonPolygon.coordinates)) return false;
  const ring = geojsonPolygon.coordinates[0];
  return isPointInPolygon([lon, lat], ring);
}
