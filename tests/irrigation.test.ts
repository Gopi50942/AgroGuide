import { describe, it, expect } from "vitest";
import {
  calculateWaterBudget,
  getCropKc,
  getIrrigationEfficiency,
} from "@/lib/services/irrigationService";

describe("Irrigation Water Budget & Volume Calculations", () => {
  it("computes stage-dependent crop coefficients (Kc) accurately", () => {
    expect(getCropKc("Paddy", "flowering")).toBeGreaterThan(getCropKc("Paddy", "sowing"));
    expect(getCropKc("Tomato", "flowering")).toBe(1.15);
  });

  it("applies correct irrigation method efficiency multipliers", () => {
    expect(getIrrigationEfficiency("Drip Irrigation")).toBe(0.9);
    expect(getIrrigationEfficiency("Sprinkler")).toBe(0.75);
    expect(getIrrigationEfficiency("Flood / Furrow")).toBe(0.6);
  });

  it("calculates daily volume in litres based on area and weather", () => {
    const res = calculateWaterBudget({
      cropName: "Tomato",
      stage: "vegetative",
      areaAcres: 2,
      irrigationMethod: "Drip Irrigation",
      temperatureC: 32,
      humidity: 55,
      rainProbability: 10,
    });

    expect(res.status).toBe("needed");
    expect(res.dailyVolumeLitres).toBeGreaterThan(5000);
    expect(res.litresPerAcre).toBeGreaterThan(2500);
    expect(res.irrigationEfficiencyPercent).toBe(90);
  });

  it("recommends postponing irrigation when high rainfall is forecast", () => {
    const res = calculateWaterBudget({
      cropName: "Paddy",
      stage: "vegetative",
      areaAcres: 1,
      rainProbability: 80,
    });

    expect(res.status).toBe("not_needed");
    expect(res.effectiveRainMm).toBeGreaterThan(0);
  });
});
