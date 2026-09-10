import type { Farm, Crop, WaterResourcePlanning } from "@/types";

// ─────────────────────────────────────────────
// Phase 116: Water Resource & Irrigation Planning Service
// Aggregates drip coverage, flood irrigation acreage, crop water demand, and deficit indicators.
// ─────────────────────────────────────────────

export function aggregateWaterPlanning(
  farms: Farm[],
  crops: Crop[],
  targetDistrict: string = "Coimbatore",
  targetBlock: string = "Thondamuthur"
): WaterResourcePlanning {
  let dripAcres = 0;
  let floodAcres = 0;
  let highDemandAcres = 0;

  farms.forEach((f) => {
    const area = f.areaAcres || 2.0;
    if (f.irrigationType === "drip" || f.irrigationType === "sprinkler") {
      dripAcres += area;
    } else if (f.irrigationType === "flood" || f.irrigationType === "furrow") {
      floodAcres += area;
    }
  });

  crops.forEach((c) => {
    const area = c.areaAcres || 1.0;
    const nameLower = c.name.toLowerCase();
    if (
      nameLower.includes("paddy") ||
      nameLower.includes("sugarcane") ||
      nameLower.includes("banana")
    ) {
      highDemandAcres += area;
    }
  });

  // Estimated demand in Million Litres (average 4.5 Million Litres per acre for annual high demand)
  const totalDemandMillionLitres = Math.round((dripAcres * 2.2 + floodAcres * 5.0) * 10) / 10;

  return {
    district: targetDistrict,
    block: targetBlock,
    dripCoverageAcres: Math.round(dripAcres * 10) / 10,
    floodIrrigationAcres: Math.round(floodAcres * 10) / 10,
    highWaterDemandAcres: Math.round(highDemandAcres * 10) / 10,
    estimatedDemandMillionLitres: totalDemandMillionLitres,
    rainfallDeficitPercent: 12.5, // Reference meteorological deficit indicator
  };
}
