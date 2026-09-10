import { describe, it, expect } from "vitest";
import { synthesizeStateDecisionPriorities } from "@/lib/services/stateDecisionEngine";

describe("Phase 161 — State Agriculture Decision Intelligence Engine", () => {
  it("synthesizes deterministic review priorities with causal reasoning and recommended actions", async () => {
    const priorities = await synthesizeStateDecisionPriorities("Coimbatore");
    expect(priorities.length).toBeGreaterThanOrEqual(1);

    const highPrio = priorities.find((p) => p.priorityLevel === "HIGH PRIORITY");
    expect(highPrio).toBeDefined();
    expect(highPrio?.reasonEn).toContain("sowing scheduled");
    expect(highPrio?.recommendedActionEn).toContain("RAKE-SR-2026-8812");
    expect(highPrio?.freshness).toBe("LIVE");
  });
});
