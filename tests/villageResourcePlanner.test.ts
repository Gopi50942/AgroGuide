import { describe, it, expect } from "vitest";
import { computeVillageResourcePlan, RESOURCE_PLAN_DISCLAIMER } from "@/lib/services/villageResourcePlannerService";

describe("Phase 174 — Village Agricultural Resource Planner", () => {
  it("aggregates seed, fertilizer, and machinery requirements with planning disclaimer", () => {
    const plan = computeVillageResourcePlan("Alandurai", "Coimbatore", 460.0);
    expect(plan.villageName).toBe("Alandurai");
    expect(plan.seedRequirementKg).toBeGreaterThan(1000);
    expect(plan.fertilizerRequirementTonnes).toBeGreaterThan(50);
    expect(plan.peakTractorHoursEstimated).toBeGreaterThan(100);
    expect(plan.disclaimer).toBe(RESOURCE_PLAN_DISCLAIMER);
  });
});
