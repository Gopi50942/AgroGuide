import { describe, it, expect } from "vitest";
import {
  aggregateVillageCropCensus,
} from "@/lib/services/cropCensusService";
import type { Farm, Crop } from "@/types";

describe("Phase 109 — Village Crop Census & Privacy Threshold", () => {
  const mockFarms: Farm[] = [
    { id: "f1", ownerId: "u1", name: "Farm 1", location: "Coimbatore", areaAcres: 2.5, soilType: "red", irrigationType: "drip", district: "Coimbatore", taluk: "Thondamuthur", village: "Alandurai" },
    { id: "f2", ownerId: "u2", name: "Farm 2", location: "Coimbatore", areaAcres: 3.0, soilType: "black", irrigationType: "flood", district: "Coimbatore", taluk: "Thondamuthur", village: "Alandurai" },
    { id: "f3", ownerId: "u3", name: "Farm 3", location: "Coimbatore", areaAcres: 1.5, soilType: "clay", irrigationType: "drip", district: "Coimbatore", taluk: "Thondamuthur", village: "Alandurai" },
    { id: "f4", ownerId: "u4", name: "Farm 4", location: "Coimbatore", areaAcres: 4.0, soilType: "loam", irrigationType: "drip", district: "Coimbatore", taluk: "Thondamuthur", village: "Alandurai" },
    { id: "f5", ownerId: "u5", name: "Farm 5", location: "Coimbatore", areaAcres: 2.0, soilType: "red", irrigationType: "rainfed", district: "Coimbatore", taluk: "Thondamuthur", village: "Alandurai" },
  ];

  const mockCrops: Crop[] = [
    { id: "c1", ownerId: "u1", name: "Tomato", farmId: "f1", areaAcres: 2.0, sowingDate: "2026-04-01" },
    { id: "c2", ownerId: "u2", name: "Tomato", farmId: "f2", areaAcres: 2.5, sowingDate: "2026-04-01" },
    { id: "c3", ownerId: "u3", name: "Tomato", farmId: "f3", areaAcres: 1.0, sowingDate: "2026-04-01" },
    { id: "c4", ownerId: "u4", name: "Tomato", farmId: "f4", areaAcres: 3.0, sowingDate: "2026-04-01" },
    { id: "c5", ownerId: "u5", name: "Tomato", farmId: "f5", areaAcres: 1.5, sowingDate: "2026-04-01" },
  ];

  it("enforces minimum cohort threshold (5 farms) for aggregate acreage display", () => {
    const census = aggregateVillageCropCensus(mockFarms, mockCrops);
    expect(census.length).toBe(1);
    expect(census[0].participatingFarmsCount).toBe(5);
    expect(census[0].privacyCohortProtected).toBe(true);
    expect(census[0].totalAcreage).toBe(10);
  });

  it("obscures aggregate acreage if cohort is smaller than 5 farms", () => {
    // Only 2 farms
    const census = aggregateVillageCropCensus(mockFarms.slice(0, 2), mockCrops.slice(0, 2));
    expect(census.length).toBe(1);
    expect(census[0].participatingFarmsCount).toBe(2);
    expect(census[0].privacyCohortProtected).toBe(false);
    expect(census[0].totalAcreage).toBe(0); // Obscured
  });
});
