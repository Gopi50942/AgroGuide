// ─────────────────────────────────────────────
// Phase 177: Agricultural University Trial Management Service
// Manages participatory agronomic research trials with consent boundaries.
// ─────────────────────────────────────────────

export interface UniversityResearchTrial {
  trialId: string;
  institution: "TNAU" | "ICAR" | "KVK";
  principalInvestigator: string;
  crop: string;
  varietyOrTreatment: string;
  trialType: "Varietal Evaluation" | "Nutrient Response" | "Bio-Control Efficacy";
  district: string;
  block: string;
  replicationsCount: number;
  startDate: string;
  status: "Active" | "Harvest Completed" | "Published";
}

let inMemoryTrials: UniversityResearchTrial[] = [
  {
    trialId: "TRL-TNAU-2026-TOM-01",
    institution: "TNAU",
    principalInvestigator: "Dr. Soundararajan (Dept of Horticulture)",
    crop: "Tomato",
    varietyOrTreatment: "CO 4 vs Shivam Hybrid under Subsurface Drip",
    trialType: "Nutrient Response",
    district: "Coimbatore",
    block: "Thondamuthur",
    replicationsCount: 4,
    startDate: "2026-03-01",
    status: "Active",
  },
];

export async function listUniversityTrials(district?: string): Promise<UniversityResearchTrial[]> {
  if (!district || district === "ALL") return inMemoryTrials;
  return inMemoryTrials.filter((t) => t.district.toLowerCase() === district.toLowerCase());
}
