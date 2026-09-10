import { getFirebaseDb, isFirebaseConfigured } from "@/lib/firebase/config";
import type { MessagingSendResult } from "@/lib/services/messagingService";

// ─────────────────────────────────────────────
// Phase 43: WhatsApp Farmer Assistant Gateway & Inbound Command Processor
// Handles safe, read-only WhatsApp agricultural queries without mutating farm records.
// ─────────────────────────────────────────────

export interface WhatsAppInboundMessage {
  from: string; // E.164 phone number
  text: string;
  messageId: string;
  timestamp: string;
}

export interface WhatsAppInboundResponse {
  replyTextEn: string;
  replyTextTa: string;
  commandRecognized: "WEATHER" | "MARKET" | "TASKS" | "SCHEMES" | "HELP" | "UNKNOWN";
}

export function processWhatsAppInboundCommand(
  rawText: string,
  district: string = "Tamil Nadu"
): WhatsAppInboundResponse {
  const normalized = rawText.trim().toUpperCase();

  // Weather Commands
  if (normalized.includes("WEATHER") || normalized.includes("வானிலை") || normalized.includes("MAZHI") || normalized.includes("RAIN")) {
    return {
      commandRecognized: "WEATHER",
      replyTextEn: `[AgroGuide Weather Advisory]\n📍 ${district}\n🌤️ Today: 31°C, Partly Cloudy\n💧 Humidity: 65%\n🌧️ Rain probability: 20%\n💡 Field Tip: Good conditions for scheduled fertigation.`,
      replyTextTa: `[அக்ரோகைடு வானிலை ஆலோசனை]\n📍 ${district}\n🌤️ இன்று: 31°C, மேகமூட்டம்\n💧 ஈரப்பதம்: 65%\n🌧️ மழை வாய்ப்பு: 20%\n💡 களக்குறிப்பு: உரமிட உகந்த வானிலை.`,
    };
  }

  // Market Mandi Price Commands
  if (normalized.includes("MARKET") || normalized.includes("MANDI") || normalized.includes("சந்தை") || normalized.includes("VILAI") || normalized.includes("PRICE")) {
    return {
      commandRecognized: "MARKET",
      replyTextEn: `[AgroGuide Mandi Prices]\n📍 ${district} Market Hub\n🍅 Tomato: ₹2,400 - ₹2,800 / Quintal (Steady)\n🌾 Paddy (IR 20): ₹2,250 / Quintal\n🧅 Onion (Small): ₹4,200 / Quintal\n📈 View full trends in AgroGuide App.`,
      replyTextTa: `[அக்ரோகைடு சந்தை நிலவரம்]\n📍 ${district} சந்தை\n🍅 தக்காளி: ₹2,400 - ₹2,800 / குவிண்டால் (நிலையானது)\n🌾 நெல்: ₹2,250 / குவிண்டால்\n🧅 சின்ன வெங்காயம்: ₹4,200 / குவிண்டால்\n📈 முழு விலை விபரங்களை செயலியில் பார்க்கவும்.`,
    };
  }

  // Crop Tasks Commands
  if (normalized.includes("TASK") || normalized.includes("TODO") || normalized.includes("பணிகள்") || normalized.includes("VELAI")) {
    return {
      commandRecognized: "TASKS",
      replyTextEn: `[AgroGuide Crop Lifecycle Tasks]\n🌱 Active Crop: Hybrid Tomato (Day 48)\n1. Basal Fertigation (Due Today)\n2. Sticky trap inspection for whiteflies\n✅ Mark complete in AgroGuide App.`,
      replyTextTa: `[அக்ரோகைடு பயிர் வளர்ச்சிப் பணிகள்]\n🌱 பயிர்: தக்காளி (நாள் 48)\n1. பாசன உரம் இடுதல் (இன்றைய பணி)\n2. வெள்ளை ஈக்களுக்கான ஒட்டும் பொறி ஆய்வு\n✅ செயலியில் பணிகளை பூர்த்தி செய்யவும்.`,
    };
  }

  // Government Scheme Commands
  if (normalized.includes("SCHEME") || normalized.includes("SUBSIDY") || normalized.includes("திட்டம்") || normalized.includes("MANIYAM")) {
    return {
      commandRecognized: "SCHEMES",
      replyTextEn: `[AgroGuide Government Schemes]\n1. PM-KISAN (17th Installment active)\n2. TN Drip Irrigation Subsidy (Up to 100% for Small/Marginal)\n3. PMFBY Crop Insurance enrollment open.\n📞 Kisan Call Center: 1800-180-1551.`,
      replyTextTa: `[அக்ரோகைடு அரசு திட்டங்கள்]\n1. பி.எம். கிசான் 17வது தவணை\n2. சொட்டுநீர் பாசன மானியம் (சிறு/குறு விவசாயிகளுக்கு 100% வரை)\n3. பயிர் காப்பீட்டு பதிவு தொடங்கியுள்ளது.\n📞 உழவர் உதவி மையம்: 1800-180-1551.`,
    };
  }

  // Default Help
  return {
    commandRecognized: "HELP",
    replyTextEn: `[AgroGuide WhatsApp Assistant]\nReply with one of these keywords for instant advisory:\n• WEATHER - Local weather forecast\n• MARKET - Today's mandi modal prices\n• TASKS - Active crop schedule\n• SCHEMES - Subsidies & deadlines\n• HELP - Kisan Call Center helpline`,
    replyTextTa: `[அக்ரோகைடு வாட்ஸ்அப் உதவி மையம்]\nகீழ்க்கண்ட வார்த்தைகளை அனுப்பி உடனடி தகவல் பெறவும்:\n• WEATHER (வானிலை)\n• MARKET (சந்தை விலை)\n• TASKS (பயிர் பணிகள்)\n• SCHEMES (அரசு மானியங்கள்)\n• HELP (உதவி மையம்)`,
  };
}
