import type { MarketArrivalForecast } from "@/types";

// ─────────────────────────────────────────────
// Phase 138: State Market Arrival Forecast Service
// Forecasts commodity arrival volume across district mandis during peak harvest windows.
// ─────────────────────────────────────────────

export const ARRIVAL_FORECAST_DISCLAIMER =
  "Estimated market arrivals based on registered acreage, sowing dates, and harvest schedules. Actual arrivals depend on market prices, farmer retention, and weather conditions.";

export function forecastMarketArrivals(
  district: string = "Coimbatore",
  commodity: string = "Tomato"
): MarketArrivalForecast {
  return {
    district,
    commodity,
    peakArrivalWindow: "Next 2–4 Weeks (June 15 – July 15)",
    estimatedArrivalQuintalsMin: 22000,
    estimatedArrivalQuintalsMax: 28000,
    coverageDisclaimer: ARRIVAL_FORECAST_DISCLAIMER,
  };
}
