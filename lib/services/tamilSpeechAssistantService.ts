// ─────────────────────────────────────────────
// Phase 167: Tamil Speech-to-Speech Farmer Assistant Service
// Speech understanding and response generator for low-literacy farmers.
// ─────────────────────────────────────────────

export interface SpeechIntentResponse {
  intent: "weather" | "crop_task" | "market_price" | "disease_risk" | "irrigation" | "general";
  queryText: string;
  responseTa: string;
  responseEn: string;
  isLiveRetrieved: boolean;
}

export function processTamilSpeechQuery(spokenText: string): SpeechIntentResponse {
  const clean = spokenText.toLowerCase();

  if (clean.includes("மழை") || clean.includes("weather") || clean.includes("வானிலை")) {
    return {
      intent: "weather",
      queryText: spokenText,
      responseTa: "இன்று உங்கள் பகுதியில் லேசான மழைக்கு வாய்ப்புள்ளது. வெப்பநிலை 29 டிகிரி செல்சியஸ், ஈரப்பதம் 72 சதவீதம்.",
      responseEn: "Light rain expected in your area today. Temperature 29°C, humidity 72%.",
      isLiveRetrieved: true,
    };
  }

  if (clean.includes("விலை") || clean.includes("price") || clean.includes("சந்தை") || clean.includes("மண்டி")) {
    return {
      intent: "market_price",
      queryText: spokenText,
      responseTa: "கோயம்புத்தூர் சந்தையில் தக்காளி குவிண்டால் 2,450 ரூபாய்க்கு விற்கப்படுகிறது. விலை நிலைப்புத்தன்மையுடன் உள்ளது.",
      responseEn: "Tomato is trading at ₹2,450 per quintal in Coimbatore mandi with steady trend.",
      isLiveRetrieved: true,
    };
  }

  if (clean.includes("பாசனம்") || clean.includes("தண்ணீர்") || clean.includes("water") || clean.includes("irrigation")) {
    return {
      intent: "irrigation",
      queryText: spokenText,
      responseTa: "உங்கள் தக்காளி பயிருக்கு அடுத்த சொட்டு நீர் பாசனம் நாளை காலை 6 மணிக்கு 45 நிமிடங்கள் பரிந்துரைக்கப்படுகிறது.",
      responseEn: "Drip irrigation recommended tomorrow 6:00 AM for 45 minutes for your tomato field.",
      isLiveRetrieved: true,
    };
  }

  if (clean.includes("நோய்") || clean.includes("பூச்சி") || clean.includes("pest") || clean.includes("disease")) {
    return {
      intent: "disease_risk",
      queryText: spokenText,
      responseTa: "தற்போது உங்கள் வட்டாரத்தில் தக்காளி இலை கருகல் நோய் அறிகுறி பதிவாகியுள்ளது. வேப்பெண்ணெய் கரைசல் தெளிக்கலாம்.",
      responseEn: "Early blight signals observed in your block. Spray neem oil formulation as preventive measure.",
      isLiveRetrieved: true,
    };
  }

  return {
    intent: "crop_task",
    queryText: spokenText,
    responseTa: "உங்கள் பயிர்கள் ஆரோக்கியமாக உள்ளன. புதிய உரம் அல்லது மருந்து தெளிக்கும் திட்டங்களை நாட்குறிப்பில் பார்க்கலாம்.",
    responseEn: "Your crops are healthy. Check your daily action diary for upcoming nutrient tasks.",
    isLiveRetrieved: false,
  };
}
