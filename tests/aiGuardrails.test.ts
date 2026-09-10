import { describe, it, expect } from "vitest";
import { enforceAiGuardrails, AI_MAX_INPUT_CHARS, AI_MAX_HISTORY_MESSAGES } from "@/lib/config/aiGuardrails";

describe("Phase 94 — AI Cost & Token Usage Guardrails", () => {
  it("bounds prompt length to protect token expenditure", () => {
    const longPrompt = "a".repeat(AI_MAX_INPUT_CHARS + 500);
    const result = enforceAiGuardrails(longPrompt, []);
    expect(result.sanitizedPrompt.length).toBe(AI_MAX_INPUT_CHARS);
    expect(result.isTruncated).toBe(true);
  });

  it("truncates message history to the most recent context window messages", () => {
    const history = Array.from({ length: 25 }, (_, i) => ({
      role: i % 2 === 0 ? "user" : "assistant",
      content: `Message ${i}`,
    }));

    const result = enforceAiGuardrails("Current query", history);
    expect(result.sanitizedHistory.length).toBe(AI_MAX_HISTORY_MESSAGES);
    expect(result.sanitizedHistory[AI_MAX_HISTORY_MESSAGES - 1].content).toBe("Message 24");
  });
});
