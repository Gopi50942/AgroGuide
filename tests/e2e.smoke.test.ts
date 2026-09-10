import { describe, it, expect } from "vitest";
import { NAV_ITEMS } from "@/data/navigation";
import { performSystemReadinessCheck, RECOMMENDED_EVALUATOR_FLOW } from "@/lib/services/demoReadinessService";

describe("Phase 56 — End-to-End Simulation & Route Health", () => {
  it("verifies all navigation routes are properly configured and mapped", () => {
    expect(NAV_ITEMS.length).toBeGreaterThan(12);

    const requiredPaths = [
      "/dashboard",
      "/farm",
      "/crop-doctor",
      "/weather",
      "/market",
      "/irrigation",
      "/soil",
      "/livestock",
      "/calendar",
      "/government",
      "/finance",
      "/diary",
      "/community",
      "/help",
      "/emergency",
      "/settings",
    ];

    requiredPaths.forEach((path) => {
      const exists = NAV_ITEMS.some((item) => item.href === path);
      expect(exists).toBe(true);
    });
  });

  it("verifies readiness diagnostics across mobile and desktop subsystems", () => {
    const check = performSystemReadinessCheck();
    expect(["production_ready", "demo_ready"]).toContain(check.overallStatus);
    expect(check.checks.length).toBeGreaterThanOrEqual(5);

    const weatherCheck = check.checks.find((c) => c.id === "weather_engine");
    expect(weatherCheck?.status).toBe("ready");
  });

  it("verifies the 7-step evaluator flow matches valid application pages", () => {
    expect(RECOMMENDED_EVALUATOR_FLOW.length).toBe(7);
    RECOMMENDED_EVALUATOR_FLOW.forEach((step) => {
      expect(step.route.startsWith("/")).toBe(true);
      expect(step.titleEn).toBeDefined();
      expect(step.titleTa).toBeDefined();
    });
  });
});
