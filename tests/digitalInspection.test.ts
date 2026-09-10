import { describe, it, expect } from "vitest";
import {
  calculateDistanceMeters,
  createFieldInspection,
} from "@/lib/services/digitalInspectionService";

describe("Phase 108 — Digital Field Inspection & GPS Verification", () => {
  it("calculates accurate geodesic distance between GPS points", () => {
    // Distance between two points in Coimbatore ~ 1.1 km
    const dist = calculateDistanceMeters(10.957, 76.848, 10.965, 76.855);
    expect(dist).toBeGreaterThan(500);
    expect(dist).toBeLessThan(2000);
  });

  it("detects centroid mismatch when inspection is far from registered farm coordinates", async () => {
    const inspection = await createFieldInspection(
      "officer_test",
      "Muthukumar",
      "farmer_test",
      "Gopi",
      "farm_1",
      "Demo Farm",
      "Subsidy verification",
      "2026-06-01",
      { lat: 10.957, lng: 76.848, accuracyMeters: 5 },
      { lat: 11.050, lng: 77.000 }, // ~19 km away
      "Tomato",
      "fruiting"
    );

    expect(inspection.farmCentroidMismatch).toBe(true);
    expect(inspection.status).toBe("Completed");
  });
});
