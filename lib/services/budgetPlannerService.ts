import type { CropBudgetPlan, CropBudgetItem, Expense } from "@/types";

// ─────────────────────────────────────────────
// Phase 74: Agricultural Expense Budget Planner Service
// Compares planned budget allocations vs real recorded expenses
// ─────────────────────────────────────────────

export function calculateBudgetVariance(
  plannedBudget: {
    farmId: string;
    cropId: string;
    cropName: string;
    season: string;
    plannedItems: { category: CropBudgetItem["category"]; plannedCostRs: number }[];
  },
  actualExpenses: Expense[]
): CropBudgetPlan {
  const budgetItems: CropBudgetItem[] = plannedBudget.plannedItems.map((item) => {
    // Tally actual matching expenses
    const matchingActual = actualExpenses
      .filter((e) => {
        if (item.category === "seeds" && e.category === "seeds") return true;
        if (item.category === "fertilizers" && e.category === "fertilizer") return true;
        if (item.category === "labour" && e.category === "labour") return true;
        if (item.category === "irrigation" && e.category === "irrigation") return true;
        if (item.category === "machinery_rental" && (e.category === "equipment" || (e.category as string) === "machinery")) return true;
        if (item.category === "pest_control" && (e.category === "pesticides" || (e.category as string) === "pesticide")) return true;
        return false;
      })
      .reduce((sum, e) => sum + e.amount, 0);

    return {
      category: item.category,
      plannedCostRs: item.plannedCostRs,
      actualCostRs: matchingActual,
    };
  });

  const totalPlannedBudgetRs = budgetItems.reduce((s, i) => s + i.plannedCostRs, 0);
  const totalActualExpensesRs = budgetItems.reduce((s, i) => s + i.actualCostRs, 0);
  const varianceRs = totalPlannedBudgetRs - totalActualExpensesRs; // positive = saved

  return {
    id: `budget_${plannedBudget.cropId}_${Date.now()}`,
    ownerId: actualExpenses[0]?.ownerId || "farmer_user",
    farmId: plannedBudget.farmId,
    cropId: plannedBudget.cropId,
    cropName: plannedBudget.cropName,
    season: plannedBudget.season,
    totalPlannedBudgetRs,
    totalActualExpensesRs,
    varianceRs,
    budgetItems,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}
