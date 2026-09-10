import type { NocSystemHealth } from "@/types";

// ─────────────────────────────────────────────
// Phase 180: State Control Room / NOC Service
// Monitors telemetry latency, external provider health, and operational uptime without secrets.
// ─────────────────────────────────────────────

const MOCK_NOC_HEALTH: NocSystemHealth[] = [
  {
    serviceName: "Next.js Core Application Runtime",
    category: "Infrastructure",
    status: "Operational",
    latencyMs: 42,
    errorRatePercent: 0.0,
    lastSyncTimestamp: new Date().toISOString(),
  },
  {
    serviceName: "Firebase Firestore & Security Rules",
    category: "Database",
    status: "Operational",
    latencyMs: 65,
    errorRatePercent: 0.01,
    lastSyncTimestamp: new Date().toISOString(),
  },
  {
    serviceName: "Open-Meteo Weather API Gateway",
    category: "External Provider",
    status: "Operational",
    latencyMs: 120,
    errorRatePercent: 0.0,
    lastSyncTimestamp: new Date().toISOString(),
  },
  {
    serviceName: "Agmarknet Mandi Webhook Receiver",
    category: "API",
    status: "Operational",
    latencyMs: 85,
    errorRatePercent: 0.0,
    lastSyncTimestamp: new Date().toISOString(),
  },
  {
    serviceName: "AgriStack Sandbox Connector",
    category: "External Provider",
    status: "Not Configured",
    latencyMs: 0,
    errorRatePercent: 0.0,
    lastSyncTimestamp: new Date().toISOString(),
  },
  {
    serviceName: "State Groundwater Piezometer Ingestion",
    category: "External Provider",
    status: "Operational",
    latencyMs: 140,
    errorRatePercent: 0.0,
    lastSyncTimestamp: new Date().toISOString(),
  },
  {
    serviceName: "State Open Data Exchange (ODX)",
    category: "API",
    status: "Operational",
    latencyMs: 38,
    errorRatePercent: 0.0,
    lastSyncTimestamp: new Date().toISOString(),
  },
];

export async function getNocSystemHealth(): Promise<NocSystemHealth[]> {
  return MOCK_NOC_HEALTH;
}
