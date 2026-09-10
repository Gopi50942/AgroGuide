import { describe, it, expect } from "vitest";
import {
  computeMarketPriceTrends,
  normalizeArrivalDate,
  calculateSMA,
} from "@/lib/market/trendCalculator";
import type { NormalizedMarketRecord } from "@/lib/market/marketTypes";

describe("Market Price Trends & SMA Engine", () => {
  it("normalizes diverse date formats deterministically", () => {
    expect(normalizeArrivalDate("15/08/2026")).toBe("2026-08-15");
    expect(normalizeArrivalDate("15-08-2026")).toBe("2026-08-15");
    expect(normalizeArrivalDate("2026-08-15")).toBe("2026-08-15");
    expect(normalizeArrivalDate("invalid")).toBeNull();
  });

  it("calculates moving averages accurately without hallucinated values", () => {
    const raw = [
      { date: "2026-08-01", modalPrice: 2000, minPrice: 1800, maxPrice: 2200 },
      { date: "2026-08-02", modalPrice: 2200, minPrice: 2000, maxPrice: 2400 },
      { date: "2026-08-03", modalPrice: 2400, minPrice: 2100, maxPrice: 2600 },
      { date: "2026-08-04", modalPrice: 2600, minPrice: 2300, maxPrice: 2800 },
    ];

    const withSMA = calculateSMA(raw, 3);
    expect(withSMA).toHaveLength(4);
    // First point sma is own price: 2000
    expect(withSMA[0].sma).toBe(2000);
    // Second point sma is avg(2000, 2200) = 2100
    expect(withSMA[1].sma).toBe(2100);
    // Third point sma is avg(2000, 2200, 2400) = 2200
    expect(withSMA[2].sma).toBe(2200);
    // Fourth point sma is avg(2200, 2400, 2600) = 2400
    expect(withSMA[3].sma).toBe(2400);
  });

  it("computes lowest, highest, average, and percentage change correctly", () => {
    const mockRecords: NormalizedMarketRecord[] = [
      {
        id: "1",
        state: "Tamil Nadu",
        district: "Coimbatore",
        market: "Coimbatore",
        commodity: "Tomato",
        variety: "Local",
        grade: "FAQ",
        arrivalDate: "01/08/2026",
        minPrice: 1800,
        maxPrice: 2200,
        modalPrice: 2000,
      },
      {
        id: "2",
        state: "Tamil Nadu",
        district: "Coimbatore",
        market: "Coimbatore",
        commodity: "Tomato",
        variety: "Local",
        grade: "FAQ",
        arrivalDate: "05/08/2026",
        minPrice: 2200,
        maxPrice: 2800,
        modalPrice: 2500,
      },
    ];

    const result = computeMarketPriceTrends(mockRecords, 90);
    expect(result.series).toHaveLength(2);
    expect(result.lowestPrice).toBe(2000);
    expect(result.highestPrice).toBe(2500);
    expect(result.averagePrice).toBe(2250);
    expect(result.percentageChange).toBe(25); // (2500-2000)/2000 = +25%
  });
});
