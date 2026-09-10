import type { GroundwaterStationTelemetry } from "@/types";

// ─────────────────────────────────────────────
// Phase 123: State Groundwater / Piezometer Intelligence Service
// Telemetry from regional CGWB/State piezometers. Clear non-extrapolation disclaimer.
// ─────────────────────────────────────────────

export const GROUNDWATER_DISCLAIMER =
  "Regional groundwater indicator — based on state piezometer telemetry. Not an individual farm borewell guarantee.";

const MOCK_PIEZOMETERS: GroundwaterStationTelemetry[] = [
  {
    stationId: "CGWB_TN_CBE_001",
    district: "Coimbatore",
    block: "Pollachi",
    timestamp: new Date().toISOString(),
    waterLevelMeters: 14.2, // meters below ground level
    trend: "Stable",
    qualityFlag: "Good",
    disclaimer: GROUNDWATER_DISCLAIMER,
  },
  {
    stationId: "CGWB_TN_CBE_002",
    district: "Coimbatore",
    block: "Thondamuthur",
    timestamp: new Date().toISOString(),
    waterLevelMeters: 18.6,
    trend: "Declining",
    qualityFlag: "Caution",
    disclaimer: GROUNDWATER_DISCLAIMER,
  },
  {
    stationId: "CGWB_TN_TNJ_001",
    district: "Thanjavur",
    block: "Kumbakonam",
    timestamp: new Date().toISOString(),
    waterLevelMeters: 6.4,
    trend: "Recovering",
    qualityFlag: "Good",
    disclaimer: GROUNDWATER_DISCLAIMER,
  },
  {
    stationId: "CGWB_TN_MDU_001",
    district: "Madurai",
    block: "Melur",
    timestamp: new Date().toISOString(),
    waterLevelMeters: 12.8,
    trend: "Stable",
    qualityFlag: "Good",
    disclaimer: GROUNDWATER_DISCLAIMER,
  },
];

export async function getDistrictGroundwaterTelemetry(district: string = "Coimbatore"): Promise<GroundwaterStationTelemetry[]> {
  if (district === "ALL") return MOCK_PIEZOMETERS;
  return MOCK_PIEZOMETERS.filter((s) => s.district.toLowerCase() === district.toLowerCase());
}
