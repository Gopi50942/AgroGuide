import { describe, it, expect } from "vitest";
import {
  calculateNormalizedYield,
  recordCropCuttingExperiment,
  listCropCuttingExperiments,
  updateCceStatus,
} from "@/lib/services/cceService";

describe("Phase 125 — Crop Cutting Experiment (CCE) Digital Ledger", () => {
  it("calculates accurate normalized yield per hectare with moisture adjustment", () => {
    // 42.5 kg from 25 sq.m sample plot (10,000 sq.m / 25 = 400 multiplier) -> 17,000 kg/ha = 170 Qtl/Ha
    const res = calculateNormalizedYield(42.5, 25, 14, 14);
    expect(res.yieldKgPerHa).toBe(17000);
    expect(res.yieldQuintalPerHa).toBe(170.0);
  });

  it("records CCE field experiment and updates verification status", async () => {
    const cce = await recordCropCuttingExperiment(
      "Coimbatore",
      "Thondamuthur",
      "Alandurai",
      "farm_test",
      "Gopi",
      "Tomato",
      "Kharif 2026",
      25,
      40.0,
      14,
      "officer_1",
      "Muthukumar",
      { lat: 10.957, lng: 76.848 }
    );

    expect(cce.id).toBeDefined();
    expect(cce.status).toBe("Collected");
    expect(cce.normalizedYieldQuintalPerHa).toBe(160.0);

    const updated = await updateCceStatus(cce.id, "Verified");
    expect(updated?.status).toBe("Verified");

    const list = await listCropCuttingExperiments("Coimbatore");
    expect(list.some((item) => item.id === cce.id)).toBe(true);
  });
});
