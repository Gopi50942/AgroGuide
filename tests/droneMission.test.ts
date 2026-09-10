import { describe, it, expect } from "vitest";
import {
  generateDroneMissionPlan,
  exportDroneMissionKml,
  DRONE_MISSION_DISCLAIMER,
} from "@/lib/services/droneMissionPlannerService";

describe("Phase 163 — Drone Mission Planning Export", () => {
  it("generates mission plan parameters with safety disclaimer and valid KML payload", () => {
    const coords = [
      { lat: 10.957, lng: 76.848 },
      { lat: 10.959, lng: 76.848 },
      { lat: 10.959, lng: 76.851 },
      { lat: 10.957, lng: 76.851 },
    ];

    const plan = generateDroneMissionPlan("farm_01", "Gopi S", "Tomato", 2.5, coords);
    expect(plan.missionId).toMatch(/^MSN-DRN-\d{6}$/);
    expect(plan.plannedAltitudeMeters).toBe(2.5);
    expect(plan.disclaimer).toBe(DRONE_MISSION_DISCLAIMER);

    const kml = exportDroneMissionKml(plan);
    expect(kml).toContain("<?xml version=\"1.0\" encoding=\"UTF-8\"?>");
    expect(kml).toContain("<Polygon>");
    expect(kml).toContain("76.848,10.957,2.5");
  });
});
