import { describe, it, expect } from "vitest";
import { listCanalSensors, CANAL_DISCLAIMER } from "@/lib/services/canalTelemetryService";

describe("Phase 166 — Smart Canal & Sluice Flow Telemetry", () => {
  it("fetches WRD canal telemetry records with disclaimer", async () => {
    const sensors = await listCanalSensors("Coimbatore");
    expect(sensors.length).toBeGreaterThanOrEqual(1);
    expect(sensors[0].flowRateCusecs).toBeGreaterThan(0);
    expect(sensors[0].disclaimer).toBe(CANAL_DISCLAIMER);
  });
});
