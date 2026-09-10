import { describe, it, expect } from "vitest";
import { getDistrictGroundwaterTelemetry } from "@/lib/services/groundwaterService";

describe("Phase 123 — State Groundwater & Piezometer Telemetry", () => {
  it("fetches regional piezometer telemetry with disclaimer", async () => {
    const readings = await getDistrictGroundwaterTelemetry("Coimbatore");
    expect(readings.length).toBeGreaterThanOrEqual(1);
    expect(readings[0].waterLevelMeters).toBeGreaterThan(0);
    expect(readings[0].disclaimer).toContain("Regional groundwater indicator");
    expect(["Stable", "Declining", "Recovering"]).toContain(readings[0].trend);
  });
});
