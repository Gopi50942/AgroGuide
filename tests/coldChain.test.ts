import { describe, it, expect } from "vitest";
import { getColdChainTelemetry, listColdChainAssets } from "@/lib/services/coldChainService";

describe("Phase 145 — State Cold Chain Telemetry", () => {
  it("monitors storage units and reefer transit with temperature excursion detection", async () => {
    const assets = await listColdChainAssets("Coimbatore");
    expect(assets.length).toBeGreaterThanOrEqual(1);

    const telem = getColdChainTelemetry(assets[0].id);
    expect(telem.assetId).toBe(assets[0].id);
    expect(telem.temperatureC).toBeDefined();
    expect(telem.humidityPercent).toBeGreaterThan(50);
    expect(telem.excursionAlert).toBe(false);
  });
});
