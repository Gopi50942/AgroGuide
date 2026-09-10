import { describe, it, expect } from "vitest";
import { generateSeasonPerformanceReport } from "@/lib/services/seasonPerformanceService";
import type { Crop, Expense, HarvestRecord, ProduceSale } from "@/types";

describe("Phase 75 — Season-End Farm Performance Report", () => {
  it("compiles full agronomic and financial performance metrics with ROI %", () => {
    const crop: Crop = {
      id: "c1",
      ownerId: "u1",
      farmId: "f1",
      name: "Hybrid Tomato",
      variety: "Shivam",
      sowingDate: "2026-03-01",
      status: "harvested",
      areaAcres: 2.0,
    };

    const expenses: Expense[] = [
      { id: "e1", ownerId: "u1", category: "seed", amount: 10000, date: "2026-03-01" },
      { id: "e2", ownerId: "u1", category: "labor", amount: 20000, date: "2026-04-01" },
    ];

    const harvests: HarvestRecord[] = [
      { id: "h1", ownerId: "u1", cropId: "c1", crop: "Tomato", harvestDate: "2026-06-01", quantity: 120, unit: "crate", qualityGrade: "Grade A" },
    ];

    const sales: ProduceSale[] = [
      { id: "s1", ownerId: "u1", cropId: "c1", crop: "Tomato", buyerName: "Coimbatore Mandi", quantity: 120, quantitySold: 120, unit: "crate", ratePerUnit: 600, pricePerUnit: 600, totalAmount: 72000, grossAmount: 72000, netRealization: 72000, saleDate: "2026-06-02" },
    ];

    const report = generateSeasonPerformanceReport({
      crop,
      farmName: "Cauvery North Farm",
      season: "Summer 2026",
      durationDays: 105,
      expenses,
      harvests,
      sales,
      irrigationLogs: [],
      diseaseReports: [],
      tasks: [],
    });

    expect(report.totalExpensesRs).toBe(30000);
    expect(report.totalSalesRevenueRs).toBe(72000);
    expect(report.netProfitRs).toBe(42000);
    expect(report.roiPercent).toBe(140); // (42000 / 30000) * 100 = 140%
    expect(report.disclaimer).toContain("Educational crop performance summary");
  });
});
