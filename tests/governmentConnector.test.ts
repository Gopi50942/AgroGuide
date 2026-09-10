import { describe, it, expect } from "vitest";
import {
  defaultGovernmentConnector,
  assertNoAadhaarPayload,
} from "@/lib/services/governmentConnectorService";

describe("Phase 41 — Government Readiness & Strict Aadhaar Rejection", () => {
  it("returns NOT_CONFIGURED for uncredentialed government identity connector", async () => {
    const res = await defaultGovernmentConnector.verifyIdentity("farmer_test_123");
    expect(res.status).toBe("NOT_CONFIGURED");
    expect(res.message).toContain("not configured");
  });

  it("strictly rejects and throws if any payload contains Aadhaar keys or 12-digit national IDs", () => {
    expect(() => {
      assertNoAadhaarPayload({
        name: "Test Farmer",
        aadhaarNumber: "123456789012",
      });
    }).toThrow(/SECURITY POLICY VIOLATION/);

    expect(() => {
      assertNoAadhaarPayload({
        farmerName: "Test Farmer",
        nationalId: "987654321098", // 12-digit value
      });
    }).toThrow(/SECURITY POLICY VIOLATION/);
  });

  it("permits safe agricultural payloads without error", () => {
    expect(() => {
      assertNoAadhaarPayload({
        crop: "Paddy",
        district: "Thanjavur",
        acres: 5,
      });
    }).not.toThrow();
  });
});
