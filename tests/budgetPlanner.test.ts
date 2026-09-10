import { describe, it, expect } from "vitest";
import { calculateBudgetVariance } from "@/lib/services/budgetPlannerService";
import type { Expense } from "@/types";

describe("Phase 74 — Agricultural Expense Budget Planner", () => {
  it("calculates budget variance comparing planned allocations to real recorded expenses", () => {
    const planned = {
      farmId: "farm_1",
      cropId: "crop_1",
      cropName: "Tomato",
      season: "Summer 2026",
      plannedItems: [
        { category: "seeds" as const, plannedCostRs: 5000 },
        { category: "fertilizers" as const, plannedCostRs: 12000 },
        { category: "labour" as const, plannedCostRs: 15000 },
      ],
    };

    const expenses: Expense[] = [
      { id: "e1", ownerId: "u1", category: "seeds", amount: 4500, date: "2026-06-01" },
      { id: "e2", ownerId: "u1", category: "fertilizer", amount: 13000, date: "2026-06-05" }, // Over budget
      { id: "e3", ownerId: "u1", category: "labour", amount: 12000, date: "2026-06-10" },
    ];

    const budget = calculateBudgetVariance(planned, expenses);

    expect(budget.totalPlannedBudgetRs).toBe(32000);
    expect(budget.totalActualExpensesRs).toBe(29500);
    expect(budget.varianceRs).toBe(2500); // Saved ₹2,500 overall
    expect(budget.budgetItems.find((i) => i.category === "fertilizers")?.actualCostRs).toBe(13000);
  });
});
