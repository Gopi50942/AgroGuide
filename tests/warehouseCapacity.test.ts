import { describe, it, expect } from "vitest";
import { listWarehouseCapacities } from "@/lib/services/warehouseCapacityService";

describe("Phase 156 — Agricultural Warehouse Capacity Intelligence", () => {
  it("tracks storage utilization and available capacity with data freshness tags", async () => {
    const whs = await listWarehouseCapacities("Coimbatore");
    expect(whs.length).toBeGreaterThanOrEqual(1);
    expect(whs[0].totalCapacityTonnes).toBeGreaterThan(0);
    expect(whs[0].availableCapacityTonnes).toBeGreaterThan(0);
    expect(["LIVE", "RECENT", "STALE"]).toContain(whs[0].freshness);
  });
});
