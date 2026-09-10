import type { VillageDigitalTwin } from "@/types";

// ─────────────────────────────────────────────
// Phase 152: Village Agriculture Digital Twin Service
// Village-level operational snapshot without exposing individual farmer identities.
// ─────────────────────────────────────────────

const MOCK_VILLAGE_TWINS: VillageDigitalTwin[] = [
  {
    villageId: "AG-ADM-VIL-ALR",
    villageName: "Alandurai",
    district: "Coimbatore",
    block: "Thondamuthur",
    totalCultivatedAcres: 460.0,
    cropAcreageBreakdown: {
      Tomato: 140.0,
      Maize: 120.0,
      "Small Onion": 80.0,
      Banana: 120.0,
    },
    activeCropStages: ["Flowering", "Fruiting", "Vegetative"],
    rainfallRiskLevel: "Moderate",
    pestSignalLevel: "Watch",
    harvestExpected14DaysAcres: 95.0,
    farmerCohortCount: 42,
  },
  {
    villageId: "AG-ADM-VIL-PRM",
    villageName: "Perur",
    district: "Coimbatore",
    block: "Thondamuthur",
    totalCultivatedAcres: 380.0,
    cropAcreageBreakdown: {
      Paddy: 180.0,
      Sugarcane: 110.0,
      Vegetables: 90.0,
    },
    activeCropStages: ["Tillering", "Vegetative"],
    rainfallRiskLevel: "Low",
    pestSignalLevel: "Normal",
    harvestExpected14DaysAcres: 20.0,
    farmerCohortCount: 38,
  },
];

export async function getVillageDigitalTwin(villageNameOrId: string): Promise<VillageDigitalTwin | null> {
  const match = MOCK_VILLAGE_TWINS.find(
    (v) =>
      v.villageId.toLowerCase() === villageNameOrId.toLowerCase() ||
      v.villageName.toLowerCase() === villageNameOrId.toLowerCase()
  );
  return match || MOCK_VILLAGE_TWINS[0];
}

export async function listVillageDigitalTwins(district?: string): Promise<VillageDigitalTwin[]> {
  if (!district || district === "ALL") return MOCK_VILLAGE_TWINS;
  return MOCK_VILLAGE_TWINS.filter((v) => v.district.toLowerCase() === district.toLowerCase());
}
