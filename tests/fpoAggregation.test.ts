import { describe, it, expect } from "vitest";
import { calculateFpoTotalPooled, type FPOLot } from "@/lib/services/fpoService";

describe("Phase 34 — FPO Produce Aggregation", () => {
  it("calculates collective pooled produce quantity across farmer lots", () => {
    const lots: FPOLot[] = [
      {
        id: "lot_1",
        ownerId: "farmer_1",
        fpoId: "fpo_01",
        crop: "Turmeric",
        variety: "Erode Local",
        grade: "FAQ",
        quantity: 50,
        unit: "quintal",
        availableDate: "2026-07-01",
        status: "pooled",
        createdAt: "2026-06-01",
      },
      {
        id: "lot_2",
        ownerId: "farmer_2",
        fpoId: "fpo_01",
        crop: "Turmeric",
        variety: "Salem BSR-2",
        grade: "FAQ",
        quantity: 75,
        unit: "quintal",
        availableDate: "2026-07-05",
        status: "pooled",
        createdAt: "2026-06-02",
      },
    ];

    const result = calculateFpoTotalPooled(lots, "Turmeric");
    expect(result.totalQuantity).toBe(125);
    expect(result.lotCount).toBe(2);
    expect(result.unit).toBe("quintal");
  });
});
