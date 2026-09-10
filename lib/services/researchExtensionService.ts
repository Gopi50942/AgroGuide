import type { ResearchExtensionPublication } from "@/types";

// ─────────────────────────────────────────────
// Phase 149: University Research Extension Connector Service
// Curated research advisories, variety releases, and bulletins from TNAU / ICAR.
// ─────────────────────────────────────────────

const MOCK_RESEARCH_FEEDS: ResearchExtensionPublication[] = [
  {
    id: "res_tnau_2026_01",
    source: "TNAU",
    category: "variety_release",
    title: "Release of Drought-Tolerant High-Yielding Small Onion Variety 'CO 6'",
    summary:
      "Tamil Nadu Agricultural University has released CO 6 small onion, exhibiting 18% higher yield and moderate resistance to basal rot under deficit drip irrigation regimes.",
    publicationDate: "2026-03-15",
    officialUrl: "https://tnau.ac.in/research/varieties/co6-onion",
    applicableCrops: ["Small Onion", "Shallots"],
  },
  {
    id: "res_icar_2026_02",
    source: "ICAR",
    category: "pest_advisory",
    title: "Bio-Intensive Management of Fall Armyworm in Maize",
    summary:
      "Recommended application of Metarhizium anisopliae (1x10^8 CFU/g) @ 5g/L combined with pheromone trapping at 12 traps/ha for effective early whorl protection.",
    publicationDate: "2026-04-02",
    officialUrl: "https://icar.org.in/advisories/faw-maize-bio",
    applicableCrops: ["Maize", "Sweet Corn"],
  },
];

export async function listResearchPublications(cropFilter?: string): Promise<ResearchExtensionPublication[]> {
  if (!cropFilter) return MOCK_RESEARCH_FEEDS;
  return MOCK_RESEARCH_FEEDS.filter((r) =>
    r.applicableCrops.some((c) => c.toLowerCase().includes(cropFilter.toLowerCase()))
  );
}
