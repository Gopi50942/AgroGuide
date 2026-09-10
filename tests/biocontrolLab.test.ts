import { describe, it, expect } from "vitest";
import { listBiocontrolBatches, recordBiocontrolBatch } from "@/lib/services/biocontrolLabService";

describe("Phase 169 — Bio-Control Production Laboratory Management", () => {
  it("tracks parasitoid and bio-fungicide batches with quality certification lifecycle", async () => {
    const batches = await listBiocontrolBatches("Coimbatore");
    expect(batches.length).toBeGreaterThanOrEqual(1);
    expect(batches[0].organismName).toBe("Trichogramma chilonis");
    expect(batches[0].qualityStatus).toBe("Quality Certified");

    const newBatch = await recordBiocontrolBatch({
      batchId: "BIO-PSEUDO-2026-001",
      organismName: "Pseudomonas fluorescens",
      productionDate: "2026-05-10",
      expiryDate: "2026-11-10",
      quantityLitresOrCards: 800,
      unit: "Litres (Liquid Bio-Control)",
      labName: "State Bio-Control Lab, Coimbatore",
      districtAllocation: "Coimbatore",
      qualityStatus: "Quality Certified",
    });

    expect(newBatch.batchId).toBe("BIO-PSEUDO-2026-001");
  });
});
