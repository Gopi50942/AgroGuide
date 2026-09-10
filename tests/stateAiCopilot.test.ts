import { describe, it, expect } from "vitest";
import {
  get_state_crop_summary,
  get_groundwater_summary,
  get_aws_summary,
  get_cce_summary,
  get_fertilizer_stock,
  get_seed_quality_summary,
  get_disease_risk_map,
} from "@/lib/ai/stateAiCommandTools";

describe("Phase 141 — State Agriculture AI Command Copilot Read-Only Tools", () => {
  it("executes state-level decision queries safely without mutation", async () => {
    const cropSum = await get_state_crop_summary({ district: "Coimbatore" });
    expect(cropSum.totalDigitizedAcreage).toBeGreaterThan(1000);

    const gwSum = await get_groundwater_summary({ district: "Coimbatore" });
    expect(gwSum.stationsCount).toBeGreaterThanOrEqual(1);

    const awsSum = await get_aws_summary({ district: "Coimbatore" });
    expect(awsSum.stations.length).toBeGreaterThanOrEqual(1);

    const cceSum = await get_cce_summary({ district: "Coimbatore" });
    expect(cceSum.totalExperiments).toBeGreaterThanOrEqual(1);

    const fertSum = await get_fertilizer_stock({ district: "Coimbatore" });
    expect(fertSum.stockPoints.length).toBeGreaterThanOrEqual(1);

    const seedSum = await get_seed_quality_summary({ district: "Coimbatore" });
    expect(seedSum.totalLotsTested).toBeGreaterThanOrEqual(1);

    const gisSum = await get_disease_risk_map({ district: "Coimbatore" });
    expect(gisSum.riskLayers.length).toBeGreaterThanOrEqual(1);
  });
});
