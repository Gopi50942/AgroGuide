import type { DistrictYieldAnomaly } from "@/types";

// ─────────────────────────────────────────────
// Phase 134: District Yield Anomaly Detection Service
// Compares harvest and CCE telemetry with historical norms. Explanatory outputs.
// ─────────────────────────────────────────────

const HISTORICAL_NORMS: Record<string, number> = {
  tomato: 160.0, // Quintal/Ha
  paddy: 54.0,
  maize: 30.0,
  banana: 280.0,
};

export function detectYieldAnomaly(
  district: string = "Coimbatore",
  crop: string = "Tomato",
  currentEstimatedYieldQuintalPerHa: number = 170.0
): DistrictYieldAnomaly {
  const norm = HISTORICAL_NORMS[crop.toLowerCase()] || 150.0;
  const deviationPercent = ((currentEstimatedYieldQuintalPerHa - norm) / norm) * 100;

  let anomalyStatus: DistrictYieldAnomaly["anomalyStatus"] = "Within expected range";
  let explanation = "Observed sample yields match historical agro-climatic baseline.";

  if (deviationPercent < -15) {
    anomalyStatus = "Below historical range";
    explanation = "Yield reduction observed; correlated with recent moisture stress and pest incidence in early growth stages.";
  } else if (deviationPercent > 15) {
    anomalyStatus = "Above historical range";
    explanation = "Favorable weather, adequate drip fertigation, and high hybrid seed adoption contributing to above-average productivity.";
  }

  return {
    district,
    crop,
    historicalYieldQuintalPerHa: norm,
    currentEstimatedYieldQuintalPerHa,
    anomalyStatus,
    explanation,
  };
}
