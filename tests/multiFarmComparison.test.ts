import { describe, it, expect } from "vitest";
import { compareFarmsPerformance } from "@/lib/services/multiFarmComparisonService";
import type { Farm, Crop, HarvestRecord, ProduceSale, Expense } from "@/types";

describe("Phase 76 — Multi-Farm Comparison Analytics", () => {
  it("computes comparative yield per acre and profit per acre across multiple farms", () => {
    const farms: Farm[] = [
      { id: "f1", ownerId: "u1", name: "Farm A (Cauvery)", location: "Thanjavur", areaAcres: 2.0, soilType: "Alluvial", irrigationType: "Canal" },
      { id: "f2", ownerId: "u1", name: "Farm B (Kongu)", location: "Coimbatore", areaAcres: 3.0, soilType: "Red", irrigationType: "Drip" },
    ];

    const crops: Crop[] = [
      { id: "c1", ownerId: "u1", farmId: "f1", name: "Paddy", variety: "CR1009", status: "active" },
      { id: "c2", ownerId: "u1", farmId: "f2", name: "Tomato", variety: "Shivam", status: "active" },
    ];

    const harvests: HarvestRecord[] = [
      { id: "h1", ownerId: "u1", cropId: "c1", farmId: "f1", crop: "Paddy", harvestDate: "2026-06-01", quantity: 60, unit: "quintal", qualityGrade: "Grade A" },
      { id: "h2", ownerId: "u1", cropId: "c2", farmId: "f2", crop: "Tomato", harvestDate: "2026-06-05", quantity: 150, unit: "crate", qualityGrade: "Grade A" },
    ];

    const sales: ProduceSale[] = [
      { id: "s1", ownerId: "u1", cropId: "c1", farmId: "f1", crop: "Paddy", buyerName: "TNCSC", quantity: 60, quantitySold: 60, unit: "quintal", ratePerUnit: 2200, pricePerUnit: 2200, totalAmount: 132000, grossAmount: 132000, netRealization: 132000, saleDate: "2026-06-02" },
      { id: "s2", ownerId: "u1", cropId: "c2", farmId: "f2", crop: "Tomato", buyerName: "Mandi", quantity: 150, quantitySold: 150, unit: "crate", ratePerUnit: 500, pricePerUnit: 500, totalAmount: 75000, grossAmount: 75000, netRealization: 75000, saleDate: "2026-06-06" },
    ];

    const expenses: Expense[] = [
      { id: "e1", ownerId: "u1", farmId: "f1", category: "fertilizer", amount: 40000, date: "2026-05-01" },
      { id: "e2", ownerId: "u1", farmId: "f2", category: "fertilizer", amount: 25000, date: "2026-05-01" },
    ];

    const comparison = compareFarmsPerformance({
      farms,
      crops,
      harvests,
      sales,
      expenses,
    });

    expect(comparison.length).toBe(2);
    expect(comparison[0].farmName).toBe("Farm A (Cauvery)");
    expect(comparison[0].yieldPerAcre).toBe(30); // 60 / 2.0
    expect(comparison[0].netProfitRs).toBe(92000); // 132000 - 40000
    expect(comparison[0].profitPerAcreRs).toBe(46000); // 92000 / 2.0
  });
});
