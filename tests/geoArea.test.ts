import { describe, it, expect } from "vitest";
import {
  calculatePolygonAreaSqMeters,
  convertSqMetersToUnits,
  calculatePolygonCentroid,
} from "@/lib/utils/geoAreaCalculator";

describe("Phase 35 — GPS Farm Polygon Area Calculator", () => {
  it("calculates square meters and converts correctly to acres and hectares", () => {
    // Approx 100m x 100m square (10,000 m2 = ~2.47 acres = 1 hectare)
    const squareCoords = [
      [76.9558, 11.0168],
      [76.9568, 11.0168],
      [76.9568, 11.0178],
      [76.9558, 11.0178],
    ];

    const sqMeters = calculatePolygonAreaSqMeters(squareCoords);
    expect(sqMeters).toBeGreaterThan(5000);

    const units = convertSqMetersToUnits(10000);
    expect(units.hectares).toBe(1);
    expect(units.acres).toBeCloseTo(2.47, 1);
  });

  it("calculates geographic centroid correctly", () => {
    const coords = [
      [76.0, 11.0],
      [78.0, 11.0],
      [78.0, 13.0],
      [76.0, 13.0],
    ];

    const centroid = calculatePolygonCentroid(coords);
    expect(centroid.lng).toBe(77.0);
    expect(centroid.lat).toBe(12.0);
  });
});
