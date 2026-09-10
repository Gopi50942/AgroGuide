import type { FpoInstitutionalSummary } from "@/types";

// ─────────────────────────────────────────────
// Phase 119: FPO / Farmer Collective Management Service
// Institutional governance overview: membership rosters, active lots, and pooled commodities.
// ─────────────────────────────────────────────

let inMemoryFpos: FpoInstitutionalSummary[] = [
  {
    fpoId: "fpo_kongu_cbe",
    name: "Kongu Farmer Producer Company Ltd",
    district: "Coimbatore",
    activeMembersCount: 420,
    activeProcurementRounds: 3,
    pooledCommodities: [
      { commodity: "Hybrid Tomato", pooledQuintals: 1250 },
      { commodity: "Maize", pooledQuintals: 3400 },
      { commodity: "Small Onion", pooledQuintals: 850 },
    ],
  },
  {
    fpoId: "fpo_cauvery_delta",
    name: "Cauvery Delta Organic Paddy Farmers Collective",
    district: "Thanjavur",
    activeMembersCount: 650,
    activeProcurementRounds: 2,
    pooledCommodities: [
      { commodity: "Samba Paddy (CR 1009)", pooledQuintals: 8200 },
      { commodity: "Black Gram", pooledQuintals: 1100 },
    ],
  },
];

export async function listFpoInstitutionalSummaries(districtFilter?: string): Promise<FpoInstitutionalSummary[]> {
  if (!districtFilter || districtFilter === "ALL") return inMemoryFpos;
  return inMemoryFpos.filter((f) => f.district.toLowerCase() === districtFilter.toLowerCase());
}
