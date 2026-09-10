import { describe, it, expect } from "vitest";
import {
  get_district_crop_summary,
  get_district_weather_alerts,
  get_disease_signal_summary,
  get_scheme_application_counts,
  get_open_grievance_counts,
  get_soil_campaign_summary,
} from "@/lib/ai/governmentAiTools";

describe("Phase 121 — Government AI Assistant Read-Only Tools", () => {
  it("executes read-only government summary queries without mutating records", async () => {
    const cropSum = await get_district_crop_summary({ district: "Coimbatore" });
    expect(cropSum.cultivatedAcreage).toBeGreaterThan(1000);
    expect(cropSum.topCrops.length).toBeGreaterThan(2);

    const alerts = await get_district_weather_alerts({ district: "Coimbatore" });
    expect(alerts.activeAlerts.length).toBeGreaterThanOrEqual(1);

    const diseaseSignals = await get_disease_signal_summary({ district: "Coimbatore" });
    expect(diseaseSignals.signals[0].disclaimer).toContain("AI-derived field signal");

    const grvCounts = await get_open_grievance_counts({ district: "Coimbatore" });
    expect(grvCounts.totalOpenGrievances).toBeGreaterThanOrEqual(0);

    const soilCamp = await get_soil_campaign_summary({ district: "Coimbatore" });
    expect(soilCamp.campaigns.length).toBeGreaterThanOrEqual(1);
  });
});
