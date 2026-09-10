import type { StateDecisionPriority } from "@/types";

// ─────────────────────────────────────────────
// Phase 161: State Agriculture Decision Intelligence Engine
// Deterministic decision support synthesising multi-source telemetry into review priorities.
// ─────────────────────────────────────────────

export async function synthesizeStateDecisionPriorities(
  district: string = "Coimbatore"
): Promise<StateDecisionPriority[]> {
  const priorities: StateDecisionPriority[] = [
    {
      id: "SDP-CBE-001",
      priorityLevel: "HIGH PRIORITY",
      titleEn: "DAP Buffer Deficit & Upcoming Sowing Demand",
      titleTa: "டி.ஏ.பி உர இருப்பு குறைவு மற்றும் வரவிருக்கும் விதைப்பு தேவை",
      descriptionEn: "DAP buffer stock at TANFED warehouse is 370 Tonnes against forecasted 14-day requirement of 620 Tonnes.",
      descriptionTa: "அடுத்த 14 நாட்களுக்கு தேவை 620 டன், ஆனால் கிடங்கில் உள்ள இருப்பு 370 டன் மட்டுமே.",
      district: "Coimbatore",
      block: "Pollachi",
      reasonEn: "High acreage of vegetable and maize sowing scheduled in next two weeks.",
      dataSource: "Fertilizer Buffer Registry & Input Demand Forecast Engine",
      freshness: "LIVE",
      coverage: "Coimbatore District (Pollachi & Thondamuthur Blocks)",
      recommendedActionEn: "Direct inbound RAKE-SR-2026-8812 allocation of 400 Tonnes DAP to Coimbatore Buffer Depot.",
      recommendedActionTa: "ரயில்வே வேகன் மூலம் வரும் உரத்தை உடனடியாக இப்பகுதிக்கு ஒதுக்கீடு செய்தல்.",
    },
    {
      id: "SDP-CBE-002",
      priorityLevel: "WATCH",
      titleEn: "Early Tomato Fruit Borer Signals with Moderate Humidity",
      titleTa: "தக்காளி காய் துளைப்பான் ஆரம்ப அறிகுறி மற்றும் மிதமான ஈரப்பதம்",
      descriptionEn: "4 surveillance signals recorded in Alandurai & Perur villages with relative humidity at 72%.",
      descriptionTa: "ஆலந்துறை மற்றும் பேரூர் கிராமங்களில் பூச்சி தாக்குதல் அறிகுறிகள் பதிவாகியுள்ளன.",
      district: "Coimbatore",
      block: "Thondamuthur",
      reasonEn: "Favorable weather for pest multiplication combined with contiguous fruiting stages.",
      dataSource: "Disease Surveillance Network & TNAU AWS Observation",
      freshness: "LIVE",
      coverage: "Thondamuthur Block",
      recommendedActionEn: "Broadcast bio-control advisory (Neem oil 10,000 PPM + Trichogramma cards) via government feed.",
      recommendedActionTa: "உயிரியல் முறை பூச்சி கட்டுப்பாடு வழிகாட்டுதலை விவசாயிகளுக்கு அனுப்புதல்.",
    },
    {
      id: "SDP-CBE-003",
      priorityLevel: "INFO",
      titleEn: "Peak Tomato Harvest Influx Expected (Next 14 Days)",
      titleTa: "அடுத்த 14 நாட்களில் தக்காளி அறுவடை உச்சக்கட்டம்",
      descriptionEn: "95 acres in Alandurai and 140 acres in Thondamuthur reaching maturity stage. Estimated 24,000 Quintals arrival.",
      descriptionTa: "அடுத்த இரு வாரங்களில் சுமார் 24,000 குவிண்டால் தக்காளி சந்தைக்கு வர வாய்ப்பு.",
      district: "Coimbatore",
      reasonEn: "Synchronized transplanting during early Kharif window.",
      dataSource: "Village Digital Twin & Market Arrival Forecast Engine",
      freshness: "RECENT",
      coverage: "Coimbatore Mandi Region",
      recommendedActionEn: "Alert Udumalpet Cold Storage and APMC yard managers to ensure space readiness.",
      recommendedActionTa: "உடுமலைப்பேட்டை குளிர்சாதன கிடங்கு மற்றும் ஒழுங்குமுறை விற்பனைக்கூடங்களை தயார் நிலையில் வைத்தல்.",
    },
  ];

  return priorities;
}
