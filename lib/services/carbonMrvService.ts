import type { CarbonMrvRecord } from "@/types";

// ─────────────────────────────────────────────
// Phase 171: Climate & Carbon MRV Readiness Service
// Evidence tracker for regenerative agronomic practices. Educational non-certification notice.
// ─────────────────────────────────────────────

export const CARBON_MRV_DISCLAIMER =
  "Educational estimated climate benefit only. Not an accredited carbon credit issuance or tokenized certificate. Formal carbon verification requires third-party registry audit.";

let inMemoryCarbonRecords: CarbonMrvRecord[] = [
  {
    id: "carb_rec_01",
    farmId: "farm_cbe_main",
    ownerId: "farmer_gopi_cbe",
    practiceType: "drip_irrigation",
    startDate: "2025-06-01",
    areaAcres: 2.5,
    estimatedCo2EquivalentTonnesPerYear: 3.2,
    verificationStatus: "Officer Inspected",
    disclaimer: CARBON_MRV_DISCLAIMER,
  },
  {
    id: "carb_rec_02",
    farmId: "farm_cbe_main",
    ownerId: "farmer_gopi_cbe",
    practiceType: "biochar",
    startDate: "2025-10-15",
    areaAcres: 1.5,
    estimatedCo2EquivalentTonnesPerYear: 2.1,
    verificationStatus: "Self Reported",
    disclaimer: CARBON_MRV_DISCLAIMER,
  },
];

export async function listCarbonMrvRecords(ownerId?: string): Promise<CarbonMrvRecord[]> {
  if (ownerId) return inMemoryCarbonRecords.filter((r) => r.ownerId === ownerId);
  return inMemoryCarbonRecords;
}
