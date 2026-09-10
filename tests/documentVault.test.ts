import { describe, it, expect } from "vitest";
import {
  saveDocumentMetadata,
  listFarmerDocuments,
} from "@/lib/services/documentVaultService";

describe("Phase 77 — Farmer Document Metadata Vault", () => {
  it("stores document metadata references while strictly rejecting Aadhaar numbers", async () => {
    const doc = await saveDocumentMetadata(
      "farmer_101",
      "crop_insurance_policy",
      "PMFBY Kharif 2026 Policy Receipt",
      "Agriculture Insurance Company of India",
      {
        referenceNumber: "PMFBY-TN-2026-88124",
        issueDate: "2026-06-01",
      },
      true
    );

    expect(doc.id).toBeDefined();
    expect(doc.docType).toBe("crop_insurance_policy");
    expect(doc.issuingAuthority).toContain("Insurance");

    // Attempting to pass 12-digit Aadhaar pattern must throw
    await expect(
      saveDocumentMetadata(
        "farmer_101",
        "other",
        "Aadhaar Card Copy",
        "UIDAI",
        { referenceNumber: "987654321098" },
        true
      )
    ).rejects.toThrow(/SECURITY POLICY VIOLATION/);
  });
});
