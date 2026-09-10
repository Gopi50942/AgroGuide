import type { WeatherAlert, Farm, Crop, DisasterCommandAssessment } from "@/types";

// ─────────────────────────────────────────────
// Phase 111: Climate & Disaster Agriculture Command Service
// Evaluates hazard exposure, dominant crops at risk, and actionable preparedness advisories.
// ─────────────────────────────────────────────

export function assessDisasterImpact(
  alerts: WeatherAlert[],
  farms: Farm[],
  crops: Crop[],
  targetDistrict: string = "Coimbatore"
): DisasterCommandAssessment[] {
  const districtFarms = farms.filter(
    (f) => (f.district || "Coimbatore").toLowerCase() === targetDistrict.toLowerCase()
  );
  const districtCrops = crops.filter((c) => {
    const parentFarm = farms.find((f) => f.id === c.farmId);
    return (parentFarm?.district || targetDistrict).toLowerCase() === targetDistrict.toLowerCase();
  });

  const totalAcreage = districtCrops.reduce((sum, c) => sum + (c.areaAcres || 1.0), 0);
  const dominantCrops = Array.from(new Set(districtCrops.map((c) => c.name))).slice(0, 4);
  const criticalStages = Array.from(
    new Set(districtCrops.map((c) => c.currentStage || "vegetative"))
  );

  const assessments: DisasterCommandAssessment[] = [];

  alerts.forEach((alert) => {
    let hazardType: DisasterCommandAssessment["hazardType"] = "heavy_rain";
    const titleLower = alert.titleEn.toLowerCase();

    if (titleLower.includes("heat")) hazardType = "heat_wave";
    else if (titleLower.includes("wind") || titleLower.includes("cyclone")) hazardType = "strong_wind";
    else if (titleLower.includes("dry") || titleLower.includes("drought")) hazardType = "dry_spell";
    else if (titleLower.includes("flood")) hazardType = "flood_risk";

    const advisoriesEn: string[] = [
      "Ensure proper drainage in low-lying crop fields to prevent water-logging.",
      "Postpone foliar pesticide sprays and chemical fertilizer top-dressing until weather stabilizes.",
      "Secure farm machinery, solar panels, and shade nets against high winds.",
    ];

    const advisoriesTa: string[] = [
      "தாழ்வான பகுதிகளில் உள்ள பயிர் நிலங்களில் நீர் தேங்காமல் வடிகால் வசதி செய்யவும்.",
      "வானிலை சீராகும் வரை இலைவழி பூச்சிக்கொல்லி மற்றும் உரமிடுதலை தள்ளி வைக்கவும்.",
      "சூரிய ஒளி பலகைகள் மற்றும் பண்ணை உபகரணங்களை பலத்த காற்றில் இருந்து பாதுகாக்கவும்.",
    ];

    assessments.push({
      hazardType,
      district: targetDistrict,
      potentiallyAffectedFarmers: districtFarms.length || 1,
      potentialAcreage: Math.round(totalAcreage * 10) / 10,
      dominantCrops: dominantCrops.length ? dominantCrops : ["Paddy", "Tomato", "Banana"],
      criticalGrowthStages: criticalStages,
      preparednessAdvisoriesEn: advisoriesEn,
      preparednessAdvisoriesTa: advisoriesTa,
      assessmentDate: new Date().toISOString(),
    });
  });

  return assessments;
}
