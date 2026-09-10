import { describe, it, expect } from "vitest";
import { getFarmerPassbookData } from "@/lib/services/farmerPassbookService";

describe("Phase 172 — Farmer Unified Agriculture Passbook", () => {
  it("aggregates holdings, crop history, expenses, harvest, and sales into a single ledger", async () => {
    const passbook = await getFarmerPassbookData("farmer_gopi_cbe");
    expect(passbook.farmerName).toBe("Gopi S");
    expect(passbook.totalAcres).toBeGreaterThan(0);
    expect(passbook.activeCrops.length).toBeGreaterThanOrEqual(1);
    expect(passbook.totalHarvestQuintals).toBeGreaterThan(0);
    expect(passbook.totalSalesRevenueRs).toBeGreaterThan(0);
  });
});
