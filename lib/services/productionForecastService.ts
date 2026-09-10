import type { Crop, HarvestRecord, ProductionForecast } from "@/types";

// ─────────────────────────────────────────────
// Phase 117: Agricultural Production Forecast Service
// Transparent production range estimation with clear participation-based methodology disclaimers.
// ─────────────────────────────────────────────

export const METHODOLOGY_DISCLAIMER =
  "AgroGuide participation-based estimate — based on registered acreage, stage development, and localized yield norms. Not an official census forecast.";

const AVERAGE_YIELD_QUINTALS_PER_ACRE: Record<string, { min: number; max: number }> = {
  tomato: { min: 140, max: 180 },
  paddy: { min: 22, max: 28 },
  maize: { min: 25, max: 35 },
  banana: { min: 250, max: 320 },
  cotton: { min: 8, max: 14 },
  turmeric: { min: 20, max: 30 },
};

export function generateProductionForecast(
  crops: Crop[],
  targetCropName: string = "Tomato",
  targetDistrict: string = "Coimbatore"
): ProductionForecast {
  const filteredCrops = crops.filter(
    (c) => c.name.toLowerCase().includes(targetCropName.toLowerCase())
  );

  const totalAcreage = filteredCrops.reduce((sum, c) => sum + (c.areaAcres || 1.0), 0) || 50.0;
  const cropKey = targetCropName.toLowerCase();
  const yieldNorms = AVERAGE_YIELD_QUINTALS_PER_ACRE[cropKey] || { min: 50, max: 80 };

  // 1 Quintal = 0.1 Tonnes
  const minTonnes = Math.round(totalAcreage * yieldNorms.min * 0.1);
  const maxTonnes = Math.round(totalAcreage * yieldNorms.max * 0.1);

  return {
    cropName: targetCropName,
    district: targetDistrict,
    estimatedAcreage: Math.round(totalAcreage * 10) / 10,
    minProductionTonnes: minTonnes,
    maxProductionTonnes: maxTonnes,
    participatingFarmsCount: filteredCrops.length || 1,
    methodologyDisclaimer: METHODOLOGY_DISCLAIMER,
  };
}
