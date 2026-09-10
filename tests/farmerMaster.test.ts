import { describe, it, expect } from "vitest";
import { getFarmerMasterProfile } from "@/lib/services/farmerMasterService";
import type { Farm, FarmerProfile } from "@/types";

describe("Phase 62 — Central Farmer Profile Master", () => {
  it("normalizes farmer profile and accurately calculates marginal/small category", () => {
    const profile: Partial<FarmerProfile> = {
      uid: "farmer_101",
      name: "S. Murugesan",
      district: "Thanjavur",
      state: "Tamil Nadu",
      phone: "+919876543210",
      preferredLanguage: "ta",
    };

    const farms: Farm[] = [
      {
        id: "farm_1",
        ownerId: "farmer_101",
        name: "Delta Rice Field",
        location: "Kumbakonam",
        areaAcres: 2.0,
        soilType: "Alluvial",
        irrigationType: "Canal",
      },
    ];

    const master = getFarmerMasterProfile(profile, farms, "farmer_101");

    expect(master.name).toBe("S. Murugesan");
    expect(master.farmerCategory).toBe("marginal"); // <= 2.5 acres
    expect(master.landAreaSummary.totalAcres).toBe(2.0);
    expect(master.landAreaSummary.activeFarmsCount).toBe(1);
    expect(master.profileCompletionPercent).toBeGreaterThan(60);
  });
});
