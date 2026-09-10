import type { CropStage } from "@/types";

export interface CropTaskTemplate {
  id: string;
  cropType: string; // e.g. 'tomato', 'paddy', 'cotton', 'chilli', 'banana', 'groundnut', 'generic'
  stage: CropStage;
  daysFromSowing: number;
  titleEn: string;
  titleTa: string;
  descEn: string;
  descTa: string;
  category:
    | "land_preparation"
    | "sowing"
    | "irrigation"
    | "fertilization"
    | "weeding"
    | "pest_inspection"
    | "disease_inspection"
    | "pruning"
    | "harvest_preparation"
    | "harvest"
    | "post_harvest";
  priority: "high" | "medium" | "low";
}

export const CROP_TASK_TEMPLATES: CropTaskTemplate[] = [
  // ── Generic Fallback ──
  {
    id: "gen_1",
    cropType: "generic",
    stage: "land_preparation",
    daysFromSowing: -5,
    titleEn: "Land preparation and basal manure",
    titleTa: "நிலம் தயாரித்தல் மற்றும் அடிப்படை உரம்",
    descEn: "Plough field thoroughly and apply well-decomposed farmyard manure.",
    descTa: "நிலத்தை நன்றாக உழுது மக்கிய தொழுவுரத்தை இடவும்.",
    category: "land_preparation",
    priority: "high",
  },
  {
    id: "gen_2",
    cropType: "generic",
    stage: "sowing",
    daysFromSowing: 0,
    titleEn: "Sowing / Transplanting & initial watering",
    titleTa: "விதைத்தல் / நடுவு மற்றும் முதல் பாசனம்",
    descEn: "Sow certified seeds or transplant seedlings at optimal spacing with light irrigation.",
    descTa: "பரிந்துரைக்கப்பட்ட இடைவெளியில் விதைத்து அல்லது நாற்று நட்டு மிதமான நீர் பாய்ச்சவும்.",
    category: "sowing",
    priority: "high",
  },
  {
    id: "gen_3",
    cropType: "generic",
    stage: "germination",
    daysFromSowing: 7,
    titleEn: "Germination check & gap filling",
    titleTa: "முளைப்புத்திறன் சரிபார்த்தல் மற்றும் இடைவெளி நிரப்புதல்",
    descEn: "Inspect seedling emergence across all plots and fill empty spots.",
    descTa: "வயல் முழுவதும் நாற்று முளைப்பை சரிபார்த்து விடுபட்ட இடங்களில் நிரப்பவும்.",
    category: "pest_inspection",
    priority: "medium",
  },
  {
    id: "gen_4",
    cropType: "generic",
    stage: "vegetative",
    daysFromSowing: 20,
    titleEn: "First weeding & top-dressing",
    titleTa: "முதல் களை எடுப்பு மற்றும் மேலுரம் இடுதல்",
    descEn: "Remove weeds to prevent nutrient competition and apply recommended nitrogen dose.",
    descTa: "களைகளை அகற்றி பயிருக்கு தேவையான தழைச்சத்து மேலுரத்தை இடவும்.",
    category: "weeding",
    priority: "high",
  },
  {
    id: "gen_5",
    cropType: "generic",
    stage: "flowering",
    daysFromSowing: 45,
    titleEn: "Flowering stage pest & moisture inspection",
    titleTa: "பூக்கும் தருணம் பூச்சி மற்றும் ஈரப்பதம் கண்காணிப்பு",
    descEn: "Monitor for sucking pests, leaf spot, and ensure critical moisture.",
    descTa: "சாறு உறிஞ்சும் பூச்சிகள் மற்றும் இலைப்புள்ளி நோய்களை கண்காணித்து தேவையான நீர் பாய்ச்சவும்.",
    category: "disease_inspection",
    priority: "high",
  },
  {
    id: "gen_6",
    cropType: "generic",
    stage: "maturity",
    daysFromSowing: 80,
    titleEn: "Pre-harvest moisture reduction & market check",
    titleTa: "அறுவடைக்கு முந்தைய நீர் கட்டுப்பாடு மற்றும் சந்தை விலை ஆய்வு",
    descEn: "Gradually stop irrigation before harvest and check current mandi prices.",
    descTa: "அறுவடைக்கு முன் பாசனத்தை குறைத்து மண்டியின் தற்போதைய விலையை கண்காணிக்கவும்.",
    category: "harvest_preparation",
    priority: "medium",
  },
  {
    id: "gen_7",
    cropType: "generic",
    stage: "harvest",
    daysFromSowing: 95,
    titleEn: "Harvesting & sorting produce",
    titleTa: "அறுவடை செய்தல் மற்றும் தரம் பிரித்தல்",
    descEn: "Harvest mature produce during cool morning/evening hours and grade by quality.",
    descTa: "காலை அல்லது மாலை வேளையில் அறுவடை செய்து தரவாரியாக பிரிக்கவும்.",
    category: "harvest",
    priority: "high",
  },

  // ── Tomato Specific ──
  {
    id: "tom_1",
    cropType: "tomato",
    stage: "land_preparation",
    daysFromSowing: -7,
    titleEn: "Bed preparation & FYM application",
    titleTa: "பாத்திகள் அமைத்தல் மற்றும் தொழுவுரம்",
    descEn: "Form raised beds and incorporate 10 tonnes FYM/acre along with Trichoderma.",
    descTa: "மேட்டுப்பாத்திகள் அமைத்து ஏக்கருக்கு 10 டன் தொழுவுரம் மற்றும் டிரைக்கோடெர்மா இடவும்.",
    category: "land_preparation",
    priority: "high",
  },
  {
    id: "tom_2",
    cropType: "tomato",
    stage: "sowing",
    daysFromSowing: 0,
    titleEn: "Transplant 25-day seedlings with root dip",
    titleTa: "25 நாள் நாற்றுகளை வேர் நனைத்து நடுதல்",
    descEn: "Transplant healthy seedlings at 60x45cm spacing with Pseudomonas root treatment.",
    descTa: "சூடோமோனாஸ் கரைசலில் வேர்களை நனைத்து 60x45 செ.மீ இடைவெளியில் நடவு செய்யவும்.",
    category: "sowing",
    priority: "high",
  },
  {
    id: "tom_3",
    cropType: "tomato",
    stage: "vegetative",
    daysFromSowing: 18,
    titleEn: "Staking & first fertigation",
    titleTa: "குச்சி ஊன்றுதல் மற்றும் முதல் உரப்பாசனம்",
    descEn: "Provide bamboo stake support to prevent soil contact and apply 19:19:19.",
    descTa: "செடிகள் சாயாமல் இருக்க குச்சி ஊன்றி கட்டி 19:19:19 உரத்தை பாசனத்தில் விடவும்.",
    category: "fertilization",
    priority: "high",
  },
  {
    id: "tom_4",
    cropType: "tomato",
    stage: "flowering",
    daysFromSowing: 35,
    titleEn: "Inspect for Fruit Borer & Early Blight",
    titleTa: "காய் துளைப்பான் மற்றும் முன்கூட்டிய கருகல் நோய் ஆய்வு",
    descEn: "Install pheromone traps (5/acre) and check leaf undersides for borer eggs and blight spots.",
    descTa: "ஏக்கருக்கு 5 இனக்கவர்ச்சி பொறிகள் அமைத்து காய் துளைப்பான் முட்டைகள் மற்றும் இலை கருகலை கண்காணிக்கவும்.",
    category: "pest_inspection",
    priority: "high",
  },
  {
    id: "tom_5",
    cropType: "tomato",
    stage: "fruiting",
    daysFromSowing: 55,
    titleEn: "Calcium & Boron foliar spray for fruit quality",
    titleTa: "காய் வெடிப்பை தடுக்க கால்சியம் & போரான் தெளிப்பு",
    descEn: "Spray calcium nitrate and micronutrient mix to prevent blossom end rot and fruit cracking.",
    descTa: "பூ நுனி அழுகல் மற்றும் காய் வெடிப்பை தடுக்க கால்சியம் நைட்ரேட் மற்றும் நுண்ணூட்டம் தெளிக்கவும்.",
    category: "fertilization",
    priority: "medium",
  },
  {
    id: "tom_6",
    cropType: "tomato",
    stage: "harvest",
    daysFromSowing: 75,
    titleEn: "First picking (Breaker to Pink stage)",
    titleTa: "முதல் அறுவடை (பழுக்க தொடங்கும் தருணம்)",
    descEn: "Pick fruits at breaker stage for distant mandi transit or pink/red for local retail.",
    descTa: "வெளியூர் சந்தைக்கு நிறம் மாறும் நிலையிலும், உள்ளூர் சந்தைக்கு சிவந்த பழங்களையும் பறிக்கவும்.",
    category: "harvest",
    priority: "high",
  },

  // ── Paddy / Rice Specific ──
  {
    id: "pad_1",
    cropType: "paddy",
    stage: "land_preparation",
    daysFromSowing: -10,
    titleEn: "Puddling and leveling field",
    titleTa: "சேற்று உழவு மற்றும் வயல் சமன்படுத்துதல்",
    descEn: "Puddle land with water and level thoroughly; incorporate green manure / daincha.",
    descTa: "தண்ணீர் பாய்ச்சி சேற்று உழவு செய்து தக்கைப்பூண்டு போன்ற பசுந்தாள் உரத்தை மடக்கி உழவும்.",
    category: "land_preparation",
    priority: "high",
  },
  {
    id: "pad_2",
    cropType: "paddy",
    stage: "sowing",
    daysFromSowing: 0,
    titleEn: "Transplanting 2-3 seedlings per hill",
    titleTa: "குத்துக்கு 2-3 நாற்றுகள் நடவு செய்தல்",
    descEn: "Transplant at 20x15cm spacing keeping shallow depth (2-3cm).",
    descTa: "20x15 செ.மீ இடைவெளியில் ஆழமில்லாமல் (2-3 செ.மீ) நாற்றுகளை நடவும்.",
    category: "sowing",
    priority: "high",
  },
  {
    id: "pad_3",
    cropType: "paddy",
    stage: "vegetative",
    daysFromSowing: 25,
    titleEn: "Tillering stage urea application & weed control",
    titleTa: "தூர்கட்டும் பருவம் யூரியா மேலுரம் மற்றும் களை மேலாண்மை",
    descEn: "Run cono-weeder and top-dress urea with zinc sulphate for vigorous tillering.",
    descTa: "கோனோ வீடர் மூலம் களை எடுத்து துத்தநாகம் கலந்த யூரியா மேலுரம் இடவும்.",
    category: "weeding",
    priority: "high",
  },
  {
    id: "pad_4",
    cropType: "paddy",
    stage: "flowering",
    daysFromSowing: 60,
    titleEn: "Panicle initiation & stem borer inspection",
    titleTa: "கதிர் உருவாகும் தருணம் மற்றும் தண்டுத்துளைப்பான் ஆய்வு",
    descEn: "Check for dead hearts / white ears and maintain 2-3cm standing water.",
    descTa: "குருத்துக்கருகல் மற்றும் வெண்கதிர் உள்ளதா என ஆய்வு செய்து 2-3 செ.மீ நீர் தேக்கி வைக்கவும்.",
    category: "pest_inspection",
    priority: "high",
  },
  {
    id: "pad_5",
    cropType: "paddy",
    stage: "maturity",
    daysFromSowing: 105,
    titleEn: "Drain water 10 days before harvest",
    titleTa: "அறுவடைக்கு 10 நாட்களுக்கு முன் தண்ணீரை வடித்தல்",
    descEn: "Completely drain water from plots when 80% grains turn golden yellow.",
    descTa: "80% நெல் மணிகள் பொன்னிறமாகும் போது வயலில் உள்ள தண்ணீரை முழுமையாக வடிக்கவும்.",
    category: "harvest_preparation",
    priority: "high",
  },
  {
    id: "pad_6",
    cropType: "paddy",
    stage: "harvest",
    daysFromSowing: 120,
    titleEn: "Combine / manual harvest & grain drying",
    titleTa: "அறுவடை செய்தல் மற்றும் நெல் உலர்த்துதல்",
    descEn: "Harvest grain when moisture is 20-22% and dry down to 12-14% for storage.",
    descTa: "அறுவடை செய்து நெல்லின் ஈரப்பதத்தை 12-14% அளவுக்கு வெயிலில் உலர்த்தவும்.",
    category: "harvest",
    priority: "high",
  },
];
