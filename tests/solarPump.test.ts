import { describe, it, expect } from "vitest";
import { getSolarPumpTelemetry, listSolarPumps } from "@/lib/services/solarPumpService";

describe("Phase 143 — IoT Solar Pump Telemetry", () => {
  it("generates structured pump runtime and discharge telemetry with dry-run detection", async () => {
    const telem = getSolarPumpTelemetry("KUSUM-PUMP-TN-0081");
    expect(telem.pumpId).toBe("KUSUM-PUMP-TN-0081");
    expect(telem.rpm).toBeGreaterThan(0);
    expect(telem.flowRateLpm).toBeGreaterThan(0);
    expect(telem.estimatedWaterDeliveredLitres).toBeGreaterThan(0);
    expect(telem.isDemo).toBe(true);

    const pumps = await listSolarPumps("Coimbatore");
    expect(pumps.length).toBeGreaterThanOrEqual(1);
    expect(pumps[0].schemeSource).toBe("PM-KUSUM Component B");
  });
});
