import type { ProgramOutcomeEvaluation } from "@/types";

// ─────────────────────────────────────────────
// Phase 175: Government Program Outcome Evaluation Service
// Evaluates agronomic scheme results using observed evidence without unsupported causal claims.
// ─────────────────────────────────────────────

export const OUTCOME_DISCLAIMER =
  "Observed statistical change in participant cohort. Does not establish absolute causal impact without controlled counterfactual randomized trials.";

const MOCK_OUTCOMES: ProgramOutcomeEvaluation[] = [
  {
    programId: "PRG-DRIP-2025",
    programName: "PMKSY Micro-Irrigation Drip Expansion Drive",
    enrolledParticipants: 420,
    completionRatePercent: 94.5,
    observedYieldChangePercent: 14.2,
    observedWaterSavingPercent: 38.0,
    evidenceCategory: "Observed change",
    disclaimer: OUTCOME_DISCLAIMER,
  },
  {
    programId: "PRG-SOIL-2025",
    programName: "Comprehensive Soil Health Card Drive",
    enrolledParticipants: 850,
    completionRatePercent: 98.0,
    observedYieldChangePercent: 8.5,
    observedWaterSavingPercent: 5.0,
    evidenceCategory: "Association",
    disclaimer: OUTCOME_DISCLAIMER,
  },
];

export async function listProgramOutcomes(): Promise<ProgramOutcomeEvaluation[]> {
  return MOCK_OUTCOMES;
}
