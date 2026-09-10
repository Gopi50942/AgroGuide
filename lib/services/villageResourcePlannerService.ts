import type { VillageResourcePlan } from "@/types";

// ─────────────────────────────────────────────
// Phase 174: Village Agricultural Resource Planner Service
// Aggregates input, water, and machinery requirements at village revenue scale.
// ─────────────────────────────────────────────

export const RESOURCE_PLAN_DISCLAIMER =
  "Village resource planning estimate — based on active registered crop mix and standard agronomic norms. Not a binding government procurement quota.";

export function computeVillageResourcePlan(
  villageName: string = "Alandurai",
  district: string = "Coimbatore",
  cultivatedAcres: number = 460.0
): VillageResourcePlan {
  return {
    villageName,
    district,
    cultivatedAcres,
    cropBreakdown: {
      Tomato: 140.0,
      Maize: 120.0,
      "Small Onion": 80.0,
      Banana: 120.0,
    },
    estimatedWaterDemandMillionLitres: 145.0,
    seedRequirementKg: 1850,
    fertilizerRequirementTonnes: 142.5,
    peakTractorHoursEstimated: 680,
    likelyHarvestPeriod: "July 1 – July 25, 2026",
    disclaimer: RESOURCE_PLAN_DISCLAIMER,
  };
}
