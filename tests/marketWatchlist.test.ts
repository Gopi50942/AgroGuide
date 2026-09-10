import { describe, it, expect } from "vitest";
import { evaluateTargetPriceStatus } from "@/lib/services/marketWatchlistService";

describe("Market Target Price Evaluation", () => {
  it("evaluates ABOVE target direction correctly", () => {
    // Current price 2800 >= target 2500 -> reached
    const res1 = evaluateTargetPriceStatus(2800, 2500, "ABOVE");
    expect(res1.status).toBe("reached");
    expect(res1.difference).toBe(300);

    // Current price 2300 < target 2500 -> pending
    const res2 = evaluateTargetPriceStatus(2300, 2500, "ABOVE");
    expect(res2.status).toBe("pending");
    expect(res2.difference).toBe(-200);
  });

  it("evaluates BELOW target direction correctly", () => {
    // Current price 1800 <= target 2000 -> reached
    const res1 = evaluateTargetPriceStatus(1800, 2000, "BELOW");
    expect(res1.status).toBe("reached");
    expect(res1.difference).toBe(200);

    // Current price 2200 > target 2000 -> pending
    const res2 = evaluateTargetPriceStatus(2200, 2000, "BELOW");
    expect(res2.status).toBe("pending");
    expect(res2.difference).toBe(-200);
  });
});
