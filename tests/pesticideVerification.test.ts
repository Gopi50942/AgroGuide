import { describe, it, expect } from "vitest";
import { verifyInputRetailer, verifyPesticideProduct } from "@/lib/services/pesticideVerificationService";

describe("Phase 146 — Pesticide Retailer & Product Verification", () => {
  it("verifies state-licensed agrochemical dealers without fabricating status", async () => {
    const verified = await verifyInputRetailer("DEALER-CBE-9941");
    expect(verified).not.toBeNull();
    expect(verified?.dealerName).toContain("Kongunadu");
    expect(verified?.status).toBe("Verified from source");

    const nonExistent = await verifyInputRetailer("DEALER-FAKE-0000");
    expect(nonExistent).toBeNull();
  });

  it("checks CIB&RC approved labels and crop dosage guidance", async () => {
    const prod = await verifyPesticideProduct("Chlorantraniliprole");
    expect(prod).not.toBeNull();
    expect(prod?.verificationStatus).toBe("Approved by CIB&RC");
    expect(prod?.approvedCrops).toContain("Tomato");
  });
});
