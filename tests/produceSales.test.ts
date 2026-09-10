import { describe, it, expect } from "vitest";
import { calculateSaleAmounts } from "@/lib/services/produceSalesService";
import { normalizeQuantityToKg } from "@/lib/services/harvestService";

describe("Produce Sales & Harvest Calculations", () => {
  it("calculates gross and net realization with transport and commission deductions", () => {
    const res = calculateSaleAmounts({
      quantity: 1000,
      ratePerUnit: 30,
      transportCost: 1500,
      commissionCost: 1200,
      otherSellingCost: 300,
    });

    expect(res.grossAmount).toBe(30000);
    expect(res.netRealization).toBe(27000); // 30000 - 3000
  });

  it("handles 0 selling costs cleanly", () => {
    const res = calculateSaleAmounts({
      quantity: 50,
      ratePerUnit: 40,
    });

    expect(res.grossAmount).toBe(2000);
    expect(res.netRealization).toBe(2000);
  });

  it("normalizes harvest quantities to kg correctly", () => {
    expect(normalizeQuantityToKg(5, "tonne")).toBe(5000);
    expect(normalizeQuantityToKg(12, "quintal")).toBe(1200);
    expect(normalizeQuantityToKg(350, "kg")).toBe(350);
  });
});
