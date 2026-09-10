import { describe, it, expect } from "vitest";
import {
  parseAndValidateSoilCard,
  parseCsvSoilCardString,
} from "@/lib/services/soilCardImportService";

describe("Phase 46 — Soil Health Card Import & Validation", () => {
  it("parses valid CSV string into structured SoilReport with recommendations", () => {
    const csv = `pH,Nitrogen,Phosphorus,Potassium,EC,OrganicCarbon,Lab\n6.5,280,22,210,0.45,0.65,TNAU Soil Lab Coimbatore`;
    const res = parseCsvSoilCardString("farmer_1", "farm_cauvery_01", csv);

    expect(res.success).toBe(true);
    expect(res.importedReport).toBeDefined();
    expect(res.importedReport?.ph).toBe(6.5);
    expect(res.importedReport?.nitrogen).toBe(280);
    expect(res.importedReport?.phosphorus).toBe(22);
    expect(res.importedReport?.organicCarbon).toBe(0.65);
    expect(res.importedReport?.recommendationSummary?.length).toBeGreaterThan(0);
  });

  it("rejects out-of-bound or corrupted soil chemical parameters", () => {
    const invalidRaw = {
      farmId: "farm_1",
      ph: 15.2, // Impossible pH
      nitrogen: -50,
      organicCarbon: 25.0, // Impossible OC
    };

    const res = parseAndValidateSoilCard("farmer_1", invalidRaw);
    expect(res.success).toBe(false);
    expect(res.validationErrors.length).toBeGreaterThan(0);
    expect(res.validationErrors.some((e) => e.includes("pH"))).toBe(true);
  });
});
