import { describe, it, expect } from "vitest";
import { generateLossEvidenceSummary } from "@/lib/services/cropInsuranceService";
import type { CropLossEvent } from "@/types";

describe("Phase 47 — Crop Insurance & Loss Evidence Center", () => {
  it("generates evidence dossier with required disclaimer and structured details", () => {
    const lossEvent: CropLossEvent = {
      id: "loss_01",
      ownerId: "farmer_01",
      farmId: "farm_01",
      farmName: "Cauvery Field 2",
      cropId: "crop_tomato_01",
      cropName: "Hybrid Tomato",
      eventType: "unseasonal_rain",
      eventDate: "2026-06-25",
      estimatedAffectedAreaAcres: 2.5,
      farmerNotes: "Inundation of furrows causing root rot during flowering",
      photoUrls: ["https://firebasestorage.../photo1.jpg"],
      weatherContext: { rainfallMm: 85 },
      policyReference: "PMFBY-TN-2026-9988",
      createdAt: "2026-06-25T00:00:00Z",
    };

    const dossier = generateLossEvidenceSummary(lossEvent, "M. Palanisamy", "Thanjavur");

    expect(dossier.dossierTitle).toContain("Hybrid Tomato");
    expect(dossier.disclaimer).toContain("Farmer-recorded evidence");
    expect(dossier.disclaimer).toContain("not an official insurance assessment");

    const policyItem = dossier.evidenceItems.find((i) => i.label === "Policy Reference");
    expect(policyItem?.value).toBe("PMFBY-TN-2026-9988");
  });
});
