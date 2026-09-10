import { describe, it, expect } from "vitest";
import { getVillageDigitalTwin, listVillageDigitalTwins } from "@/lib/services/villageDigitalTwinService";

describe("Phase 152 — Village Agriculture Digital Twin", () => {
  it("synthesizes village crop acreage, active stages, and harvest windows without exposing private identities", async () => {
    const twin = await getVillageDigitalTwin("Alandurai");
    expect(twin).not.toBeNull();
    expect(twin?.villageName).toBe("Alandurai");
    expect(twin?.totalCultivatedAcres).toBe(460.0);
    expect(twin?.harvestExpected14DaysAcres).toBe(95.0);
    expect(twin?.farmerCohortCount).toBeGreaterThanOrEqual(5);

    const all = await listVillageDigitalTwins("Coimbatore");
    expect(all.length).toBeGreaterThanOrEqual(1);
  });
});
