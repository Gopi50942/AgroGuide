import type { Crop, WeatherAlert, DiseaseReport, CropRiskAssessment, CropRiskLevel } from "@/types";

// ─────────────────────────────────────────────
// Phase 66: Crop Risk Score Engine
// Evaluates agronomic vulnerabilities deterministically without claiming arbitrary failure probabilities.
// ─────────────────────────────────────────────

export function evaluateCropRisk(params: {
  crop: Crop;
  weatherAlerts: WeatherAlert[];
  diseaseReports: DiseaseReport[];
  overdueTasksCount: number;
}): CropRiskAssessment {
  let score = 10;
  const factorsEn: string[] = [];
  const factorsTa: string[] = [];

  // Stage vulnerability
  const stage = params.crop.stage || params.crop.currentStage || "vegetative";
  if (stage === "flowering" || stage === "fruiting") {
    score += 25;
    factorsEn.push(`Critical stage (${stage}) vulnerable to moisture stress and blossom drop.`);
    factorsTa.push(`பூக்கும்/காய்க்கும் பருவம் என்பதால் பூ உதிர்தல் மற்றும் நீர் பற்றாக்குறை அபாயம்.`);
  }

  // Active weather alerts
  if (params.weatherAlerts.length > 0) {
    score += 35;
    factorsEn.push("Adverse meteorological advisory active in your district.");
    factorsTa.push("மாவட்டத்தில் தீவிர வானிலை எச்சரிக்கை விடுக்கப்பட்டுள்ளது.");
  }

  // Recent disease reports
  const relevantDiseases = params.diseaseReports.filter(
    (d) => d.cropName?.toLowerCase() === params.crop.name.toLowerCase()
  );
  if (relevantDiseases.length > 0) {
    score += 30;
    factorsEn.push(`Recent disease symptom detected (${relevantDiseases[0].diagnosis}).`);
    factorsTa.push(`பயிரில் அண்மையில் நோய் அறிகுறி (${relevantDiseases[0].diagnosis}) கண்டறியப்பட்டது.`);
  }

  // Overdue tasks
  if (params.overdueTasksCount > 2) {
    score += 15;
    factorsEn.push(`${params.overdueTasksCount} overdue cultivation tasks.`);
    factorsTa.push(`${params.overdueTasksCount} நிலுவையில் உள்ள பயிர் பணிகள்.`);
  }

  const cappedScore = Math.min(100, score);
  let riskLevel: CropRiskLevel = "Low";
  if (cappedScore >= 65) riskLevel = "High";
  else if (cappedScore >= 35) riskLevel = "Moderate";

  let preventiveActionEn = "Maintain scheduled irrigation and regular pest scouting.";
  let preventiveActionTa = "வழக்கமான பாசனம் மற்றும் பூச்சி கண்காணிப்பை தொடரவும்.";

  if (riskLevel === "High") {
    preventiveActionEn = "Prioritize fungal prophylaxis and ensure clean drainage furrows immediately.";
    preventiveActionTa = "உடனடியாக வடிகால் வசதியை சரிசெய்து பூஞ்சான தடுப்பு மருந்து தெளிக்கவும்.";
  }

  return {
    cropId: params.crop.id,
    cropName: params.crop.name,
    riskLevel,
    riskScore: cappedScore,
    keyRiskFactorsEn: factorsEn.length > 0 ? factorsEn : ["Optimal growing conditions; no elevated risk factors."],
    keyRiskFactorsTa: factorsTa.length > 0 ? factorsTa : ["சாதகமான சூழல்; கூடுதல் இடர் காரணிகள் இல்லை."],
    preventiveActionEn,
    preventiveActionTa,
  };
}
