import { getFirebaseDb, isFirebaseConfigured } from "@/lib/firebase/config";
import { collection, doc, getDocs, setDoc, query, where } from "firebase/firestore";
import type {
  SustainabilityPracticeType,
  SustainabilityPracticeRecord,
  SustainabilityScoreSummary,
  SoilReport,
} from "@/types";

// ─────────────────────────────────────────────
// Phase 40: Sustainable Farming & Educational Carbon Indicators
// Evaluates qualitative regenerative practices without claiming certified carbon credits.
// ─────────────────────────────────────────────

export const SUSTAINABLE_PRACTICE_DEFINITIONS: {
  type: SustainabilityPracticeType;
  titleEn: string;
  titleTa: string;
  category: "soil" | "water" | "input" | "residue" | "biodiversity";
  descriptionEn: string;
  descriptionTa: string;
  weight: number;
}[] = [
  {
    type: "crop_rotation",
    titleEn: "Crop Rotation & Pulse Inclusion",
    titleTa: "பயிர் சுழற்சி & பயறு வகை பயிரிடுதல்",
    category: "biodiversity",
    descriptionEn: "Alternating cereal and leguminous crops to break pest cycles and fix biological nitrogen.",
    descriptionTa: "பூச்சி சுழற்சியை உடைத்து நைட்ரஜன் சத்தை அதிகரிக்க பயறு மற்றும் தானிய பயிர் சுழற்சி செய்தல்.",
    weight: 15,
  },
  {
    type: "mulching",
    titleEn: "Organic Straw / Plastic Mulching",
    titleTa: "வைக்கோல் / மூடாக்கு அமைத்தல்",
    category: "water",
    descriptionEn: "Conserves soil moisture, moderates soil temperature, and suppresses weeds naturally.",
    descriptionTa: "மண் ஈரப்பதத்தை காக்கவும், களைகளை கட்டுப்படுத்தவும் வைக்கோல் மூடாக்கு அமைத்தல்.",
    weight: 15,
  },
  {
    type: "organic_manure",
    titleEn: "Farmyard Manure & Vermicompost Application",
    titleTa: "தொழுஉரம் & மண்புழு உரம் பயன்பாடு",
    category: "soil",
    descriptionEn: "Enhances soil microbial activity, organic carbon, and cation exchange capacity.",
    descriptionTa: "மண்ணின் நுண்ணுயிர் பெருக்கம் மற்றும் கரிம கார்பனை உயர்த்த தொழு உரம் இடுதல்.",
    weight: 20,
  },
  {
    type: "reduced_tillage",
    titleEn: "Minimum / Zero Tillage",
    titleTa: "குறைந்த உழவு முறை (Zero Tillage)",
    category: "soil",
    descriptionEn: "Preserves soil aggregate structure and prevents erosion of topsoil.",
    descriptionTa: "மண் அரிப்பை தடுத்து மேல்மண் கட்டமைப்பை பாதுகாக்க குறைந்த உழவு செய்தல்.",
    weight: 10,
  },
  {
    type: "drip_irrigation",
    titleEn: "Micro / Drip Irrigation Adoption",
    titleTa: "சொட்டுநீர் பாசன முறை",
    category: "water",
    descriptionEn: "Achieves 40–60% water savings and targeted nutrient fertigation.",
    descriptionTa: "40-60% பாசன நீரை சேமித்து பயிரின் வேர்ப்பகுதிக்கு துல்லியமாக நீர் வழங்குதல்.",
    weight: 20,
  },
  {
    type: "cover_crop",
    titleEn: "Green Manure / Cover Crops (Daincha / Sunnhemp)",
    titleTa: "பசுந்தாள் உரம் (தக்கைப்பூண்டு / சணப்பை)",
    category: "soil",
    descriptionEn: "Incorporated into soil prior to main crop to add 15–20 tons of organic biomass.",
    descriptionTa: "மண்ணில் உழுது கரிம உயிரியல் எடையை சேர்க்க பசுந்தாள் பயிர் வளர்த்தல்.",
    weight: 15,
  },
  {
    type: "residue_incorporation",
    titleEn: "Crop Residue In-Situ Incorporation",
    titleTa: "பயிர் கழிவுகளை மண்ணிலேயே மக்க வைத்தல்",
    category: "residue",
    descriptionEn: "Avoids stubble burning and returns valuable potassium and carbon to soil.",
    descriptionTa: "கழிவுகளை எரிக்காமல் உழுது மண்ணில் மக்க வைத்து சாம்பல் சத்தை மீட்டெடுத்தல்.",
    weight: 10,
  },
  {
    type: "agroforestry",
    titleEn: "Agroforestry & Boundary Tree Planting",
    titleTa: "பண்ணை மரங்கள் & வரப்பு மர வளர்ப்பு",
    category: "biodiversity",
    descriptionEn: "Trees on bunds (e.g. Melia dubia, Teak, Neem) create microclimates and sequester carbon.",
    descriptionTa: "வரப்புகளில் மரங்கள் வளர்த்து பண்ணை சூழலை பாதுகாத்தல்.",
    weight: 10,
  },
];

export async function logSustainabilityPractice(
  ownerId: string,
  farmId: string,
  practiceType: SustainabilityPracticeType,
  areaAcresCovered: number,
  notes?: string,
  isDemoMode: boolean = false
): Promise<SustainabilityPracticeRecord> {
  const recId = `sust_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
  const record: SustainabilityPracticeRecord = {
    id: recId,
    ownerId,
    farmId,
    practiceType,
    dateAdopted: new Date().toISOString().slice(0, 10),
    areaAcresCovered,
    notes,
    createdAt: new Date().toISOString(),
  };

  if (isDemoMode || !isFirebaseConfigured) {
    try {
      const key = `agroguide_demo_sustainability_${ownerId}`;
      const existing: SustainabilityPracticeRecord[] = JSON.parse(localStorage.getItem(key) || "[]");
      existing.unshift(record);
      localStorage.setItem(key, JSON.stringify(existing));
    } catch {}
    return record;
  }

  const db = getFirebaseDb();
  if (db) {
    await setDoc(doc(db, "sustainability_practices", recId), record);
  }

  return record;
}

export async function listFarmerSustainabilityPractices(
  ownerId: string,
  isDemoMode: boolean = false
): Promise<SustainabilityPracticeRecord[]> {
  if (isDemoMode || !isFirebaseConfigured) {
    try {
      const key = `agroguide_demo_sustainability_${ownerId}`;
      const stored = localStorage.getItem(key);
      if (stored) return JSON.parse(stored);
      // Demo defaults
      return [
        {
          id: "demo_sust_01",
          ownerId,
          farmId: "farm_01",
          practiceType: "drip_irrigation",
          dateAdopted: "2025-06-01",
          areaAcresCovered: 2.5,
          createdAt: "2025-06-01T00:00:00Z",
        },
        {
          id: "demo_sust_02",
          ownerId,
          farmId: "farm_01",
          practiceType: "organic_manure",
          dateAdopted: "2026-01-10",
          areaAcresCovered: 2.5,
          createdAt: "2026-01-10T00:00:00Z",
        },
      ];
    } catch {
      return [];
    }
  }

  const db = getFirebaseDb();
  if (!db) return [];

  try {
    const q = query(
      collection(db, "sustainability_practices"),
      where("ownerId", "==", ownerId)
    );
    const snap = await getDocs(q);
    const res: SustainabilityPracticeRecord[] = [];
    snap.forEach((d) => res.push(d.data() as SustainabilityPracticeRecord));
    return res;
  } catch {
    return [];
  }
}

export function evaluateSustainabilityScore(
  records: SustainabilityPracticeRecord[],
  soilReports: SoilReport[] = []
): SustainabilityScoreSummary {
  const adoptedTypes = new Set(records.map((r) => r.practiceType));

  let score = 0;
  SUSTAINABLE_PRACTICE_DEFINITIONS.forEach((def) => {
    if (adoptedTypes.has(def.type)) {
      score += def.weight;
    }
  });

  const cappedScore = Math.min(100, Math.max(0, score));

  // Determine qualitative levels
  const rating = cappedScore >= 60 ? "Strong" : cappedScore >= 30 ? "Developing" : "Low";
  const waterEfficiencyRating = adoptedTypes.has("drip_irrigation") || adoptedTypes.has("mulching") ? "Strong" : "Low";
  const soilImprovementRating = adoptedTypes.has("organic_manure") || adoptedTypes.has("cover_crop") ? "Strong" : "Developing";
  const inputEfficiencyRating = adoptedTypes.has("drip_irrigation") ? "Strong" : "Developing";
  const residueManagementRating = adoptedTypes.has("residue_incorporation") ? "Strong" : "Developing";
  const biodiversityRating = adoptedTypes.has("crop_rotation") || adoptedTypes.has("agroforestry") ? "Strong" : "Low";

  // Soil organic carbon trend
  const latestSoil = soilReports[0];
  const oc = latestSoil?.organicCarbon ?? 0.58;

  return {
    overallScore: cappedScore,
    rating,
    waterEfficiencyRating,
    soilImprovementRating,
    inputEfficiencyRating,
    residueManagementRating,
    biodiversityRating,
    practicesCount: adoptedTypes.size,
    latestSoilOrganicCarbonPercent: oc,
    disclaimer: "Educational estimate only — not a certified carbon-credit calculation.",
  };
}
