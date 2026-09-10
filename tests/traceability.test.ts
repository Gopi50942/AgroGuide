import { describe, it, expect } from "vitest";
import {
  generateBatchCode,
  sanitizeBatchForPublicView,
} from "@/lib/services/traceabilityService";
import type { HarvestBatch } from "@/types";

describe("Phase 37 — Harvest Traceability & Public Privacy", () => {
  it("generates structured batch codes with district and crop prefix", () => {
    const code = generateBatchCode("Tomato", "Coimbatore");
    expect(code.startsWith("AG-COI-TOM-")).toBe(true);
  });

  it("sanitizes batch payloads and strictly omits private farmer data", () => {
    const internalBatch: HarvestBatch = {
      id: "internal_batch_123",
      ownerId: "farmer_uid_999",
      batchCode: "AG-COI-TOM-2026-X9Y2Z",
      farmId: "farm_cauvery_01",
      farmName: "Private Cauvery Farm",
      cropId: "crop_tomatof1",
      crop: "Hybrid Tomato F1",
      variety: "Shivam",
      harvestRecordId: "harv_rec_777",
      harvestDate: "2026-06-25",
      quantity: 50,
      unit: "crate",
      qualityGrade: "Grade A",
      district: "Coimbatore",
      state: "Tamil Nadu",
      farmerConsentDisplayName: "Farmer Kumar",
      isPublic: true,
      createdAt: "2026-06-25T10:00:00Z",
    };

    const publicView = sanitizeBatchForPublicView(internalBatch);

    expect(publicView.batchCode).toBe("AG-COI-TOM-2026-X9Y2Z");
    expect(publicView.crop).toBe("Hybrid Tomato F1");
    expect(publicView.farmerDisplayName).toBe("Farmer Kumar");
    // Ensure internal IDs and private references are completely stripped
    expect((publicView as any).ownerId).toBeUndefined();
    expect((publicView as any).farmId).toBeUndefined();
    expect((publicView as any).harvestRecordId).toBeUndefined();
  });
});
