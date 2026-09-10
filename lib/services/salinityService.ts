import type { SalinityStation } from "@/types";

// ─────────────────────────────────────────────
// Phase 162: IoT Soil Salinity & Piezometer Grid Service
// Coastal and delta salinity monitoring grid with non-extrapolation disclaimers.
// ─────────────────────────────────────────────

export const SALINITY_DISCLAIMER =
  "Regional Salinity Watch — based on public groundwater piezometer and soil salinity sensors. Not an individual farm borewell or soil guarantee.";

const MOCK_SALINITY_STATIONS: SalinityStation[] = [
  {
    stationId: "SAL_TN_NGP_01",
    district: "Nagapattinam",
    block: "Kilvelur",
    latitude: 10.712,
    longitude: 79.843,
    source: "State Groundwater & Salinity Cell",
    qualityFlag: "Good",
    ecValueDsM: 2.8, // 0-2 = Non-saline, 2-4 = Slightly saline
    groundwaterEcValueDsM: 3.4,
    waterLevelMeters: 4.2,
    temperatureC: 28.5,
    salinityWatchLevel: "Watch",
    freshness: "LIVE",
    disclaimer: SALINITY_DISCLAIMER,
  },
  {
    stationId: "SAL_TN_TNJ_02",
    district: "Thanjavur",
    block: "Pattukkottai",
    latitude: 10.432,
    longitude: 79.319,
    source: "Delta Agronomic Research Station",
    qualityFlag: "Good",
    ecValueDsM: 1.4,
    groundwaterEcValueDsM: 1.8,
    waterLevelMeters: 6.1,
    temperatureC: 29.0,
    salinityWatchLevel: "Normal",
    freshness: "LIVE",
    disclaimer: SALINITY_DISCLAIMER,
  },
];

export async function listSalinityStations(district?: string): Promise<SalinityStation[]> {
  if (!district || district === "ALL") return MOCK_SALINITY_STATIONS;
  return MOCK_SALINITY_STATIONS.filter((s) => s.district.toLowerCase() === district.toLowerCase());
}
