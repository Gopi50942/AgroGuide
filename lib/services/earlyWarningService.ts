import type { EarlyWarningSignal } from "@/types";

// ─────────────────────────────────────────────
// Phase 173: State Agricultural Early Warning Center Service
// Synthesizes cross-domain multi-sensor alarms into prioritized early warning signals.
// ─────────────────────────────────────────────

const MOCK_SIGNALS: EarlyWarningSignal[] = [
  {
    signalId: "EWS-TN-CBE-001",
    category: "Pest",
    severity: "Watch",
    titleEn: "Early Blight & Humidity Alert in Tomato Clusters",
    titleTa: "தக்காளி பயிரில் இலைக்கருகல் மற்றும் ஈரப்பதம் எச்சரிக்கை",
    district: "Coimbatore",
    block: "Thondamuthur",
    source: "Disease Surveillance Network & TNAU Agromet Sub-Station",
    timestamp: new Date().toISOString(),
    reasonEn: "Canopy humidity > 75% for 48 consecutive hours coinciding with flowering stage.",
    reasonTa: "தொடர்ந்து 48 மணி நேரம் 75%க்கும் மேல் ஈரப்பதம் நிலவுவதால் பூச்சி பெருக்கம் அதிகரிக்கும்.",
    recommendedHumanActionEn: "Direct extension staff to verify field foliage and recommend bio-fungicide spray.",
    recommendedHumanActionTa: "வேளாண் விரிவாக்க அலுவலர்கள் கள ஆய்வு செய்து உயிரியல் பூஞ்சாணக் கொல்லி பரிந்துரைக்க வேண்டும்.",
  },
  {
    signalId: "EWS-TN-CBE-002",
    category: "Input",
    severity: "High",
    titleEn: "DAP Buffer Stock Deficit for Upcoming Sowing Window",
    titleTa: "டி.ஏ.பி உர இருப்பு குறைவு எச்சரிக்கை",
    district: "Coimbatore",
    block: "Pollachi",
    source: "TANFED Buffer Registry & District Demand Forecast",
    timestamp: new Date().toISOString(),
    reasonEn: "Current warehouse buffer is 370 Tonnes vs projected 14-day demand of 620 Tonnes.",
    reasonTa: "அடுத்த இரு வார தேவை 620 டன், ஆனால் இருப்பு 370 டன் மட்டுமே உள்ளது.",
    recommendedHumanActionEn: "Coordinate with state fertilizer cell for emergency rake diversion.",
    recommendedHumanActionTa: "மாநில உர கட்டுப்பாட்டு மையத்துடன் தொடர்பு கொண்டு கூடுதல் வேகன் ஒதுக்கீடு பெறவும்.",
  },
];

export async function listEarlyWarningSignals(district?: string): Promise<EarlyWarningSignal[]> {
  if (!district || district === "ALL") return MOCK_SIGNALS;
  return MOCK_SIGNALS.filter((s) => s.district.toLowerCase() === district.toLowerCase());
}
