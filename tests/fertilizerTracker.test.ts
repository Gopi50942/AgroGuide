import { describe, it, expect } from "vitest";
import {
  listFertilizerStockPoints,
  listFertilizerMovements,
} from "@/lib/services/fertilizerTrackerService";

describe("Phase 129 — Fertilizer Supply & Rake Movement Tracker", () => {
  it("tracks district TANFED buffer stock balances and inbound rakes", async () => {
    const stocks = await listFertilizerStockPoints("Coimbatore");
    expect(stocks.length).toBeGreaterThanOrEqual(1);
    expect(stocks[0].closingStockTonnes).toBeGreaterThan(0);

    const rakes = await listFertilizerMovements("Coimbatore");
    expect(rakes.length).toBeGreaterThanOrEqual(1);
    expect(rakes[0].quantityTonnes).toBeGreaterThan(1000);
    expect(rakes[0].status).toBe("In Transit");
  });
});
