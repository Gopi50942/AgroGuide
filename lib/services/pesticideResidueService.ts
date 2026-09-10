import type { ResidueTestRecord } from "@/types";

// ─────────────────────────────────────────────
// Phase 164: Pesticide Residue QR Traceability Service
// Harvest batch laboratory residue records and public-safe QR payloads.
// ─────────────────────────────────────────────

let inMemoryResidueRecords: ResidueTestRecord[] = [
  {
    id: "res_test_01",
    batchId: "AG-TRACE-LOT-881902",
    crop: "Tomato",
    labName: "NABL Accredited Food Safety & Residue Testing Lab, Chennai",
    labReference: "NABL-FSL-2026-TOM-0091",
    sampleDate: "2026-05-10",
    testDate: "2026-05-12",
    resultStatus: "Pass / Below MRL",
    analyteSummary: [
      { chemical: "Chlorantraniliprole", detectedPpm: 0.02, mrlLimitPpm: 0.5 },
      { chemical: "Azoxystrobin", detectedPpm: 0.01, mrlLimitPpm: 3.0 },
    ],
    verificationStatus: "Verified Reference",
    isPublicQrSafe: true,
  },
];

export async function getResidueRecordForBatch(batchId: string): Promise<ResidueTestRecord | null> {
  const match = inMemoryResidueRecords.find((r) => r.batchId === batchId);
  return match || null;
}

export function getPublicResidueQrSummary(record: ResidueTestRecord) {
  return {
    batchCode: record.batchId,
    crop: record.crop,
    labReference: record.labReference,
    testDate: record.testDate,
    status: record.resultStatus,
    testedChemicalsCount: record.analyteSummary.length,
    verification: record.verificationStatus,
  };
}
