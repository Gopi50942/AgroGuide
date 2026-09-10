import { describe, it, expect } from "vitest";
import { calculateSolarPumpEstimate } from "@/lib/services/solarIrrigationService";

describe("Phase 49 — Solar Water Pump Sizing Estimator", () => {
  it("calculates recommended pump HP, solar array kWp, and PM-KUSUM subsidy tier", () => {
    const result = calculateSolarPumpEstimate({
      farmAreaAcres: 3.5,
      waterSourceType: "borewell",
      waterDepthFeet: 150,
      dailyPumpingHoursNeeded: 5,
      currentPowerSource: "diesel",
    });

    expect(result.recommendedPumpHp).toBeGreaterThanOrEqual(5);
    expect(result.suggestedSolarArrayKwp).toBeGreaterThanOrEqual(5.0);
    expect(result.annualDieselSavingsRs).toBeGreaterThan(10000);
    expect(result.pmKusumSubsidyTierEn).toContain("PM-KUSUM");
    expect(result.disclaimer).toContain("Educational sizing estimate only");
  });
});
