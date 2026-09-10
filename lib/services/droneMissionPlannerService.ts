import type { DroneMissionPlan } from "@/types";

// ─────────────────────────────────────────────
// Phase 163: Drone Mission Planning Export Service
// Generates GeoJSON / KML mission files for certified drone pilots. Strictly no flight actuation.
// ─────────────────────────────────────────────

export const DRONE_MISSION_DISCLAIMER =
  "Planning file only. Flight operation requires certified remote pilot and all applicable DGCA / Digital Sky permissions. AgroGuide does not actuate or control aircraft.";

export function generateDroneMissionPlan(
  farmId: string,
  farmerName: string,
  crop: string,
  areaAcres: number,
  polygonCoordinates: { lat: number; lng: number }[]
): DroneMissionPlan {
  const missionId = `MSN-DRN-${Date.now().toString().slice(-6)}`;
  const swathWidthMeters = 4.0;
  const estimatedDurationMinutes = Math.max(5, Math.round(areaAcres * 6)); // ~6 mins per acre
  const waypointCount = Math.max(4, Math.round(areaAcres * 8));

  return {
    missionId,
    farmId,
    farmerName,
    crop,
    areaAcres,
    plannedAltitudeMeters: 2.5, // Standard ag-spraying height
    plannedSpeedMps: 3.5,
    swathWidthMeters,
    overlapPercent: 30,
    operationType: "spraying",
    estimatedDurationMinutes,
    waypointCount,
    polygonCoordinates,
    disclaimer: DRONE_MISSION_DISCLAIMER,
  };
}

export function exportDroneMissionKml(plan: DroneMissionPlan): string {
  const coordsString = plan.polygonCoordinates
    .map((c) => `${c.lng},${c.lat},${plan.plannedAltitudeMeters}`)
    .join(" ");

  return `<?xml version="1.0" encoding="UTF-8"?>
<kml xmlns="http://www.opengis.net/kml/2.2">
  <Document>
    <name>${plan.missionId} - ${plan.crop} Mission</name>
    <description>${plan.disclaimer}</description>
    <Placemark>
      <name>Field Boundary</name>
      <Polygon>
        <outerBoundaryIs>
          <LinearRing>
            <coordinates>${coordsString}</coordinates>
          </LinearRing>
        </outerBoundaryIs>
      </Polygon>
    </Placemark>
  </Document>
</kml>`;
}
