// ─────────────────────────────────────────────
// Phase 35: Geodesic Polygon Area Calculator (WGS84 Spherical Trigonometry)
// Accurately calculates field acreage from GPS coordinates without paid API dependencies.
// ─────────────────────────────────────────────

const EARTH_RADIUS_METERS = 6378137;

/**
 * Calculates area of a closed polygon in square meters using spherical excess.
 * Coordinates are expected as [ [lng, lat], [lng, lat], ... ]
 */
export function calculatePolygonAreaSqMeters(coordinates: number[][]): number {
  if (!coordinates || coordinates.length < 3) return 0;

  // Ensure closed ring
  const ring = [...coordinates];
  if (
    ring[0][0] !== ring[ring.length - 1][0] ||
    ring[0][1] !== ring[ring.length - 1][1]
  ) {
    ring.push(ring[0]);
  }

  let totalArea = 0;
  const len = ring.length;

  for (let i = 0; i < len - 1; i++) {
    const p1 = ring[i];
    const p2 = ring[i + 1];

    const lon1Rad = (p1[0] * Math.PI) / 180;
    const lat1Rad = (p1[1] * Math.PI) / 180;
    const lon2Rad = (p2[0] * Math.PI) / 180;
    const lat2Rad = (p2[1] * Math.PI) / 180;

    totalArea +=
      (lon2Rad - lon1Rad) * (2 + Math.sin(lat1Rad) + Math.sin(lat2Rad));
  }

  totalArea = (Math.abs(totalArea) * EARTH_RADIUS_METERS * EARTH_RADIUS_METERS) / 4.0;
  return totalArea;
}

/**
 * Converts square meters to Acres and Hectares
 */
export function convertSqMetersToUnits(sqMeters: number): {
  sqMeters: number;
  acres: number;
  hectares: number;
  cents: number;
} {
  const acres = sqMeters / 4046.8564224;
  const hectares = sqMeters / 10000;
  const cents = acres * 100;

  return {
    sqMeters: Math.round(sqMeters * 100) / 100,
    acres: Math.round(acres * 100) / 100,
    hectares: Math.round(hectares * 100) / 100,
    cents: Math.round(cents * 100) / 100,
  };
}

/**
 * Calculates centroid of polygon
 */
export function calculatePolygonCentroid(coordinates: number[][]): {
  lat: number;
  lng: number;
} {
  if (!coordinates || coordinates.length === 0) return { lat: 11.0168, lng: 76.9558 };

  let sumLat = 0;
  let sumLng = 0;
  coordinates.forEach(([lng, lat]) => {
    sumLat += lat;
    sumLng += lng;
  });

  return {
    lat: sumLat / coordinates.length,
    lng: sumLng / coordinates.length,
  };
}
