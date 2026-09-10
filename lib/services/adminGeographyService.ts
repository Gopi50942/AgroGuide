import type { AdministrativeRegion } from "@/types";

// ─────────────────────────────────────────────
// Phase 103: Administrative Geography Hierarchy Service
// Curated regional administrative structures for Tamil Nadu with clean internal labeling.
// ─────────────────────────────────────────────

export const TAMIL_NADU_ADMIN_REGIONS: AdministrativeRegion[] = [
  // State
  {
    id: "reg_state_tn",
    code: "TN",
    stateCode: "TN",
    nameEn: "Tamil Nadu",
    nameTa: "தமிழ்நாடு",
    type: "state",
    active: true,
    isInternalCode: false,
  },

  // Districts
  {
    id: "reg_dist_cbe",
    code: "CBE",
    stateCode: "TN",
    districtCode: "CBE",
    nameEn: "Coimbatore",
    nameTa: "கோயம்புத்தூர்",
    type: "district",
    parentCode: "TN",
    active: true,
    isInternalCode: false,
  },
  {
    id: "reg_dist_tj",
    code: "TNJ",
    stateCode: "TN",
    districtCode: "TNJ",
    nameEn: "Thanjavur",
    nameTa: "தஞ்சாவூர்",
    type: "district",
    parentCode: "TN",
    active: true,
    isInternalCode: false,
  },
  {
    id: "reg_dist_mdu",
    code: "MDU",
    stateCode: "TN",
    districtCode: "MDU",
    nameEn: "Madurai",
    nameTa: "மதுரை",
    type: "district",
    parentCode: "TN",
    active: true,
    isInternalCode: false,
  },
  {
    id: "reg_dist_slm",
    code: "SLM",
    stateCode: "TN",
    districtCode: "SLM",
    nameEn: "Salem",
    nameTa: "சேலம்",
    type: "district",
    parentCode: "TN",
    active: true,
    isInternalCode: false,
  },

  // Blocks (Coimbatore)
  {
    id: "reg_blk_cbe_pol",
    code: "AG-ADM-BLK-POL",
    stateCode: "TN",
    districtCode: "CBE",
    blockCode: "POL",
    nameEn: "Pollachi",
    nameTa: "பொள்ளாச்சி",
    type: "block",
    parentCode: "CBE",
    active: true,
    isInternalCode: true,
  },
  {
    id: "reg_blk_cbe_thm",
    code: "AG-ADM-BLK-THM",
    stateCode: "TN",
    districtCode: "CBE",
    blockCode: "THM",
    nameEn: "Thondamuthur",
    nameTa: "தொண்டாமுத்தூர்",
    type: "block",
    parentCode: "CBE",
    active: true,
    isInternalCode: true,
  },
  {
    id: "reg_blk_cbe_sul",
    code: "AG-ADM-BLK-SUL",
    stateCode: "TN",
    districtCode: "CBE",
    blockCode: "SUL",
    nameEn: "Sulur",
    nameTa: "சூலூர்",
    type: "block",
    parentCode: "CBE",
    active: true,
    isInternalCode: true,
  },

  // Blocks (Thanjavur)
  {
    id: "reg_blk_tnj_kum",
    code: "AG-ADM-BLK-KUM",
    stateCode: "TN",
    districtCode: "TNJ",
    blockCode: "KUM",
    nameEn: "Kumbakonam",
    nameTa: "கும்பகோணம்",
    type: "block",
    parentCode: "TNJ",
    active: true,
    isInternalCode: true,
  },
  {
    id: "reg_blk_tnj_ora",
    code: "AG-ADM-BLK-ORA",
    stateCode: "TN",
    districtCode: "TNJ",
    blockCode: "ORA",
    nameEn: "Orathanadu",
    nameTa: "ஒரத்தநாடு",
    type: "block",
    parentCode: "TNJ",
    active: true,
    isInternalCode: true,
  },

  // Villages (Sample Panchayat coverage)
  {
    id: "reg_vil_cbe_alr",
    code: "AG-ADM-VIL-ALR",
    stateCode: "TN",
    districtCode: "CBE",
    blockCode: "THM",
    villageCode: "ALR",
    nameEn: "Alandurai",
    nameTa: "ஆலாந்துறை",
    type: "village",
    parentCode: "AG-ADM-BLK-THM",
    active: true,
    isInternalCode: true,
  },
  {
    id: "reg_vil_cbe_prm",
    code: "AG-ADM-VIL-PRM",
    stateCode: "TN",
    districtCode: "CBE",
    blockCode: "THM",
    villageCode: "PRM",
    nameEn: "Perur",
    nameTa: "பேரூர்",
    type: "village",
    parentCode: "AG-ADM-BLK-THM",
    active: true,
    isInternalCode: true,
  },
  {
    id: "reg_vil_tnj_swm",
    code: "AG-ADM-VIL-SWM",
    stateCode: "TN",
    districtCode: "TNJ",
    blockCode: "KUM",
    villageCode: "SWM",
    nameEn: "Swamimalai",
    nameTa: "சுவாமிமலை",
    type: "village",
    parentCode: "AG-ADM-BLK-KUM",
    active: true,
    isInternalCode: true,
  },
];

export function getAdministrativeHierarchy(): AdministrativeRegion[] {
  return TAMIL_NADU_ADMIN_REGIONS;
}

export function getDistricts(stateCode: string = "TN"): AdministrativeRegion[] {
  return TAMIL_NADU_ADMIN_REGIONS.filter(
    (r) => r.type === "district" && r.stateCode === stateCode && r.active
  );
}

export function getBlocks(districtCode: string): AdministrativeRegion[] {
  return TAMIL_NADU_ADMIN_REGIONS.filter(
    (r) => r.type === "block" && (r.districtCode === districtCode || r.parentCode === districtCode) && r.active
  );
}

export function getVillages(blockCode: string): AdministrativeRegion[] {
  return TAMIL_NADU_ADMIN_REGIONS.filter(
    (r) => r.type === "village" && (r.blockCode === blockCode || r.parentCode === blockCode) && r.active
  );
}
