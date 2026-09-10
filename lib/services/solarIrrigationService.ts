import type { SolarPumpEstimateInput, SolarPumpEstimateResult } from "@/types";

// ─────────────────────────────────────────────
// Phase 49: Solar Water Pump Sizing Estimator & PM-KUSUM Advisory
// Provides educational sizing guidelines and energy savings calculations
// ─────────────────────────────────────────────

export function calculateSolarPumpEstimate(
  input: SolarPumpEstimateInput
): SolarPumpEstimateResult {
  const depth = Math.max(10, input.waterDepthFeet || 50);
  const area = Math.max(0.5, input.farmAreaAcres || 2);
  const hours = Math.min(10, Math.max(2, input.dailyPumpingHoursNeeded || 5));

  // Determine pump HP based on depth and area
  let recommendedPumpHp = 3;
  if (depth > 250 || area > 5) {
    recommendedPumpHp = 7.5;
  } else if (depth > 120 || area > 3) {
    recommendedPumpHp = 5;
  }

  // Sizing ratio: ~1 kWp per HP for DC solar submersible pumps
  const suggestedSolarArrayKwp = Math.round(recommendedPumpHp * 1.0 * 10) / 10;

  // Approximate flow rate (Litres/hour based on HP & head)
  const litresPerHour = recommendedPumpHp === 3 ? 9000 : recommendedPumpHp === 5 ? 15000 : 22000;
  const estimatedDailyWaterOutputLitres = litresPerHour * hours;

  // Economic & Environmental calculations
  let annualDieselSavingsRs = 0;
  let co2ReductionTonnesPerYear = 0;

  if (input.currentPowerSource === "diesel") {
    const litresDieselPerDay = recommendedPumpHp * 0.8 * (hours / 2);
    const annualDieselCost = litresDieselPerDay * 95 * 180; // 180 operating days
    annualDieselSavingsRs = Math.round(annualDieselCost);
    co2ReductionTonnesPerYear = Math.round(litresDieselPerDay * 2.68 * 180 / 1000 * 10) / 10;
  } else {
    // Grid electricity offset
    co2ReductionTonnesPerYear = Math.round(suggestedSolarArrayKwp * 1400 * 0.82 / 1000 * 10) / 10;
    annualDieselSavingsRs = Math.round(suggestedSolarArrayKwp * 1400 * 6.5);
  }

  const pmKusumSubsidyTierEn =
    "PM-KUSUM Component B: Up to 60% subsidy (30% Central + 30% State Govt) for standalone solar agricultural pumps.";
  const pmKusumSubsidyTierTa =
    "பி.எம். குசும் திட்டம் (பிரிவு B): தனித்தனி சோலார் பம்புசெட்டுகளுக்கு 60% வரை மானியம் (30% மத்திய அரசு + 30% மாநில அரசு).";

  return {
    recommendedPumpHp,
    suggestedSolarArrayKwp,
    estimatedDailyWaterOutputLitres,
    annualDieselSavingsRs,
    co2ReductionTonnesPerYear,
    pmKusumSubsidyTierEn,
    pmKusumSubsidyTierTa,
    disclaimer:
      "Educational sizing estimate only — not an electrical engineering certification. Consult an authorized PM-KUSUM empanelled vendor for official site survey.",
  };
}
