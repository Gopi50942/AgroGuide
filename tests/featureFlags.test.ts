import { describe, it, expect } from "vitest";
import {
  getFeatureFlag,
  getAllFeatureFlags,
  DEFAULT_FEATURE_FLAGS,
} from "@/lib/config/featureFlags";

describe("Phase 54 — Feature Flags & Remote Configuration", () => {
  it("provides safe default feature flag values", () => {
    const flags = getAllFeatureFlags();
    expect(flags.ENABLE_OFFICER_PORTAL).toBe(true);
    expect(flags.ENABLE_LIVESTOCK).toBe(true);
    expect(flags.ENABLE_SMS).toBe(false); // Unconfigured by default
    expect(flags.ENABLE_WHATSAPP).toBe(false);
  });

  it("reads individual feature flags reliably", () => {
    expect(getFeatureFlag("ENABLE_FPO")).toBe(true);
    expect(getFeatureFlag("ENABLE_ENAM")).toBe(false);
  });
});
