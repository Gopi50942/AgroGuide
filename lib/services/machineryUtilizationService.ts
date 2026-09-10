import type { MachineryUtilizationSummary } from "@/types";

// ─────────────────────────────────────────────
// Phase 153: Farm Machinery Utilization Intelligence Service
// Fleet efficiency metrics across custom hiring hubs.
// ─────────────────────────────────────────────

const MOCK_MACHINERY_SUMMARIES: MachineryUtilizationSummary[] = [
  {
    assetId: "asset_drone_01",
    assetType: "Drone Sprayer (16L Hexacopter)",
    district: "Coimbatore",
    block: "Thondamuthur",
    utilizationRatePercent: 82.5,
    idleHoursPerWeek: 12,
    bookingBacklogCount: 8,
    demandStatus: "High Demand / Shortage",
  },
  {
    assetId: "asset_tractor_01",
    assetType: "Tractor (45HP with Rotavator)",
    district: "Coimbatore",
    block: "Pollachi",
    utilizationRatePercent: 68.0,
    idleHoursPerWeek: 24,
    bookingBacklogCount: 3,
    demandStatus: "Optimal",
  },
  {
    assetId: "asset_harvester_01",
    assetType: "Paddy Track Combine Harvester",
    district: "Thanjavur",
    block: "Kumbakonam",
    utilizationRatePercent: 94.0,
    idleHoursPerWeek: 4,
    bookingBacklogCount: 15,
    demandStatus: "High Demand / Shortage",
  },
];

export async function getMachineryUtilization(district?: string): Promise<MachineryUtilizationSummary[]> {
  if (!district || district === "ALL") return MOCK_MACHINERY_SUMMARIES;
  return MOCK_MACHINERY_SUMMARIES.filter((m) => m.district.toLowerCase() === district.toLowerCase());
}
