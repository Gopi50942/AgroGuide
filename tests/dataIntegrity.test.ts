import { describe, it, expect } from "vitest";
import { listDataIntegrityAnomalies } from "@/lib/services/dataIntegrityService";

describe("Phase 179 — Production Data Integrity & Anti-Fraud Signals", () => {
  it("flags inconsistent inspection photos and yield outliers without unilateral fraud claims", async () => {
    const anomalies = await listDataIntegrityAnomalies();
    expect(anomalies.length).toBeGreaterThanOrEqual(1);
    expect(["Info", "Review", "High Review"]).toContain(anomalies[0].reviewLevel);
    expect(anomalies[0].description).toContain("verification");
  });
});
