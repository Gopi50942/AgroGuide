import { describe, it, expect } from "vitest";
import { computeCropProfitability } from "@/lib/services/produceSalesService";
import type { Expense, ProduceSale, HarvestRecord } from "@/types";

describe("Crop Profitability & ROI Formulas", () => {
  it("computes net profit, profit per acre, and ROI correctly", () => {
    const expenses: Expense[] = [
      { id: "e1", cropId: "c1", category: "seeds", amount: 10000, date: "2026-08-01" },
      { id: "e2", cropId: "c1", category: "fertilizer", amount: 15000, date: "2026-08-10" },
    ];
    const harvests: HarvestRecord[] = [
      { id: "h1", ownerId: "u1", cropId: "c1", cropName: "Tomato", harvestDate: "2026-08-20", quantity: 2000, quantityUnit: "kg" },
    ];
    const sales: ProduceSale[] = [
      {
        id: "s1",
        ownerId: "u1",
        cropId: "c1",
        cropName: "Tomato",
        saleDate: "2026-08-22",
        buyerType: "mandi",
        quantity: 2000,
        quantityUnit: "kg",
        ratePerUnit: 35,
        grossAmount: 70000,
        transportCost: 3000,
        commissionCost: 2000,
        otherSellingCost: 0,
        netRealization: 65000,
        paymentStatus: "paid",
      },
    ];

    const result = computeCropProfitability({
      cropId: "c1",
      cropName: "Tomato",
      areaAcres: 2,
      expenses,
      sales,
      harvests,
    });

    expect(result.totalExpenses).toBe(25000);
    expect(result.grossSales).toBe(70000);
    expect(result.totalSellingCosts).toBe(5000);
    expect(result.netRealization).toBe(65000);
    expect(result.netProfit).toBe(40000); // 65000 - 25000
    expect(result.profitPerAcre).toBe(20000); // 40000 / 2
    expect(result.roiPercent).toBe(160); // (40000 / 25000) * 100
  });

  it("handles 0 expenses and 0 sales without division by zero errors", () => {
    const result = computeCropProfitability({
      cropId: "c2",
      cropName: "Paddy",
      areaAcres: 0,
      expenses: [],
      sales: [],
      harvests: [],
    });

    expect(result.totalExpenses).toBe(0);
    expect(result.netProfit).toBe(0);
    expect(result.profitPerAcre).toBe(0);
    expect(result.roiPercent).toBe(0);
  });
});
