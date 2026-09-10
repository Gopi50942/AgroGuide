import type { BiocontrolBatch } from "@/types";

// ─────────────────────────────────────────────
// Phase 169: Bio-Control Laboratory Production & Inventory Service
// Tracks departmental production batches of parasitoids, antagonists, and bio-pesticides.
// ─────────────────────────────────────────────

let inMemoryBatches: BiocontrolBatch[] = [
  {
    batchId: "BIO-TRI-2026-081",
    organismName: "Trichogramma chilonis",
    productionDate: "2026-05-01",
    expiryDate: "2026-05-20",
    quantityLitresOrCards: 500,
    unit: "Cards (Egg Parasitoids)",
    labName: "State Bio-Control Production Laboratory, Coimbatore",
    districtAllocation: "Coimbatore & Tiruppur",
    qualityStatus: "Quality Certified",
  },
  {
    batchId: "BIO-VFD-2026-112",
    organismName: "Trichoderma viride",
    productionDate: "2026-04-15",
    expiryDate: "2026-10-15",
    quantityLitresOrCards: 1200,
    unit: "Kilograms (Bio-Fungicide)",
    labName: "State Bio-Control Production Laboratory, Thanjavur",
    districtAllocation: "Thanjavur & Tiruvarur",
    qualityStatus: "Quality Certified",
  },
];

export async function listBiocontrolBatches(district?: string): Promise<BiocontrolBatch[]> {
  if (!district || district === "ALL") return inMemoryBatches;
  return inMemoryBatches.filter((b) => b.districtAllocation.toLowerCase().includes(district.toLowerCase()));
}

export async function recordBiocontrolBatch(batch: BiocontrolBatch): Promise<BiocontrolBatch> {
  inMemoryBatches.unshift(batch);
  return batch;
}
