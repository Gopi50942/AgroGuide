import { describe, it, expect } from "vitest";
import {
  evaluateSustainabilityScore,
  type SustainabilityPracticeRecord,
} from "@/lib/services/sustainabilityService";

describe("Phase 40 — Sustainable Farming & Carbon Indicators", () => {
  it("scores regenerative practices qualitatively without claiming tradable carbon credits", () => {
    const practices: SustainabilityPracticeRecord[] = [
      {
        id: "p1",
        ownerId: "f1",
        farmId: "farm_1",
        practiceType: "drip_irrigation",
        dateAdopted: "2025-06-01",
        areaAcresCovered: 3,
        createdAt: "2025-06-01",
      },
      {
        id: "p2",
        ownerId: "f1",
        farmId: "farm_1",
        practiceType: "organic_manure",
        dateAdopted: "2025-07-01",
        areaAcresCovered: 3,
        createdAt: "2025-07-01",
      },
      {
        id: "p3",
        ownerId: "f1",
        farmId: "farm_1",
        practiceType: "crop_rotation",
        dateAdopted: "2026-01-01",
        areaAcresCovered: 3,
        createdAt: "2026-01-01",
      },
    ];

    const summary = evaluateSustainabilityScore(practices, []);

    expect(summary.overallScore).toBeGreaterThan(40);
    expect(["Developing", "Strong"]).toContain(summary.rating);
    expect(summary.waterEfficiencyRating).toBe("Strong");
    expect(summary.soilImprovementRating).toBe("Strong");
    expect(summary.disclaimer).toContain("Educational estimate only");
  });
});
