import type { NormalizedMarketRecord } from "./marketTypes";

// ─────────────────────────────────────────────
// Mandi Price Trend Analytics & Deterministic Statistics
// Pure math & statistical aggregations on real market observations.
// NO AI hallucination or fabricated future prices.
// ─────────────────────────────────────────────

export interface TrendDataPoint {
  date: string;
  formattedDate: string;
  modalPrice: number;
  minPrice: number;
  maxPrice: number;
  movingAverage?: number;
}

export interface MarketTrendSummary {
  series: TrendDataPoint[];
  latestPrice: number;
  highestPrice: number;
  lowestPrice: number;
  averagePrice: number;
  percentageChange: number;
  trendDirection: "UP" | "DOWN" | "STABLE";
  observationCount: number;
  hasSufficientData: boolean;
}

/**
 * Standardize Indian government date formats (DD/MM/YYYY or YYYY-MM-DD) to ISO YYYY-MM-DD
 */
export function normalizeArrivalDate(rawDate: string): string | null {
  if (!rawDate) return null;
  const trimmed = rawDate.trim();

  // Handle DD/MM/YYYY or DD-MM-YYYY
  if (/^\d{1,2}[/-]\d{1,2}[/-]\d{4}$/.test(trimmed)) {
    const parts = trimmed.split(/[/-]/);
    const day = parts[0].padStart(2, "0");
    const month = parts[1].padStart(2, "0");
    const year = parts[2];
    return `${year}-${month}-${day}`;
  }

  // Handle YYYY-MM-DD
  if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
    return trimmed;
  }

  const d = new Date(trimmed);
  return isNaN(d.getTime()) ? null : d.toISOString().slice(0, 10);
}

export function calculateSMA(
  points: { modalPrice: number; [key: string]: any }[],
  windowSize: number = 3
): typeof points {
  return points.map((point, idx, arr) => {
    if (idx < windowSize - 1) {
      const subset = arr.slice(0, idx + 1);
      const sum = subset.reduce((acc, p) => acc + p.modalPrice, 0);
      return { ...point, sma: Math.round(sum / subset.length), movingAverage: Math.round(sum / subset.length) };
    }
    const subset = arr.slice(idx - windowSize + 1, idx + 1);
    const sum = subset.reduce((acc, p) => acc + p.modalPrice, 0);
    const sma = Math.round(sum / windowSize);
    return { ...point, sma, movingAverage: sma };
  });
}

/**
 * Calculate deterministic trend statistics, simple moving averages, and percentage change.
 */
export function computeMarketPriceTrends(
  records: NormalizedMarketRecord[],
  periodDays: 7 | 30 | 90 = 30
): MarketTrendSummary {
  if (!records || records.length === 0) {
    return {
      series: [],
      latestPrice: 0,
      highestPrice: 0,
      lowestPrice: 0,
      averagePrice: 0,
      percentageChange: 0,
      trendDirection: "STABLE",
      observationCount: 0,
      hasSufficientData: false,
    };
  }

  // 1. Group records by normalized date and calculate daily mean modal price
  const dateMap = new Map<string, { modalSum: number; min: number; max: number; count: number }>();

  for (const r of records) {
    const normDate = normalizeArrivalDate(r.arrivalDate);
    if (!normDate) continue;

    const existing = dateMap.get(normDate);
    if (!existing) {
      dateMap.set(normDate, {
        modalSum: r.modalPrice,
        min: r.minPrice,
        max: r.maxPrice,
        count: 1,
      });
    } else {
      existing.modalSum += r.modalPrice;
      existing.min = Math.min(existing.min, r.minPrice);
      existing.max = Math.max(existing.max, r.maxPrice);
      existing.count += 1;
    }
  }

  // 2. Sort chronologically
  const sortedDates = Array.from(dateMap.keys()).sort();

  // Filter within requested period if dates are valid ISO
  const now = new Date();
  const cutoffTime = new Date(now.getTime() - periodDays * 86400000).toISOString().slice(0, 10);
  const periodDates = sortedDates.filter((d) => d >= cutoffTime);

  // If filtered set is empty, fallback to the available sorted dates
  const activeDates = periodDates.length > 0 ? periodDates : sortedDates;

  const rawSeries: TrendDataPoint[] = activeDates.map((date) => {
    const entry = dateMap.get(date)!;
    const avgModal = Math.round(entry.modalSum / entry.count);
    return {
      date,
      formattedDate: formatDateLabel(date),
      modalPrice: avgModal,
      minPrice: entry.min,
      maxPrice: entry.max,
    };
  });

  // 3. Compute 3-observation Simple Moving Average (SMA)
  const windowSize = 3;
  const series: TrendDataPoint[] = rawSeries.map((point, idx, arr) => {
    if (idx < windowSize - 1) {
      return { ...point, movingAverage: point.modalPrice };
    }
    const subset = arr.slice(idx - windowSize + 1, idx + 1);
    const sum = subset.reduce((acc, p) => acc + p.modalPrice, 0);
    const sma = Math.round(sum / windowSize);
    return { ...point, movingAverage: sma };
  });

  if (series.length === 0) {
    return {
      series: [],
      latestPrice: 0,
      highestPrice: 0,
      lowestPrice: 0,
      averagePrice: 0,
      percentageChange: 0,
      trendDirection: "STABLE",
      observationCount: 0,
      hasSufficientData: false,
    };
  }

  const prices = series.map((s) => s.modalPrice);
  const firstPrice = series[0].modalPrice;
  const latestPrice = series[series.length - 1].modalPrice;
  const highestPrice = Math.max(...prices);
  const lowestPrice = Math.min(...prices);
  const averagePrice = Math.round(prices.reduce((a, b) => a + b, 0) / prices.length);

  // Percentage change from start of period to latest observation
  const diff = latestPrice - firstPrice;
  const percentageChange = firstPrice > 0 ? Number(((diff / firstPrice) * 100).toFixed(1)) : 0;

  const trendDirection: "UP" | "DOWN" | "STABLE" =
    percentageChange >= 1.5 ? "UP" : percentageChange <= -1.5 ? "DOWN" : "STABLE";

  return {
    series,
    latestPrice,
    highestPrice,
    lowestPrice,
    averagePrice,
    percentageChange,
    trendDirection,
    observationCount: series.length,
    hasSufficientData: series.length >= 2,
  };
}

function formatDateLabel(isoDate: string): string {
  try {
    const parts = isoDate.split("-");
    if (parts.length === 3) {
      return `${parts[2]}/${parts[1]}`;
    }
    return isoDate;
  } catch {
    return isoDate;
  }
}
