// ─────────────────────────────────────────────
// Phase 94: AI Cost, Token & Usage Guardrails
// Prevents accidental budget drain or context overflow on OpenRouter API calls.
// ─────────────────────────────────────────────

export const AI_MAX_INPUT_CHARS = 2000;
export const AI_MAX_HISTORY_MESSAGES = 10;
export const AI_MAX_IMAGE_BYTES = 4 * 1024 * 1024; // 4 MB

export interface AiSanitizationResult {
  sanitizedPrompt: string;
  isTruncated: boolean;
  sanitizedHistory: { role: string; content: string }[];
}

export function enforceAiGuardrails(
  prompt: string,
  history: { role: string; content: string }[] = []
): AiSanitizationResult {
  let sanitizedPrompt = prompt.trim();
  let isTruncated = false;

  if (sanitizedPrompt.length > AI_MAX_INPUT_CHARS) {
    sanitizedPrompt = sanitizedPrompt.slice(0, AI_MAX_INPUT_CHARS);
    isTruncated = true;
  }

  // Keep only the most recent N messages to bound context window tokens
  const sanitizedHistory = history.slice(-AI_MAX_HISTORY_MESSAGES);

  return {
    sanitizedPrompt,
    isTruncated,
    sanitizedHistory,
  };
}
