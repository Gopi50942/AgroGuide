import type { AgricultureAsset, AgricultureAssetType } from "@/types";

// ─────────────────────────────────────────────
// Phase 140: Agriculture Asset Registry Service
// Public infrastructure inventory across districts and blocks.
// ─────────────────────────────────────────────

let inMemoryAssets: AgricultureAsset[] = [
  {
    id: "ast_soil_lab_01",
    assetType: "soil_lab",
    nameEn: "Coimbatore District Soil Testing Laboratory",
    nameTa: "கோயம்புத்தூர் மாவட்ட மண் பரிசோதனை நிலையம்",
    district: "Coimbatore",
    block: "Thondamuthur",
    capacityDesc: "15,000 samples / year",
    status: "Operational",
    operatorName: "Department of Agriculture, Tamil Nadu",
  },
  {
    id: "ast_seed_lab_01",
    assetType: "seed_lab",
    nameEn: "State Seed Certification & Testing Station",
    nameTa: "மாநில விதை சான்றளிப்பு மற்றும் ஆய்வு மையம்",
    district: "Coimbatore",
    block: "Coimbatore North",
    capacityDesc: "8,000 lot certifications / year",
    status: "Operational",
    operatorName: "Directorate of Seed Certification",
  },
  {
    id: "ast_chc_hub_01",
    assetType: "chc",
    nameEn: "Pollachi Block Custom Hiring Center Hub",
    nameTa: "பொள்ளாச்சி வட்டார வேளாண் இயந்திரங்கள் வாடகை மையம்",
    district: "Coimbatore",
    block: "Pollachi",
    capacityDesc: "12 Tractors, 4 Harvesters, 2 Drone Sprayers",
    status: "Operational",
    operatorName: "Agricultural Engineering Department",
  },
  {
    id: "ast_drone_hub_01",
    assetType: "drone_hub",
    nameEn: "Kongu Agricultural Drone Service Hub",
    nameTa: "கொங்கு வேளாண் ட்ரோன் சேவை மையம்",
    district: "Coimbatore",
    block: "Thondamuthur",
    capacityDesc: "6 Hexacopter Agri Drones (16L)",
    status: "Operational",
    operatorName: "Kongu Farmer Producer Company",
  },
  {
    id: "ast_cold_storage_01",
    assetType: "cold_storage",
    nameEn: "Udumalpet Tomato & Veg Cold Storage",
    nameTa: "உடுமலைப்பேட்டை குளிர்சாதன கிடங்கு",
    district: "Coimbatore",
    block: "Pollachi",
    capacityDesc: "500 Metric Tonnes",
    status: "Operational",
    operatorName: "Tamil Nadu State Agricultural Marketing Board",
  },
];

export async function listAgricultureAssets(
  districtFilter?: string,
  assetTypeFilter?: AgricultureAssetType
): Promise<AgricultureAsset[]> {
  return inMemoryAssets.filter((a) => {
    if (districtFilter && districtFilter !== "ALL" && a.district.toLowerCase() !== districtFilter.toLowerCase()) {
      return false;
    }
    if (assetTypeFilter && a.assetType !== assetTypeFilter) {
      return false;
    }
    return true;
  });
}
