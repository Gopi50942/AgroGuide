import { describe, it, expect } from "vitest";
import { evaluateCropSeasonPlan } from "@/lib/services/cropSeasonPlannerService";

describe("Phase 29 — Smart Crop Season Planner", () => {
  it("suggests Paddy during Samba season with abundant canal water in clay soil", () => {
    const recs = evaluateCropSeasonPlan({
      state: "Tamil Nadu",
      district: "Thanjavur",
      seasonOrMonth: "samba",
      soilType: "clay",
      waterAvailability: "abundant",
      landAreaAcres: 5,
    });

    expect(recs.length).toBeGreaterThan(0);
    const paddyRec = recs.find((r) => r.cropNameEn.includes("Paddy"));
    expect(paddyRec).toBeDefined();
    expect(paddyRec?.waterDemand).toBe("High");
    expect(paddyRec?.varietySuggestionsEn.length).toBeGreaterThan(0);
  });

  it("prioritizes drought-hardy Millets and Pulses under rainfed or limited water conditions", () => {
    const recs = evaluateCropSeasonPlan({
      state: "Tamil Nadu",
      district: "Dharmapuri",
      seasonOrMonth: "kharif",
      soilType: "red",
      waterAvailability: "rainfed",
      landAreaAcres: 2,
    });

    expect(recs.length).toBeGreaterThan(0);
    const milletOrPulse = recs.some(
      (r) => r.cropNameEn.includes("Millet") || r.cropNameEn.includes("Gram") || r.waterDemand === "Low"
    );
    expect(milletOrPulse).toBe(true);

    // Paddy should NOT be recommended for rainfed red soil
    const hasPaddy = recs.some((r) => r.cropNameEn.includes("Paddy"));
    expect(hasPaddy).toBe(false);
  });
});
