import { describe, it, expect } from "vitest";
import { listProgramOutcomes, OUTCOME_DISCLAIMER } from "@/lib/services/programOutcomeService";

describe("Phase 175 — Government Program Outcome Evaluation", () => {
  it("evaluates program outcomes using observed evidence categories without causal leaps", async () => {
    const outcomes = await listProgramOutcomes();
    expect(outcomes.length).toBeGreaterThanOrEqual(1);
    expect(outcomes[0].enrolledParticipants).toBeGreaterThan(0);
    expect(["Observed change", "Association", "Insufficient evidence"]).toContain(outcomes[0].evidenceCategory);
    expect(outcomes[0].disclaimer).toBe(OUTCOME_DISCLAIMER);
  });
});
