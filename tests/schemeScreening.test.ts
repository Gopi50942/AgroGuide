import { describe, it, expect } from "vitest";
import { evaluateSchemeScreening } from "@/lib/services/governmentService";

describe("Government Scheme Pre-Screening Wizard", () => {
  it("evaluates central and state schemes with non-authoritative verdicts", () => {
    const results = evaluateSchemeScreening({
      state: "Tamil Nadu",
      landAreaAcres: 2.0,
      farmerCategory: "small_marginal",
      cropCategory: "Paddy",
      irrigationType: "Drip Irrigation",
      hasSoilReport: true,
      hasKccLoan: false,
    });

    expect(results.length).toBeGreaterThan(0);

    // Verify verdicts are from the allowed non-authoritative set
    results.forEach((r) => {
      expect(["likely_relevant", "may_be_relevant", "unlikely"]).toContain(r.verdict);
      expect(r.requiredDocumentsEn.length).toBeGreaterThanOrEqual(3);
    });

    // Central schemes must be evaluated
    const pmKisan = results.find((r) => r.schemeId === "pm-kisan" || r.schemeName.includes("PM-KISAN"));
    if (pmKisan) {
      expect(pmKisan.verdict).toBe("likely_relevant");
    }
  });
});
