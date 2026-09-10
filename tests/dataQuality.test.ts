import { describe, it, expect } from "vitest";
import { auditFarmDataQuality } from "@/lib/services/dataQualityService";
import type { Farm, Crop, HarvestRecord, Expense } from "@/types";

describe("Phase 63 — Farm Data Quality Validation Engine", () => {
  it("detects critical harvest-before-sowing errors and negative financial entries", () => {
    const farms: Farm[] = [
      { id: "f1", ownerId: "user_1", name: "Farm 1", location: "Coimbatore", areaAcres: 3, soilType: "Red", irrigationType: "Drip" },
    ];

    const crops: Crop[] = [
      {
        id: "c1",
        ownerId: "user_1",
        farmId: "f1",
        name: "Tomato",
        variety: "Shivam",
        sowingDate: "2026-06-15",
        status: "active",
        currentStage: "fruiting",
      },
    ];

    const harvests: HarvestRecord[] = [
      {
        id: "h1",
        ownerId: "user_1",
        cropId: "c1",
        crop: "Tomato",
        harvestDate: "2026-06-01", // Impossibly before sowing
        quantity: 50,
        unit: "crate",
        qualityGrade: "Grade A",
      },
    ];

    const expenses: Expense[] = [
      {
        id: "e1",
        ownerId: "user_1",
        category: "seed",
        amount: -500, // Invalid negative amount
        date: "2026-06-10",
      },
    ];

    const issues = auditFarmDataQuality({
      farms,
      crops,
      harvests,
      sales: [],
      expenses,
      soilReports: [],
    });

    expect(issues.length).toBe(2);
    expect(issues.some((i) => i.category === "harvest" && i.severity === "CRITICAL")).toBe(true);
    expect(issues.some((i) => i.category === "finance" && i.severity === "CRITICAL")).toBe(true);
  });
});
