import type { OpenDataFeedMeta } from "@/types";

// ─────────────────────────────────────────────
// Phase 151: State Agriculture Open Data Exchange Service
// Sanitized public open datasets. Strict zero PII, 5-farm privacy cohort masking.
// ─────────────────────────────────────────────

export const OPEN_DATA_DISCLAIMER =
  "Official AgroGuide Open Data Feed — anonymized, cohort-aggregated statistics for public research and planning. Zero personal farmer data or private farm coordinates are exposed.";

export function getOpenDataMeta(endpointName: string, coverageSummary: string): OpenDataFeedMeta {
  return {
    endpoint: `/api/open-data/v1/${endpointName}`,
    version: "1.0.0",
    generatedAt: new Date().toISOString(),
    coverageSummary,
    minimumCohortThreshold: 5,
    disclaimer: OPEN_DATA_DISCLAIMER,
  };
}
