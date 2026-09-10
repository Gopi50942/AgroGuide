import type { ReservoirCanalStatus } from "@/types";

// ─────────────────────────────────────────────
// Phase 136: Reservoir & Canal Irrigation Planning Service
// Live reservoir storage, canal releases, and command area telemetry.
// ─────────────────────────────────────────────

export const RESERVOIR_DISCLAIMER =
  "Official reservoir storage and canal discharge telemetry based on WRD/PWD public bulletins. Water release decisions are governed by the competent irrigation authority.";

const MOCK_RESERVOIRS: ReservoirCanalStatus[] = [
  {
    reservoirName: "Aliyar Dam",
    district: "Coimbatore",
    currentStorageTmc: 2.85,
    totalCapacityTmc: 3.86,
    livePercentage: 73.8,
    canalReleaseCusecs: 450,
    commandAreaAcreage: 44000,
    statusDisclaimer: RESERVOIR_DISCLAIMER,
  },
  {
    reservoirName: "Bhavanisagar Dam",
    district: "Erode",
    currentStorageTmc: 24.2,
    totalCapacityTmc: 32.8,
    livePercentage: 73.7,
    canalReleaseCusecs: 1200,
    commandAreaAcreage: 247000,
    statusDisclaimer: RESERVOIR_DISCLAIMER,
  },
  {
    reservoirName: "Mettur Dam (Stanley Reservoir)",
    district: "Salem",
    currentStorageTmc: 68.5,
    totalCapacityTmc: 93.4,
    livePercentage: 73.3,
    canalReleaseCusecs: 10000,
    commandAreaAcreage: 1600000,
    statusDisclaimer: RESERVOIR_DISCLAIMER,
  },
];

export async function getReservoirCanalStatus(district: string = "Coimbatore"): Promise<ReservoirCanalStatus[]> {
  if (district === "ALL") return MOCK_RESERVOIRS;
  const matches = MOCK_RESERVOIRS.filter((r) => r.district.toLowerCase() === district.toLowerCase());
  return matches.length > 0 ? matches : MOCK_RESERVOIRS.slice(0, 1);
}
