// ─────────────────────────────────────────────
// AI provider abstraction.
//
// UI/API-route code should depend only on this interface — never on a
// vendor SDK or vendor-specific request/response shape directly. This
// makes swapping providers (OpenRouter today; Gemini, Anthropic, or a
// self-hosted model tomorrow) a one-file change (see openrouter.ts +
// getAIProvider() below), not a UI/route rewrite.
// ─────────────────────────────────────────────

import { OpenRouterProvider } from "./openrouter";

export { AIProviderNotConfiguredError } from "./errors";

export interface AIChatMessage {
  role: "user" | "assistant";
  content: string;
}

export interface AIChatRequest {
  systemPrompt: string;
  history: AIChatMessage[];
  question: string;
  maxOutputTokens?: number;
}

export interface AIImageAnalysisRequest {
  systemPrompt: string;
  imageBase64: string;
  mimeType: string;
  instruction: string;
  maxOutputTokens?: number;
}

export interface AIProvider {
  /** Free-form text chat. Returns the assistant's reply text. */
  chat(req: AIChatRequest): Promise<string>;
  /** Multimodal (image + text) analysis. Returns raw text — callers that expect
   *  structured JSON (e.g. Crop Doctor) are responsible for parsing it themselves,
   *  since JSON-mode support varies by provider/model. */
  analyzeImage(req: AIImageAnalysisRequest): Promise<string>;
}

let cachedProvider: AIProvider | null = null;

/**
 * Returns the currently configured AI provider. Swapping providers in
 * the future means changing this function (and adding the new
 * provider file) — no other file needs to change.
 */
export function getAIProvider(): AIProvider {
  if (!cachedProvider) {
    cachedProvider = new OpenRouterProvider();
  }
  return cachedProvider;
}
