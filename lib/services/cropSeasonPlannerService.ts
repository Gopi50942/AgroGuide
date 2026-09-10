import type { CropSeasonPlanCriteria, CropSeasonRecommendation } from "@/types";
export type { CropSeasonRecommendation };

export interface CropCropPlannerTemplate {
  cropNameEn: string;
  cropNameTa: string;
  seasons: string[]; // e.g. 'kharif', 'rabi', 'zaid', 'samba', 'kuruvai', 'thaladi', 'navarai', 'sornavari', 'all'
  suitableSoilTypes: string[]; // 'clay', 'loam', 'sandy', 'red', 'black', 'alluvial', 'any'
  waterRequirement: "abundant" | "moderate" | "limited" | "rainfed";
  durationDays: string;
  estimatedCostPerAcre: number;
  expectedYieldPerAcre: string;
  varietySuggestionsEn: string[];
  varietySuggestionsTa: string[];
  suitabilityReasonEn: string;
  suitabilityReasonTa: string;
  considerationsEn: string[];
  considerationsTa: string[];
}

export const CROP_PLANNER_DATABASE: CropCropPlannerTemplate[] = [
  {
    cropNameEn: "Paddy (Rice)",
    cropNameTa: "நெல்",
    seasons: ["samba", "kuruvai", "thaladi", "kharif", "rabi"],
    suitableSoilTypes: ["clay", "alluvial", "loam", "black"],
    waterRequirement: "abundant",
    durationDays: "110–135 days",
    estimatedCostPerAcre: 28000,
    expectedYieldPerAcre: "22–28 Quintals",
    varietySuggestionsEn: ["ADT 53", "CO 51", "CR 1009 Sub 1", "BPT 5204 (Andhra Ponni)"],
    varietySuggestionsTa: ["ஏடிடி 53", "கோ 51", "சிஆர் 1009 சப் 1", "பிபிடி 5204 (பொன்னி)"],
    suitabilityReasonEn: "High yield potential in alluvial/clay soils with assured canal or borewell water during Samba/Kuruvai seasons.",
    suitabilityReasonTa: "சம்பா/குறுவை பருவத்தில் பாசன வசதி உள்ள களிமண் மற்றும் வண்டல் நிலங்களுக்கு அதிக மகசூல் தரும்.",
    considerationsEn: [
      "Requires continuous shallow standing water during tillering & flowering",
      "Monitor for Leaf Folder & Blast disease in high humidity",
      "Schedule basal DAP/Potash alongside organic green manure",
    ],
    considerationsTa: [
      "தூர்கட்டும் மற்றும் பூக்கும் பருவத்தில் தடையற்ற நீர் தேவை",
      "அதிக ஈரப்பதத்தில் இலைச்சுருட்டு புழு & குலைநோயை கண்காணிக்கவும்",
      "அடிப்படை உரமாக டிஏபி மற்றும் பொட்டாஷ் இடவும்",
    ],
  },
  {
    cropNameEn: "Tomato",
    cropNameTa: "தக்காளி",
    seasons: ["zaid", "navarai", "sornavari", "rabi", "kharif", "all"],
    suitableSoilTypes: ["red", "loam", "sandy", "black"],
    waterRequirement: "moderate",
    durationDays: "120–140 days",
    estimatedCostPerAcre: 42000,
    expectedYieldPerAcre: "120–180 Quintals",
    varietySuggestionsEn: ["Shivam (Hybrid)", "PKM 1", "Arka Rakshak", "US 440"],
    varietySuggestionsTa: ["சிவம் (ஹைப்ரிட்)", "பிகேஎம் 1", "அர்கா ரக்ஷக்", "யுஎஸ் 440"],
    suitabilityReasonEn: "High-value commercial vegetable well suited to well-drained red or loamy soils with drip fertigation.",
    suitabilityReasonTa: "வடிகால் வசதியுள்ள செம்மண் மற்றும் வண்டல் நிலங்களில் சொட்டுநீர் பாசனத்தில் அதிக லாபம் தரக்கூடியது.",
    considerationsEn: [
      "Staking required at 20-25 days after transplanting to prevent ground rot",
      "Sensitive to waterlogging — raised bed cultivation strongly recommended",
      "Regular market price volatility — staggered harvest recommended",
    ],
    considerationsTa: [
      "நட்ட 20-25 நாட்களில் காய் அழுகலை தடுக்க குச்சி ஊன்ற வேண்டும்",
      "நீர் தேங்கினால் வேரழுகல் ஏற்படும் — மேட்டுப்பாத்தி முறை சிறந்தது",
      "விலை ஏற்ற இறக்கத்தை சமாளிக்க பகுதி பகுதியாக அறுவடை செய்யவும்",
    ],
  },
  {
    cropNameEn: "Black Gram (Urad Dal)",
    cropNameTa: "உளுந்து",
    seasons: ["rabi", "thaladi", "zaid", "navarai", "rice_fallow"],
    suitableSoilTypes: ["clay", "alluvial", "loam", "black", "red"],
    waterRequirement: "limited",
    durationDays: "65–75 days",
    estimatedCostPerAcre: 12000,
    expectedYieldPerAcre: "4–6 Quintals",
    varietySuggestionsEn: ["VBN 8", "VBN 11", "ADT 6", "MDU 1"],
    varietySuggestionsTa: ["வம்பன் 8", "வம்பன் 11", "ஏடிடி 6", "எம்டியு 1"],
    suitabilityReasonEn: "Excellent short-duration pulse crop for residual moisture in delta rice fallows or semi-arid red soil.",
    suitabilityReasonTa: "குறைந்த நாட்களில் (70 நாட்கள்) நெல் தரிசில் குறைந்த ஈரப்பதத்தில் விளையும் பயறு வகை.",
    considerationsEn: [
      "Fixes atmospheric nitrogen and enriches subsequent season soil health",
      "Spray 2% DAP at flowering to minimize flower shedding",
      "Protect against Yellow Mosaic Virus via seed treatment",
    ],
    considerationsTa: [
      "மண்ணில் தழைச்சத்தை நிலைநிறுத்தி மண் வளத்தை மேம்படுத்தும்",
      "பூ உதிர்வதை தடுக்க பூக்கும் தருணத்தில் 2% டிஏபி தெளிக்கவும்",
      "மஞ்சள் தேமல் நோயை தடுக்க விதை நேர்த்தி அவசியம்",
    ],
  },
  {
    cropNameEn: "Groundnut (Peanut)",
    cropNameTa: "நிலக்கடலை",
    seasons: ["kharif", "rabi", "sornavari", "navarai"],
    suitableSoilTypes: ["red", "sandy", "loam"],
    waterRequirement: "moderate",
    durationDays: "105–120 days",
    estimatedCostPerAcre: 24000,
    expectedYieldPerAcre: "10–14 Quintals",
    varietySuggestionsEn: ["TMV 13", "VRI 8", "Kadiri 6", "Dharani"],
    varietySuggestionsTa: ["டிஎம்வி 13", "விஆர்ஐ 8", "கதிரி 6", "தரணி"],
    suitabilityReasonEn: "Highly suitable for loose, well-aerated sandy loam and red soils allowing easy peg penetration.",
    suitabilityReasonTa: "விருதுநகர், திண்டுக்கல், சேலம் செம்மண் நிலங்களில் விழுது எளிதில் இறங்க ஏற்ற எண்ணெய் வித்து பயிர்.",
    considerationsEn: [
      "Apply Gypsum at 40-45 DAS during flowering/pegging for bold pod formation",
      "Avoid excess moisture during maturity to prevent seed germination in pod",
      "Effective earthing-up increases pod count significantly",
    ],
    considerationsTa: [
      "விழுது இறங்கும் தருணத்தில் (40-45 நாள்) ஜிப்சம் இடுவது திரட்சியான காய்களுக்கு அவசியம்",
      "முதிர்ச்சி காலத்தில் அதிக நீர் பாய்ச்சுவதை தவிர்க்கவும்",
      "மண் அணைத்தல் காய்களின் எண்ணிக்கையை அதிகரிக்கும்",
    ],
  },
  {
    cropNameEn: "Maize (Corn)",
    cropNameTa: "மக்காச்சோளம்",
    seasons: ["kharif", "rabi", "samba", "all"],
    suitableSoilTypes: ["black", "red", "loam", "alluvial"],
    waterRequirement: "moderate",
    durationDays: "95–110 days",
    estimatedCostPerAcre: 20000,
    expectedYieldPerAcre: "28–35 Quintals",
    varietySuggestionsEn: ["CO 6", "NK 6240", "Pioneer 3396", "Dekalb 9108"],
    varietySuggestionsTa: ["கோ 6", "என்.கே 6240", "பயனீர் 3396", "டெகால்ப் 9108"],
    suitabilityReasonEn: "Robust grain and fodder crop with steady poultry feed industry demand across Tamil Nadu.",
    suitabilityReasonTa: "கோழித்தீவன ஆலைகளுக்கு அதிக தேவையுள்ள குறைந்த பராமரிப்பு தானிய பயிர்.",
    considerationsEn: [
      "Strict monitoring for Fall Armyworm (FAW) between 15-30 DAS",
      "Crucial tasseling and silking stages require adequate irrigation",
      "Good response to balanced nitrogen top dressing",
    ],
    considerationsTa: [
      "படைப்புழு தாக்குதலை 15-30 நாட்களில் தீவிரமாக கண்காணிக்கவும்",
      "பூ மற்றும் கதிர் வரும் தருணத்தில் நீர் பாய்ச்சுவது மிக முக்கியம்",
      "தழைச்சத்து மேலுரத்திற்கு நல்ல மகசூல் தரும்",
    ],
  },
  {
    cropNameEn: "Finger Millet (Ragi)",
    cropNameTa: "கேழ்வரகு (ராகி)",
    seasons: ["kharif", "rabi", "sornavari", "rainfed"],
    suitableSoilTypes: ["red", "sandy", "loam", "black"],
    waterRequirement: "rainfed",
    durationDays: "90–105 days",
    estimatedCostPerAcre: 11000,
    expectedYieldPerAcre: "12–16 Quintals",
    varietySuggestionsEn: ["CO 15", "GPU 28", "Paiyur 2", "ML 365"],
    varietySuggestionsTa: ["கோ 15", "ஜிபியு 28", "பையூர் 2", "எம்எல் 365"],
    suitabilityReasonEn: "Climate-resilient, drought-hardy millet with excellent calcium nutrition and growing consumer market value.",
    suitabilityReasonTa: "வறட்சியை தாங்கி வளரும், குறைந்த செலவில் நிறைந்த ஊட்டச்சத்து தரும் பாரம்பரிய சிறுதானியம்.",
    considerationsEn: [
      "Low fertilizer requirement — thrives with organic compost",
      "Transplanted seedlings yield 25% higher than broadcast sowing",
      "High market demand in urban health food segments",
    ],
    considerationsTa: [
      "குறைந்த உரம் போதும் — இயற்கை எருவில் மிகச்சிறப்பாக வளரும்",
      "நாற்று நடும் முறை நேரடி விதைப்பை விட 25% கூடுதல் மகசூல் தரும்",
      "நகரங்களில் சிறுதானியங்களுக்கு நல்ல சந்தை விலை உள்ளது",
    ],
  },
];

/**
 * Evaluates pre-sowing criteria and returns ranked potential crop recommendations.
 */
export function evaluateCropSeasonPlan(
  criteria: CropSeasonPlanCriteria
): CropSeasonRecommendation[] {
  const normSeason = (criteria.seasonOrMonth || "").toLowerCase();
  const normSoil = (criteria.soilType || "").toLowerCase();
  const water = criteria.waterAvailability;

  const scored = CROP_PLANNER_DATABASE.map((tpl) => {
    let score = 0;

    // 1. Season match
    const seasonMatch =
      tpl.seasons.includes("all") ||
      tpl.seasons.some((s) => normSeason.includes(s) || s.includes(normSeason));
    if (seasonMatch) score += 35;

    // 2. Soil type match
    const soilMatch =
      tpl.suitableSoilTypes.includes("any") ||
      tpl.suitableSoilTypes.some((st) => normSoil.includes(st) || st.includes(normSoil));
    if (soilMatch) score += 30;

    // 3. Water feasibility match
    if (water === "abundant") {
      score += 25; // Can grow anything
    } else if (water === "moderate") {
      if (tpl.waterRequirement === "moderate" || tpl.waterRequirement === "limited" || tpl.waterRequirement === "rainfed") {
        score += 25;
      } else {
        score -= 20; // Paddy in moderate water is risky
      }
    } else if (water === "limited") {
      if (tpl.waterRequirement === "limited" || tpl.waterRequirement === "rainfed") {
        score += 30;
      } else if (tpl.waterRequirement === "moderate") {
        score += 10;
      } else {
        score -= 40; // Paddy in limited water is disqualified
      }
    } else if (water === "rainfed") {
      if (tpl.waterRequirement === "rainfed") {
        score += 35;
      } else if (tpl.waterRequirement === "limited") {
        score += 20;
      } else {
        score -= 50;
      }
    }

    return { tpl, score };
  });

  // Filter out negative score crops and sort by highest fit score
  const valid = scored.filter((s) => s.score > 30).sort((a, b) => b.score - a.score);

  return valid.slice(0, 4).map(({ tpl }) => ({
    cropNameEn: tpl.cropNameEn,
    cropNameTa: tpl.cropNameTa,
    varietySuggestionsEn: tpl.varietySuggestionsEn,
    varietySuggestionsTa: tpl.varietySuggestionsTa,
    suitabilityReasonEn: tpl.suitabilityReasonEn,
    suitabilityReasonTa: tpl.suitabilityReasonTa,
    waterDemand: tpl.waterRequirement === "abundant" ? "High" : tpl.waterRequirement === "moderate" ? "Moderate" : "Low",
    durationDays: tpl.durationDays,
    estimatedCostPerAcre: tpl.estimatedCostPerAcre,
    expectedYieldPerAcre: tpl.expectedYieldPerAcre,
    considerationsEn: tpl.considerationsEn,
    considerationsTa: tpl.considerationsTa,
    matchedSeason: criteria.seasonOrMonth,
  }));
}
