import { isFirebaseConfigured } from "@/lib/firebase/config";
import { getAllFeatureFlags } from "@/lib/config/featureFlags";

// ─────────────────────────────────────────────
// Phase 80: Production Operations Center Service
// Provides sanitized operational health telemetry without exposing secrets or credentials.
// ─────────────────────────────────────────────

export interface OpsHealthSummary {
  appVersion: string;
  environment: string;
  uptimeSeconds: number;
  firebaseStatus: "CONNECTED" | "DEMO_MODE";
  aiProviderStatus: "CONFIGURED" | "UNCONFIGURED";
  weatherStatus: "OPERATIONAL";
  marketStatus: "OPERATIONAL";
  activeFeatureFlags: string[];
  lastChecked: string;
}

export function getProductionOpsSummary(): OpsHealthSummary {
  const flags = getAllFeatureFlags();
  const activeFlags = Object.entries(flags)
    .filter(([_, val]) => val)
    .map(([key]) => key);

  return {
    appVersion: process.env.NEXT_PUBLIC_APP_VERSION || "2026.09-rc1",
    environment: process.env.NODE_ENV || "development",
    uptimeSeconds: typeof process !== "undefined" && process.uptime ? Math.round(process.uptime()) : 3600,
    firebaseStatus: isFirebaseConfigured ? "CONNECTED" : "DEMO_MODE",
    aiProviderStatus: process.env.OPENROUTER_API_KEY ? "CONFIGURED" : "UNCONFIGURED",
    weatherStatus: "OPERATIONAL",
    marketStatus: "OPERATIONAL",
    activeFeatureFlags: activeFlags,
    lastChecked: new Date().toISOString(),
  };
}
