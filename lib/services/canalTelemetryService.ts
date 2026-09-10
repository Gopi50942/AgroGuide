import type { CanalSensor } from "@/types";

// ─────────────────────────────────────────────
// Phase 166: Smart Canal & Sluice Flow Telemetry Service
// Water Resources Department canal discharge monitoring. Strictly zero remote gate actuation.
// ─────────────────────────────────────────────

export const CANAL_DISCLAIMER =
  "WRD public telemetry feed. Canal discharge and sluice gate positions are strictly managed by competent Water Resources Department engineers.";

const MOCK_CANAL_SENSORS: CanalSensor[] = [
  {
    sensorId: "CANAL_TN_PAP_01",
    canalName: "Parambikulam Aliyar Project (PAP) Main Canal",
    district: "Coimbatore",
    commandAreaAcres: 377000,
    waterLevelMeters: 2.4,
    flowRateCusecs: 450,
    gatePositionPercent: 65,
    dischargeTrend: "Stable",
    freshness: "LIVE",
    disclaimer: CANAL_DISCLAIMER,
  },
  {
    sensorId: "CANAL_TN_LBP_01",
    canalName: "Lower Bhavani Project (LBP) Main Canal",
    district: "Erode",
    commandAreaAcres: 207000,
    waterLevelMeters: 3.1,
    flowRateCusecs: 1200,
    gatePositionPercent: 80,
    dischargeTrend: "Rising",
    freshness: "LIVE",
    disclaimer: CANAL_DISCLAIMER,
  },
];

export async function listCanalSensors(district?: string): Promise<CanalSensor[]> {
  if (!district || district === "ALL") return MOCK_CANAL_SENSORS;
  return MOCK_CANAL_SENSORS.filter((c) => c.district.toLowerCase() === district.toLowerCase());
}
