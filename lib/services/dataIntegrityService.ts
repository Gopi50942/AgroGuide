import type { DataIntegrityAnomaly } from "@/types";

// ─────────────────────────────────────────────
// Phase 179: Production Data Integrity & Anti-Fraud Signals Service
// Flags inconsistent data for human review without autonomous fraud accusations.
// ─────────────────────────────────────────────

const MOCK_ANOMALIES: DataIntegrityAnomaly[] = [
  {
    id: "ANOM-INSP-001",
    entityType: "inspection",
    entityId: "insp_cbe_8841",
    anomalyType: "GPS Proximity Warning",
    reviewLevel: "Review",
    description: "Inspection photo GPS coordinates are 1,850m from registered farm centroid. Recommend verification with officer.",
    timestamp: new Date().toISOString(),
  },
  {
    id: "ANOM-CCE-002",
    entityType: "cce",
    entityId: "cce_demo_1",
    anomalyType: "Sample Yield Outlier",
    reviewLevel: "Info",
    description: "Sample weight yields 170 Qtl/Ha, which is in upper 95th percentile for block. Validated with drip fertigation evidence.",
    timestamp: new Date().toISOString(),
  },
];

export async function listDataIntegrityAnomalies(): Promise<DataIntegrityAnomaly[]> {
  return MOCK_ANOMALIES;
}
