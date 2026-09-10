import type { Language } from "@/types";

// ─────────────────────────────────────────────
// Farmer Wisdom for the dashboard ticker.
//
// Rotates deterministically each day between:
// - Authentic Thirukkural (Chapter 104 — Uzhavu / உழவு) formatted with two distinct lines
// - Traditional Tamil farming proverbs (விவசாயப் பழமொழிகள்) with agricultural wisdom
// ─────────────────────────────────────────────

export interface WisdomItem {
  id: string;
  type: "kural" | "proverb";
  // For Thirukkural: two distinct lines
  line1_ta?: string;
  line2_ta?: string;
  line1_en?: string;
  line2_en?: string;
  // For Proverb or single-block quote
  text_ta: string;
  text_en: string;
  // Meaning / Explanation
  meaning_ta?: string;
  meaning_en?: string;
  // Chapter / Topic
  chapter_ta?: string;
  chapter_en?: string;
  category: "agriculture" | "effort" | "rain" | "soil" | "irrigation" | "seeds";
  source_ta: string;
  source_en: string;
  reference_ta: string;
  reference_en: string;
}

export const FARMER_WISDOM_LIST: WisdomItem[] = [
  // Day 1: Thirukkural 1031 (Chapter 104 - Uzhavu)
  {
    id: "kural-1031",
    type: "kural",
    line1_ta: "சுழன்றும்ஏர்ப் பின்னது உலகம் அதனால்",
    line2_ta: "உழந்தும் உழவே தலை.",
    line1_en: "Howe'er they roam, the world must follow still the plougher's team;",
    line2_en: "Though toilsome, culture of the ground as noblest toil esteem.",
    text_ta: "சுழன்றும்ஏர்ப் பின்னது உலகம் அதனால்\nஉழந்தும் உழவே தலை.",
    text_en: "Howe'er they roam, the world must follow still the plougher's team;\nThough toilsome, culture of the ground as noblest toil esteem.",
    meaning_ta: "பல்வேறு தொழில்களால் சுழன்று வாழ்கின்ற உலகமும் ஏருக்குப் பின்னாலேயே இயங்குகிறது. அதனால் வருந்தி உழைத்தாலும் உழவுத் தொழிலே முதன்மையானது.",
    meaning_en: "Though human society pursues diverse trades, the world ultimately depends on the plough. Agriculture remains the foremost noble pursuit.",
    chapter_ta: "அதிகாரம் 104 — உழவு (குறள் 1031)",
    chapter_en: "Chapter 104 — Uzhavu (Farming), Kural 1031",
    category: "agriculture",
    source_ta: "திருக்குறள் (திருவள்ளுவர்)",
    source_en: "Thirukkural (Thiruvalluvar), tr. G.U. Pope",
    reference_ta: "குறள் 1031",
    reference_en: "Kural 1031",
  },
  // Day 2: Farming Proverb (Soil / Season)
  {
    id: "proverb-1",
    type: "proverb",
    text_ta: "பருவத்தே பயிர் செய்.",
    text_en: "Sow at the right season for a bountiful harvest.",
    meaning_ta: "சரியான பருவமறிந்து பயிரிடப்படும் பயிரே நோய்நொடியின்றி சிறப்பான விளைச்சலைத் தரும்.",
    meaning_en: "Planting in accordance with the proper season yields the healthiest crop and best returns.",
    category: "agriculture",
    source_ta: "விவசாயப் பழமொழி",
    source_en: "Tamil Agricultural Proverb",
    reference_ta: "தமிழ் வேளாண் மரபு",
    reference_en: "Tamil Farming Tradition",
  },
  // Day 3: Thirukkural 1032 (Chapter 104 - Uzhavu)
  {
    id: "kural-1032",
    type: "kural",
    line1_ta: "உழுவார் உலகத்தார்க்கு ஆணிஅஃ தாற்றாது",
    line2_ta: "எழுவாரை எல்லாம் பொறுத்து.",
    line1_en: "The ploughers are the linch-pin of the world;",
    line2_en: "They bear them up who other works perform, too weak its toils to share.",
    text_ta: "உழுவார் உலகத்தார்க்கு ஆணிஅஃ தாற்றாது\nஎழுவாரை எல்லாம் பொறுத்து.",
    text_en: "The ploughers are the linch-pin of the world;\nThey bear them up who other works perform, too weak its toils to share.",
    meaning_ta: "உழவு செய்ய இயலாமல் மற்ற தொழில்களைச் செய்யும் அனைவரையும் உழவரே தாங்கி நிற்பதால், அவர்களே உலகத்தின் அச்சாணி ஆவர்.",
    meaning_en: "Farmers who sustain all other professions are truly the linchpin supporting the wheel of society.",
    chapter_ta: "அதிகாரம் 104 — உழவு (குறள் 1032)",
    chapter_en: "Chapter 104 — Uzhavu (Farming), Kural 1032",
    category: "agriculture",
    source_ta: "திருக்குறள் (திருவள்ளுவர்)",
    source_en: "Thirukkural (Thiruvalluvar), tr. G.U. Pope",
    reference_ta: "குறள் 1032",
    reference_en: "Kural 1032",
  },
  // Day 4: Farming Proverb (Soil / Cultivation depth)
  {
    id: "proverb-2",
    type: "proverb",
    text_ta: "அகல உழுவதை விட ஆழ உழுவதே மேல்.",
    text_en: "Deep ploughing is better than wide ploughing.",
    meaning_ta: "நிலத்தை மேலோட்டமாகப் பரப்பி உழுவதை விட, ஆழமாக உழுதால் மண் காற்றோட்டம் பெற்று வேர்கள் ஆழமாக ஊன்றி வளரும்.",
    meaning_en: "Ploughing deep aerates the soil and encourages deep root penetration far better than superficial wide tillage.",
    category: "soil",
    source_ta: "விவசாயப் பழமொழி",
    source_en: "Tamil Agricultural Proverb",
    reference_ta: "மண் மற்றும் உழவு ஞானம்",
    reference_en: "Soil & Tillage Wisdom",
  },
  // Day 5: Thirukkural 1033 (Chapter 104 - Uzhavu)
  {
    id: "kural-1033",
    type: "kural",
    line1_ta: "உழுதுண்டு வாழ்வாரே வாழ்வார்மற் றெல்லாம்",
    line2_ta: "தொழுதுண்டு பின்செல் பவர்.",
    line1_en: "Who ploughing eat their food, they truly live:",
    line2_en: "The rest to others bend subservient, eating what they give.",
    text_ta: "உழுதுண்டு வாழ்வாரே வாழ்வார்மற் றெல்லாம்\nதொழுதுண்டு பின்செல் பவர்.",
    text_en: "Who ploughing eat their food, they truly live:\nThe rest to others bend subservient, eating what they give.",
    meaning_ta: "உழவுத் தொழில் செய்து அதனால் வரும் உணவை உண்பவரே தன்மானத்தோடு வாழ்பவர்; மற்றவர் பிறரை வணங்கி உணவு பெற்று வாழ்பவர்.",
    meaning_en: "Those who live by self-sustained agricultural production live independently with dignity.",
    chapter_ta: "அதிகாரம் 104 — உழவு (குறள் 1033)",
    chapter_en: "Chapter 104 — Uzhavu (Farming), Kural 1033",
    category: "agriculture",
    source_ta: "திருக்குறள் (திருவள்ளுவர்)",
    source_en: "Thirukkural (Thiruvalluvar), tr. G.U. Pope",
    reference_ta: "குறள் 1033",
    reference_en: "Kural 1033",
  },
  // Day 6: Farming Proverb (Rain / Water conservation)
  {
    id: "proverb-3",
    type: "proverb",
    text_ta: "சித்திரை மாசத்து மழையும் சீரக சம்பா பயிரும் சிறப்பு.",
    text_en: "Chithirai summer rains bring great blessing to paddy seedlings.",
    meaning_ta: "கோடைக்காலத்து சித்திரை மழை நிலத்தின் வெப்பத்தைத் தணித்து, சம்பா விதைப்புக்கு நிலத்தை வளப்படுத்துகிறது.",
    meaning_en: "Early seasonal rainfall prepares the soil naturally with essential moisture for healthy crop cycles.",
    category: "rain",
    source_ta: "விவசாயப் பழமொழி",
    source_en: "Tamil Agricultural Proverb",
    reference_ta: "மழை மற்றும் நீர் மேலாண்மை",
    reference_en: "Rain & Water Wisdom",
  },
  // Day 7: Thirukkural 1038 (Chapter 104 - Uzhavu / Soil Manuring)
  {
    id: "kural-1038",
    type: "kural",
    line1_ta: "ஏரினும் நன்றால் எருவிடுதல் கட்டபின்",
    line2_ta: "நீரினும் நன்றால் காப்பு.",
    line1_en: "Better than ploughing is to manure the land;",
    line2_en: "And after weeding, guarding it is better than watering.",
    text_ta: "ஏரினும் நன்றால் எருவிடுதல் கட்டபின்\nநீரினும் நன்றால் காப்பு.",
    text_en: "Better than ploughing is to manure the land;\nAnd after weeding, guarding it is better than watering.",
    meaning_ta: "நிலத்தை உழுவதை விட எரு இடுதல் நல்லது; களை எடுத்த பிறகு நீர் பாய்ச்சுவதை விட பயிரைப் பூச்சி நோய்களிலிருந்து பாதுகாப்பது நல்லது.",
    meaning_en: "Adding organic manure enriches soil even more than repeated ploughing; protecting the crop after weeding is more vital than mere watering.",
    chapter_ta: "அதிகாரம் 104 — உழவு (குறள் 1038)",
    chapter_en: "Chapter 104 — Uzhavu (Farming), Kural 1038",
    category: "soil",
    source_ta: "திருக்குறள் (திருவள்ளுவர்)",
    source_en: "Thirukkural (Thiruvalluvar), tr. G.U. Pope",
    reference_ta: "குறள் 1038",
    reference_en: "Kural 1038",
  },
  // Day 8: Farming Proverb (Seeds / Selection)
  {
    id: "proverb-4",
    type: "proverb",
    text_ta: "விதையளவு கண்டு விளைச்சல் அறி.",
    text_en: "The quality of the seed determines the bounty of the harvest.",
    meaning_ta: "தரமான விதையைத் தேர்ந்தெடுத்து விதைப்பதே நோய் எதிர்ப்புத் திறனும் நிறைந்த மகசூலும் பெற அடிப்படை.",
    meaning_en: "Selecting clean, high-vitality seeds is the indispensable foundation for a high-yield crop.",
    category: "seeds",
    source_ta: "விவசாயப் பழமொழி",
    source_en: "Tamil Agricultural Proverb",
    reference_ta: "விதை நேர்த்தி பழமொழி",
    reference_en: "Seed Selection Wisdom",
  },
];

export interface ResolvedDailyWisdom {
  id: string;
  type: "kural" | "proverb";
  line1?: string;
  line2?: string;
  text: string;
  meaning?: string;
  chapter?: string;
  badgeLabel: string;
  source: string;
  reference: string;
}

export function pickDailyWisdom(language: Language): ResolvedDailyWisdom {
  // Deterministic per calendar day (UTC/Local day offset) so it rotates daily
  const dayIndex = Math.floor(Date.now() / 86_400_000);
  const item = FARMER_WISDOM_LIST[dayIndex % FARMER_WISDOM_LIST.length];

  const isTamil = language === "ta";

  return {
    id: item.id,
    type: item.type,
    line1: isTamil ? item.line1_ta : item.line1_en,
    line2: isTamil ? item.line2_ta : item.line2_en,
    text: isTamil ? item.text_ta : item.text_en,
    meaning: isTamil ? item.meaning_ta : item.meaning_en,
    chapter: isTamil ? item.chapter_ta : item.chapter_en,
    badgeLabel: item.type === "kural" 
      ? (isTamil ? "குறள்" : "Thirukkural") 
      : (isTamil ? "விவசாயப் பழமொழி" : "Farmer Wisdom"),
    source: isTamil ? item.source_ta : item.source_en,
    reference: isTamil ? item.reference_ta : item.reference_en,
  };
}

// Backward compatibility export if imported elsewhere
export const FARMER_QUOTES = FARMER_WISDOM_LIST;
export function pickDailyQuote(language: Language) {
  const w = pickDailyWisdom(language);
  return {
    text: w.text,
    source: w.source,
    reference: w.reference,
  };
}

