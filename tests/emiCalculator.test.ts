import { describe, it, expect } from "vitest";
import { calculateEmi } from "@/lib/utils/emiCalculator";

describe("Loan EMI Calculations", () => {
  it("calculates monthly EMI, total interest, and total repayment correctly", () => {
    const res = calculateEmi(100000, 7, 12);

    expect(res.monthlyEmi).toBeGreaterThan(8000);
    expect(res.monthlyEmi).toBeLessThan(9000);
    expect(res.totalRepayment).toBeGreaterThan(100000);
    expect(Math.round(res.totalInterest)).toBe(Math.round(res.totalRepayment - 100000));
  });

  it("handles 0 interest correctly", () => {
    const res = calculateEmi(60000, 0, 6);

    expect(res.monthlyEmi).toBe(10000);
    expect(res.totalInterest).toBe(0);
    expect(res.totalRepayment).toBe(60000);
  });

  it("handles 0 principal safely without division error", () => {
    const res = calculateEmi(0, 10, 12);

    expect(res.monthlyEmi).toBe(0);
    expect(res.totalInterest).toBe(0);
    expect(res.totalRepayment).toBe(0);
  });
});
