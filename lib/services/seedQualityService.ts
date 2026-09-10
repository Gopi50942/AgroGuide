import type { SeedLot } from "@/types";

// ─────────────────────────────────────────────
// Phase 130: Seed Quality & Certification Tracking Service
// Seed lot quality tracking, lab test dates, and certification statuses.
// ─────────────────────────────────────────────

let inMemorySeedLots: SeedLot[] = [
  {
    id: "seed_lot_01",
    lotNumber: "TN-SEED-2026-TOM-981",
    crop: "Tomato",
    variety: "Shivam Hybrid F1",
    producerName: "Tamil Nadu State Seed Development Corp (TANSEDC)",
    category: "Certified",
    germinationPercent: 88,
    purityPercent: 99.2,
    testDate: "2026-04-10",
    labName: "State Seed Testing Laboratory, Coimbatore",
    certificationRef: "SSTC-CBE-CERT-8841",
    status: "Passed",
  },
  {
    id: "seed_lot_02",
    lotNumber: "TN-SEED-2026-PAD-442",
    crop: "Paddy",
    variety: "CR 1009 (Ponmani)",
    producerName: "Cauvery Seed Growers Cooperative Society",
    category: "Foundation",
    germinationPercent: 92,
    purityPercent: 99.8,
    testDate: "2026-05-02",
    labName: "State Seed Testing Laboratory, Thanjavur",
    certificationRef: "SSTC-TNJ-CERT-1120",
    status: "Passed",
  },
];

export async function listSeedLots(districtFilter?: string): Promise<SeedLot[]> {
  return inMemorySeedLots;
}

export async function recordSeedLot(lot: Omit<SeedLot, "id">): Promise<SeedLot> {
  const newLot: SeedLot = {
    ...lot,
    id: `seed_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
  };
  inMemorySeedLots.unshift(newLot);
  return newLot;
}

export async function updateSeedLotStatus(
  lotId: string,
  status: SeedLot["status"]
): Promise<SeedLot | null> {
  const item = inMemorySeedLots.find((l) => l.id === lotId || l.lotNumber === lotId);
  if (!item) return null;
  item.status = status;
  return item;
}
