import type { CropHealthGisLayer } from "@/types";

// ─────────────────────────────────────────────
// Phase 133: Crop Health GIS Heatmap Service
// Block-level GIS health classification without exposing individual farm coordinates.
// ─────────────────────────────────────────────

const MOCK_GIS_LAYERS: CropHealthGisLayer[] = [
  {
    district: "Coimbatore",
    block: "Thondamuthur",
    healthLevel: "Watch",
    activeAcreage: 1840.5,
    diseaseSignalCount: 4,
    weatherRiskLevel: "Moderate Rain",
    cohortFarmsCount: 42,
  },
  {
    district: "Coimbatore",
    block: "Pollachi",
    healthLevel: "Normal",
    activeAcreage: 2420.0,
    diseaseSignalCount: 1,
    weatherRiskLevel: "Low Risk",
    cohortFarmsCount: 68,
  },
  {
    district: "Thanjavur",
    block: "Kumbakonam",
    healthLevel: "Normal",
    activeAcreage: 3650.0,
    diseaseSignalCount: 2,
    weatherRiskLevel: "Low Risk",
    cohortFarmsCount: 95,
  },
];

export async function getCropHealthGisLayers(district: string = "Coimbatore"): Promise<CropHealthGisLayer[]> {
  if (district === "ALL") return MOCK_GIS_LAYERS;
  return MOCK_GIS_LAYERS.filter((l) => l.district.toLowerCase() === district.toLowerCase());
}
