import type { PestSpreadRiskAssessment } from "@/types";

// ─────────────────────────────────────────────
// Phase 135: Pest Spread Risk Model Service
// Multi-factor spatial spread risk assessment requiring officer confirmation.
// ─────────────────────────────────────────────

export function assessPestSpreadRisk(
  targetDistrict: string = "Coimbatore",
  targetBlock: string = "Thondamuthur",
  pathogen: string = "Fall Armyworm"
): PestSpreadRiskAssessment {
  return {
    targetDistrict,
    targetBlock,
    pathogen,
    riskLevel: "Watch",
    contributingFactorsEn: [
      "Moderate relative humidity (> 70%) favoring rapid oviposition and larval feeding.",
      "High contiguous host crop concentration (Maize acreage > 800 acres in block).",
      "Multiple field signals recorded in adjoining revenue villages within last 7 days.",
    ],
    contributingFactorsTa: [
      "அதிக ஈரப்பதம் (> 70%) புழுக்கள் பெருக்கத்திற்கு சாதகமாக உள்ளது.",
      "வட்டாரத்தில் தொடர்ச்சியான மக்காச்சோளப் பயிர் பரப்பளவு 800 ஏக்கருக்கு மேல் உள்ளது.",
      "கடந்த 7 நாட்களில் அருகிலுள்ள கிராமங்களில் தாக்குதல் அறிகுறி பதிவாகியுள்ளது.",
    ],
  };
}
