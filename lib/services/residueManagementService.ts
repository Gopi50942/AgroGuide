import type { CropResidueRecord } from "@/types";

// ─────────────────────────────────────────────
// Phase 154: Crop Residue Management & Burning Prevention Service
// Non-punitive sustainable residue guidance (mulching, baling, incorporation).
// ─────────────────────────────────────────────

let inMemoryResidues: CropResidueRecord[] = [
  {
    id: "res_rec_01",
    ownerId: "farmer_gopi_cbe",
    farmId: "farm_cbe_main",
    crop: "Tomato",
    residueType: "Haulm & Vine Biomass",
    estimatedQuantityQuintals: 18,
    plannedPractice: "mulching",
    burningRisk: "Low",
    guidanceNotesEn: "Incorporate chopped tomato vine biomass with Trichoderma viride to enrich soil organic carbon.",
    guidanceNotesTa: "தக்காளி கொடி கழிவுகளை நறுக்கி மண்ணில் மக்கச் செய்து மண்புழு உரமாக்குதல் நன்மை தரும்.",
    createdAt: new Date().toISOString(),
  },
  {
    id: "res_rec_02",
    ownerId: "farmer_ramasamy_tnj",
    farmId: "farm_tnj_paddy",
    crop: "Paddy",
    residueType: "Paddy Straw",
    estimatedQuantityQuintals: 45,
    plannedPractice: "baling",
    burningRisk: "Moderate",
    guidanceNotesEn: "Use tractor-operated straw baler for dairy cattle fodder and mushroom cultivation beds.",
    guidanceNotesTa: "நெல் வைக்கோலை பேலர் இயந்திரம் மூலம் கட்டுகளாக்கி கால்நடை தீவனத்திற்கு பயன்படுத்தவும்.",
    createdAt: new Date().toISOString(),
  },
];

export async function recordCropResidue(
  ownerId: string,
  farmId: string,
  crop: string,
  residueType: string,
  estimatedQuantityQuintals: number,
  plannedPractice: CropResidueRecord["plannedPractice"]
): Promise<CropResidueRecord> {
  const burningRisk = plannedPractice === "mulching" || plannedPractice === "baling" || plannedPractice === "compost" ? "Low" : "Moderate";

  const rec: CropResidueRecord = {
    id: `res_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
    ownerId,
    farmId,
    crop,
    residueType,
    estimatedQuantityQuintals,
    plannedPractice,
    burningRisk,
    guidanceNotesEn: "Sustainable residue recycling enriches soil microbial health and conserves soil moisture.",
    guidanceNotesTa: "பயிர் கழிவு மேலாண்மை மண்ணின் நுண்ணுயிர் பெருக்கத்திற்கும் ஈரப்பதம் காப்பதற்கும் உதவும்.",
    createdAt: new Date().toISOString(),
  };

  inMemoryResidues.unshift(rec);
  return rec;
}

export async function listCropResidueRecords(ownerId?: string): Promise<CropResidueRecord[]> {
  if (ownerId) return inMemoryResidues.filter((r) => r.ownerId === ownerId);
  return inMemoryResidues;
}
