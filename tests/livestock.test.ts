import { describe, it, expect } from "vitest";
import { calculateMixedFarmingEconomics } from "@/lib/services/livestockService";
import type { MilkYieldLog, Expense } from "@/types";

describe("Phase 38 — Livestock & Mixed-Farming Ledger", () => {
  it("calculates combined farm net profit merging crops and dairy yield", () => {
    const milkLogs: MilkYieldLog[] = [
      {
        id: "m1",
        ownerId: "farmer_1",
        animalId: "a1",
        date: "2026-06-01",
        morningLitres: 7,
        eveningLitres: 5,
        totalLitres: 12,
        sellingPricePerLitre: 40,
        revenueGeneratedRs: 480,
        createdAt: "2026-06-01",
      },
    ];

    const feedExpenses: Expense[] = [
      {
        id: "e1",
        ownerId: "farmer_1",
        category: "fertilizer" as any, // feed
        amount: 180,
        date: "2026-06-01",
        note: "Cattle feed",
      },
    ];

    const cropNetProfit = 50000;
    const eco = calculateMixedFarmingEconomics(cropNetProfit, milkLogs, feedExpenses);

    expect(eco.totalMilkLitres).toBe(12);
    expect(eco.totalMilkRevenueRs).toBe(480);
    expect(eco.livestockNetIncomeRs).toBe(300); // 480 - 180
    expect(eco.combinedFarmNetProfitRs).toBe(50300); // 50000 + 300
  });
});
