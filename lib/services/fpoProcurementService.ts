import type { FPOProcurementRound, FPOLot } from "@/types";

// ─────────────────────────────────────────────
// Phase 71: FPO Procurement Workflow & Collective Lot Pooling
// ─────────────────────────────────────────────

export const DEMO_PROCUREMENT_ROUNDS: FPOProcurementRound[] = [
  {
    id: "round_kongu_turmeric_01",
    fpoId: "fpo_01",
    fpoName: "Kongu Farmers Producer Company Ltd",
    crop: "Turmeric",
    grade: "Grade A / FAQ",
    requiredQuantityQuintals: 500,
    minimumLotQuintals: 10,
    targetDate: "2026-07-30",
    referencePricePerQuintal: 14500,
    status: "open",
    cutoffDate: "2026-07-20",
    createdAt: "2026-06-01T00:00:00Z",
  },
  {
    id: "round_cauvery_paddy_02",
    fpoId: "fpo_02",
    fpoName: "Cauvery Delta Organic Paddy FPO",
    crop: "Paddy (CR 1009 / BPT)",
    grade: "Grade A",
    requiredQuantityQuintals: 1200,
    minimumLotQuintals: 25,
    targetDate: "2026-08-15",
    referencePricePerQuintal: 2450,
    status: "open",
    cutoffDate: "2026-08-05",
    createdAt: "2026-06-10T00:00:00Z",
  },
];

export function evaluateProcurementPledge(
  round: FPOProcurementRound,
  pledgedLots: FPOLot[]
): {
  totalPledgedQuintals: number;
  percentageAchieved: number;
  remainingQuintals: number;
  isTargetMet: boolean;
} {
  const totalPledgedQuintals = pledgedLots
    .filter((l) => l.crop.toLowerCase().includes(round.crop.toLowerCase()))
    .reduce((sum, l) => sum + l.quantity, 0);

  const percentageAchieved = Math.min(
    100,
    Math.round((totalPledgedQuintals / round.requiredQuantityQuintals) * 100)
  );
  const remainingQuintals = Math.max(0, round.requiredQuantityQuintals - totalPledgedQuintals);

  return {
    totalPledgedQuintals,
    percentageAchieved,
    remainingQuintals,
    isTargetMet: totalPledgedQuintals >= round.requiredQuantityQuintals,
  };
}
