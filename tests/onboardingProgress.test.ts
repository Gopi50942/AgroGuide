import { describe, it, expect } from "vitest";
import { evaluateOnboardingProgress } from "@/lib/services/onboardingProgressService";

describe("Phase 64 — Farmer Guided Onboarding Progress", () => {
  it("tracks completed checklist steps and suggests next actionable task", () => {
    const progress = evaluateOnboardingProgress({
      profile: { name: "R. Kumar", district: "Madurai", preferredLanguage: "ta" },
      farms: [{ id: "f1", ownerId: "u1", name: "Farm", location: "Madurai", areaAcres: 2, soilType: "Clay", irrigationType: "Well" }],
      crops: [],
      soilReports: [],
    });

    expect(progress.completedCount).toBeGreaterThanOrEqual(3);
    expect(progress.nextSuggestedStep?.id).toBe("add_crop");
    expect(progress.completionPercent).toBeGreaterThan(40);
  });
});
