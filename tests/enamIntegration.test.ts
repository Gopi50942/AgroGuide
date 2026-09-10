import { describe, it, expect } from "vitest";
import { enamGateway } from "@/lib/services/enamService";

describe("Phase 45 — e-NAM Electronic Market Layer", () => {
  it("returns honest NOT_CONFIGURED state without fake trade simulation", async () => {
    const res = await enamGateway.getCommodityListings("Tamil Nadu", "Paddy");
    expect(res.status).toBe("NOT_CONFIGURED");
    expect(res.officialPortalUrl).toBe("https://enam.gov.in");
    expect(res.messageEn).toContain("not configured");
    expect(res.data).toEqual([]);
  });
});
