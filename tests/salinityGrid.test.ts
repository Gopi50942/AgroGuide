import { describe, it, expect } from "vitest";
import { listSalinityStations, SALINITY_DISCLAIMER } from "@/lib/services/salinityService";

describe("Phase 162 — IoT Soil Salinity & Piezometer Grid", () => {
  it("fetches salinity stations with regional watch levels and disclaimer", async () => {
    const stations = await listSalinityStations("Nagapattinam");
    expect(stations.length).toBeGreaterThanOrEqual(1);
    expect(stations[0].ecValueDsM).toBeGreaterThan(0);
    expect(["Normal", "Watch", "Elevated", "Critical Review"]).toContain(stations[0].salinityWatchLevel);
    expect(stations[0].disclaimer).toBe(SALINITY_DISCLAIMER);
  });
});
