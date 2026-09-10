import type { FeatureFlagKey, FeatureFlagsState } from "@/types";

// ─────────────────────────────────────────────
// Phase 54: Feature Flags & Remote Configuration System
// Provides runtime switches for modular deployment and experimental feature toggles.
// ─────────────────────────────────────────────

export const DEFAULT_FEATURE_FLAGS: FeatureFlagsState = {
  ENABLE_SMS: false, // Default false until carrier credentials provisioned
  ENABLE_WHATSAPP: false, // Default false until Meta Cloud credentials provisioned
  ENABLE_ENAM: false, // Integration ready / advisory fallback
  ENABLE_AGRISTACK: false, // Sandbox ready
  ENABLE_OFFICER_PORTAL: true, // Active consent-gated portal
  ENABLE_LIVESTOCK: true, // Mixed-farming ledger active
  ENABLE_FPO: true, // Produce aggregation active
  ENABLE_SOLAR_ESTIMATOR: true, // PM-KUSUM estimator active
  ENABLE_INSURANCE_EVIDENCE: true, // Loss dossier active
  ENABLE_BETA_LANGUAGES: true, // Regional beta language packs active
  ENABLE_PILOT_MODE: true, // Field pilot participant mode active
  GOVERNMENT_PILOT_MODE: true, // Government platform pilot active
};

export function getFeatureFlag(key: FeatureFlagKey): boolean {
  if (typeof process !== "undefined" && process.env) {
    const envKey = `NEXT_PUBLIC_FF_${key}`;
    const envVal = process.env[envKey];
    if (envVal === "true" || envVal === "1") return true;
    if (envVal === "false" || envVal === "0") return false;
  }
  return DEFAULT_FEATURE_FLAGS[key] ?? false;
}

export function getAllFeatureFlags(): FeatureFlagsState {
  const flags: FeatureFlagsState = { ...DEFAULT_FEATURE_FLAGS };
  (Object.keys(DEFAULT_FEATURE_FLAGS) as FeatureFlagKey[]).forEach((k) => {
    flags[k] = getFeatureFlag(k);
  });
  return flags;
}
