import type { DroneBatteryStation } from "@/types";

// ─────────────────────────────────────────────
// Phase 170: Kisan Drone Energy & Battery Station Registry Service
// Battery charging infrastructure across rural custom hiring centers.
// ─────────────────────────────────────────────

const MOCK_DRONE_STATIONS: DroneBatteryStation[] = [
  {
    stationId: "CHG-DRN-CBE-01",
    name: "Pollachi Central Kisan Drone Fast-Charging Hub",
    district: "Coimbatore",
    block: "Pollachi",
    batteryType: "12S 22,000mAh Smart LiPo / Solid-State",
    totalSlots: 12,
    availableSlots: 8,
    chargingSlots: 4,
    operationalStatus: "Operational",
    operatorName: "Agricultural Engineering Department",
  },
  {
    stationId: "CHG-DRN-CBE-02",
    name: "Thondamuthur FPO Drone Mobile Charging Van",
    district: "Coimbatore",
    block: "Thondamuthur",
    batteryType: "14S 30,000mAh Smart Pack",
    totalSlots: 8,
    availableSlots: 6,
    chargingSlots: 2,
    operationalStatus: "Operational",
    operatorName: "Kongu Farmer Producer Company",
  },
];

export async function listDroneBatteryStations(district?: string): Promise<DroneBatteryStation[]> {
  if (!district || district === "ALL") return MOCK_DRONE_STATIONS;
  return MOCK_DRONE_STATIONS.filter((s) => s.district.toLowerCase() === district.toLowerCase());
}
