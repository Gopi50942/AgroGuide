import { describe, it, expect } from "vitest";
import { agriStackGateway } from "@/lib/services/agriStackService";
import { enamGateway } from "@/lib/services/enamService";
import { compareMarketsByReturn } from "@/lib/services/marketService";

describe("Phase 90 — External Provider Failure & Graceful Degradation Simulation", () => {
  it("handles unconfigured AgriStack gracefully with NOT_CONFIGURED status", async () => {
    const res = await agriStackGateway.getFarmerRegistryStatus("farmer_demo_1");
    expect(res.status).toBe("NOT_CONFIGURED");
    expect(res.message).toContain("not configured");
  });

  it("handles unconfigured e-NAM gateway gracefully with clear offline status", async () => {
    const res = await enamGateway.getCommodityListings("Tamil Nadu", "Tomato");
    expect(res.status).toBe("NOT_CONFIGURED");
    expect(res.data).toEqual([]);
  });

  it("computes market returns deterministically without fabricating transportation distance", () => {
    const mockRecords = [
      {
        market: "Coimbatore",
        district: "Coimbatore",
        state: "Tamil Nadu",
        commodity: "Tomato",
        variety: "Hybrid",
        minPrice: 2000,
        maxPrice: 2600,
        modalPrice: 2400,
      },
    ];
    const comparisons = compareMarketsByReturn(mockRecords, 10);
    expect(comparisons.length).toBe(1);
    expect(comparisons[0].estGrossReturnRs).toBe(24000);
    expect(comparisons[0].estNetReturnRs).toBeLessThan(24000);
  });
});
