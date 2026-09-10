import { describe, it, expect } from "vitest";
import { getSoilMicronutrientDeficiency } from "@/lib/services/soilMicronutrientService";

describe("Phase 150 — Soil Micronutrient Spatial Intelligence", () => {
  it("computes Zinc, Boron, and Carbon deficits with sample density safeguards", async () => {
    const defs = await getSoilMicronutrientDeficiency("Coimbatore", "Thondamuthur");
    expect(defs.length).toBeGreaterThanOrEqual(1);
    expect(defs[0].zincDeficiencyPercent).toBeGreaterThan(0);
    expect(defs[0].samplesCount).toBeGreaterThanOrEqual(20);
    expect(defs[0].spatialEstimateStatus).toBe("Valid Interpolation");
  });
});
