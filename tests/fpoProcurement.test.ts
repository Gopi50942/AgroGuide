import { describe, it, expect } from "vitest";
import {
  evaluateProcurementPledge,
  DEMO_PROCUREMENT_ROUNDS,
} from "@/lib/services/fpoProcurementService";
import type { FPOLot } from "@/types";

describe("Phase 71 — FPO Procurement Workflow", () => {
  it("tracks collective produce pledged toward procurement target", () => {
    const round = DEMO_PROCUREMENT_ROUNDS[0]; // 500 Quintals target
    const lots: FPOLot[] = [
      {
        id: "l1",
        ownerId: "f1",
        fpoId: "fpo_01",
        crop: "Turmeric",
        variety: "Erode",
        grade: "FAQ",
        quantity: 150,
        unit: "quintal",
        availableDate: "2026-07-15",
        status: "pooled",
        createdAt: "2026-06-01",
      },
      {
        id: "l2",
        ownerId: "f2",
        fpoId: "fpo_01",
        crop: "Turmeric",
        variety: "Salem",
        grade: "FAQ",
        quantity: 200,
        unit: "quintal",
        availableDate: "2026-07-16",
        status: "pooled",
        createdAt: "2026-06-02",
      },
    ];

    const pledge = evaluateProcurementPledge(round, lots);
    expect(pledge.totalPledgedQuintals).toBe(350);
    expect(pledge.percentageAchieved).toBe(70);
    expect(pledge.remainingQuintals).toBe(150);
    expect(pledge.isTargetMet).toBe(false);
  });
});
