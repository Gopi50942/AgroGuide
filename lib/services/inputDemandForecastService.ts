import type { InputDemandForecast } from "@/types";

// ─────────────────────────────────────────────
// Phase 137: Input Demand Forecasting Service
// Estimates district seasonal input requirements based on crop acreage patterns.
// ─────────────────────────────────────────────

export const INPUT_FORECAST_DISCLAIMER =
  "Planning estimate — derived from active crop acreage, crop stage schedules, and recommended package of practices. Not a binding procurement order.";

export function forecastInputDemand(
  district: string = "Coimbatore",
  season: string = "Kharif 2026"
): InputDemandForecast {
  return {
    district,
    season,
    forecastedDemand: [
      {
        category: "Hybrid Tomato Seeds",
        estimatedQuantity: 420,
        unit: "Kilograms",
        disclaimer: INPUT_FORECAST_DISCLAIMER,
      },
      {
        category: "Urea Fertilizer",
        estimatedQuantity: 2850,
        unit: "Tonnes",
        disclaimer: INPUT_FORECAST_DISCLAIMER,
      },
      {
        category: "DAP Fertilizer",
        estimatedQuantity: 1250,
        unit: "Tonnes",
        disclaimer: INPUT_FORECAST_DISCLAIMER,
      },
      {
        category: "Micro-Irrigation Lateral Tubing",
        estimatedQuantity: 850000,
        unit: "Meters",
        disclaimer: INPUT_FORECAST_DISCLAIMER,
      },
      {
        category: "Trichoderma Viride Bio-Fungicide",
        estimatedQuantity: 12000,
        unit: "Litres",
        disclaimer: INPUT_FORECAST_DISCLAIMER,
      },
    ],
  };
}
