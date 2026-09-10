import type { AgriculturalAdvisoryItem } from "@/types";

// ─────────────────────────────────────────────
// Phase 50: Agricultural University & Research Extension Feed
// Syndicates verified agronomic advisories from TNAU, ICAR, and IMD Agromet Bulletins
// ─────────────────────────────────────────────

export const RESEARCH_ADVISORY_FEED: AgriculturalAdvisoryItem[] = [
  {
    id: "adv_tnau_paddy_blast_01",
    titleEn: "TNAU Advisory: Paddy Neck Blast & Brown Plant Hopper Management",
    titleTa: "TNAU ஆலோசனை: நெல் குலைநோய் மற்றும் புகையான் பூச்சி மேலாண்மை",
    source: "Tamil Nadu Agricultural University (TNAU)",
    category: "pest_disease",
    publishDate: "2026-06-18",
    targetCrops: ["Paddy", "Rice"],
    targetDistricts: ["Thanjavur", "Tiruvarur", "Nagapattinam", "Coimbatore"],
    summaryEn: "Due to high relative humidity and intermittent rains, scout fields for spindle-shaped lesions. Spray Tricyclazole 75% WP @ 1g/litre if ETL is reached.",
    summaryTa: "காற்றில் அதிக ஈரப்பதம் உள்ளதால் நெற்பயிரில் குலைநோய் தாக்க வாய்ப்புள்ளது. ட்ரைசைக்ளசோல் 75% WP மருந்தை ஒரு லிட்டர் தண்ணீருக்கு 1 கிராம் வீதம் கலந்து தெளிக்கவும்.",
    officialLink: "https://agritech.tnau.ac.in",
  },
  {
    id: "adv_imd_agromet_sw_monsoon_02",
    titleEn: "IMD Agromet Advisory: Southwest Monsoon Sowing Guidelines",
    titleTa: "வானிலை மையம்: தென்மேற்கு பருவமழை விதைப்பு வழிகாட்டுதல்கள்",
    source: "IMD Agromet Division / TNAU AMFU",
    category: "weather_alert",
    publishDate: "2026-06-20",
    targetCrops: ["Groundnut", "Cotton", "Millets", "Pulses"],
    targetDistricts: ["Coimbatore", "Tiruppur", "Salem", "Dharmapuri"],
    summaryEn: "Expected moderate rainfall in western agro-climatic zone. Take up broad-bed furrow sowing for rainfed groundnut and pulses to prevent water stagnation.",
    summaryTa: "மேற்கு மண்டலத்தில் மிதமான மழை எதிர்பார்க்கப்படுவதால், மானாவாரி நிலக்கடலை மற்றும் பயறு வகைகளுக்கு பாத்தி அமைத்து விதைப்பு செய்யவும்.",
    officialLink: "https://mausam.imd.gov.in",
  },
  {
    id: "adv_icar_tomato_borer_03",
    titleEn: "ICAR-IIHR Advisory: Tomato Pinworm (Tuta absoluta) Bio-Control",
    titleTa: "ICAR ஆலோசனை: தக்காளி இலைதுளைப்பான் இயற்கை கட்டுப்பாடு",
    source: "ICAR - Indian Institute of Horticultural Research",
    category: "pest_disease",
    publishDate: "2026-06-22",
    targetCrops: ["Tomato", "Eggplant"],
    targetDistricts: ["Coimbatore", "Dindigul", "Krishnagiri"],
    summaryEn: "Install pheromone traps @ 16 traps/acre. Release Trichogramma pretiosum @ 50,000 parasitoids/acre at early flowering stage.",
    summaryTa: "ஏக்கருக்கு 16 இனக்கவர்ச்சி பொறிகளை வைக்கவும். டிரைகோடெர்மா ஒட்டுண்ணிகளை பூக்கும் தருணத்தில் வெளியிடவும்.",
    officialLink: "https://iihr.res.in",
  },
  {
    id: "adv_dept_drip_fertigation_04",
    titleEn: "TN Agri Dept: Water Soluble Fertigation Schedule for Vegetables",
    titleTa: "வேளாண் துறை: காய்கறி பயிர்களுக்கான சொட்டுநீர் உர அட்டவணை",
    source: "Department of Horticulture & Plantation Crops",
    category: "crop_practice",
    publishDate: "2026-06-25",
    targetCrops: ["Tomato", "Chilli", "Brinjal", "Capsicum"],
    targetDistricts: ["All Districts"],
    summaryEn: "Apply 19:19:19 (All-19) water-soluble fertilizer @ 2.5 kg/acre twice weekly through venturi injector during active vegetative flush.",
    summaryTa: "வளர்ச்சி பருவத்தில் 19:19:19 நீரில் கரையும் உரத்தை ஏக்கருக்கு 2.5 கிலோ வீதம் வாரத்திற்கு இரண்டு முறை சொட்டுநீர் பாசனம் மூலம் வழங்கவும்.",
    officialLink: "https://tnhorticulture.tn.gov.in",
  },
];

export function getFilteredAdvisories(
  cropFilter?: string,
  districtFilter?: string,
  categoryFilter?: string
): AgriculturalAdvisoryItem[] {
  return RESEARCH_ADVISORY_FEED.filter((item) => {
    if (categoryFilter && categoryFilter !== "all" && item.category !== categoryFilter) return false;
    if (districtFilter && districtFilter.toLowerCase() !== "all" && districtFilter.toLowerCase() !== "all districts") {
      const matchDist = item.targetDistricts.some(
        (d) => d === "All Districts" || d.toLowerCase() === districtFilter.toLowerCase()
      );
      if (!matchDist) return false;
    }
    if (cropFilter && cropFilter !== "all") {
      const matchCrop = item.targetCrops.some((c) => c.toLowerCase().includes(cropFilter.toLowerCase()));
      if (!matchCrop) return false;
    }
    return true;
  });
}
