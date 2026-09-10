import { describe, it, expect } from "vitest";
import { getSoilGuidanceKeys } from "@/lib/services/soilService";

describe("Soil Health Recommendations Calculation", () => {
  it("identifies acidic pH and low nitrogen", () => {
    const keys = getSoilGuidanceKeys({
      ph: 5.5,
      nitrogen: 200,
      phosphorus: 20,
      potassium: 180,
      organicCarbon: 0.6,
    });

    expect(keys).toContain("soil.acidic");
    expect(keys).toContain("soil.lowN");
  });

  it("identifies alkaline pH and low organic carbon", () => {
    const keys = getSoilGuidanceKeys({
      ph: 8.2,
      nitrogen: 350,
      organicCarbon: 0.3,
    });

    expect(keys).toContain("soil.alkaline");
    expect(keys).toContain("soil.lowOc");
  });

  it("identifies favorable soil parameters", () => {
    const keys = getSoilGuidanceKeys({
      ph: 6.8,
      nitrogen: 350,
      organicCarbon: 0.9,
    });

    expect(keys).toContain("soil.favorable");
  });
});
