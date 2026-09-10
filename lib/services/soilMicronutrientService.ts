import type { SoilMicronutrientDeficiency } from "@/types";

// ─────────────────────────────────────────────
// Phase 150: Soil Micronutrient Spatial Intelligence Service
// District deficiency mapping for Zinc, Boron, Iron, and Sulphur. Sample density thresholds.
// ─────────────────────────────────────────────

export const MICRONUTRIENT_DISCLAIMER =
  "Spatial estimate based on aggregated Soil Health Card test samples. Requires minimum sample density of 20 samples per block.";

const MOCK_MICRONUTRIENTS: SoilMicronutrientDeficiency[] = [
  {
    district: "Coimbatore",
    block: "Thondamuthur",
    zincDeficiencyPercent: 34.5,
    boronDeficiencyPercent: 28.0,
    ironDeficiencyPercent: 12.0,
    sulphurDeficiencyPercent: 18.5,
    organicCarbonDeficitPercent: 42.0,
    samplesCount: 145,
    spatialEstimateStatus: "Valid Interpolation",
    disclaimer: MICRONUTRIENT_DISCLAIMER,
  },
  {
    district: "Coimbatore",
    block: "Pollachi",
    zincDeficiencyPercent: 22.0,
    boronDeficiencyPercent: 44.0, // High Boron deficiency in coconut soils
    ironDeficiencyPercent: 8.0,
    sulphurDeficiencyPercent: 14.0,
    organicCarbonDeficitPercent: 30.0,
    samplesCount: 210,
    spatialEstimateStatus: "Valid Interpolation",
    disclaimer: MICRONUTRIENT_DISCLAIMER,
  },
];

export async function getSoilMicronutrientDeficiency(
  district: string = "Coimbatore",
  block?: string
): Promise<SoilMicronutrientDeficiency[]> {
  let matches = MOCK_MICRONUTRIENTS.filter((m) => m.district.toLowerCase() === district.toLowerCase());
  if (block && block !== "ALL") {
    matches = matches.filter((m) => m.block.toLowerCase() === block.toLowerCase());
  }
  return matches.length > 0 ? matches : MOCK_MICRONUTRIENTS.slice(0, 1);
}
