import type { SolarPumpAsset, SolarPumpTelemetry } from "@/types";

// ─────────────────────────────────────────────
// Phase 143: IoT Solar Pump Telemetry Service
// PM-KUSUM / Smart Solar Pump Telemetry. Read-only monitor (No remote actuation).
// ─────────────────────────────────────────────

let inMemoryPumps: SolarPumpAsset[] = [
  {
    pumpId: "KUSUM-PUMP-TN-0081",
    ownerId: "farmer_gopi_cbe",
    district: "Coimbatore",
    block: "Thondamuthur",
    hpRating: 5.0,
    installationDate: "2025-11-20",
    schemeSource: "PM-KUSUM Component B",
    status: "Active",
  },
  {
    pumpId: "KUSUM-PUMP-TN-0092",
    ownerId: "farmer_ramasamy_tnj",
    district: "Thanjavur",
    block: "Kumbakonam",
    hpRating: 7.5,
    installationDate: "2026-02-14",
    schemeSource: "PM-KUSUM Component B",
    status: "Active",
  },
];

export function getSolarPumpTelemetry(pumpId: string): SolarPumpTelemetry {
  const alerts: string[] = [];
  const rpm = 2850;
  const flowRateLpm = 180;
  const powerKw = 3.8;

  if (rpm > 1000 && flowRateLpm < 20) {
    alerts.push("NO_FLOW_RUNNING: Pump active but zero water discharge detected. Check suction head or dry run.");
  }

  return {
    pumpId,
    timestamp: new Date().toISOString(),
    rpm,
    flowRateLpm,
    powerKw,
    dailyRuntimeMinutes: 340,
    energyGeneratedKwh: 21.5,
    estimatedWaterDeliveredLitres: 61200,
    alerts,
    isDemo: true,
  };
}

export async function listSolarPumps(district?: string): Promise<SolarPumpAsset[]> {
  if (!district || district === "ALL") return inMemoryPumps;
  return inMemoryPumps.filter((p) => p.district.toLowerCase() === district.toLowerCase());
}
