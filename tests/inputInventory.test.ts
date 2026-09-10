import { describe, it, expect } from "vitest";
import {
  consumeInputStock,
  type FarmInputInventoryItem,
} from "@/lib/services/inventoryService";

describe("Phase 73 — Farm Input Inventory Tracker", () => {
  it("consumes stock correctly and detects low reorder thresholds", () => {
    const item: FarmInputInventoryItem = {
      id: "inv_1",
      ownerId: "u1",
      itemName: "Bio-Fertilizer Azospirillum",
      category: "bio_input",
      quantityOnHand: 6,
      reorderLevel: 3,
      unit: "1kg Packet",
      purchaseDate: "2026-06-01",
      purchaseCostRs: 900,
      createdAt: "2026-06-01",
      updatedAt: "2026-06-01",
    };

    const res1 = consumeInputStock(item, 2);
    expect(res1.updatedItem.quantityOnHand).toBe(4);
    expect(res1.isLowStock).toBe(false);

    const res2 = consumeInputStock(item, 4);
    expect(res2.updatedItem.quantityOnHand).toBe(2);
    expect(res2.isLowStock).toBe(true); // <= 3
  });
});
