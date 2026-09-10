import type { AIProvider, AIChatRequest, AIImageAnalysisRequest } from "./provider";
import {
  AIProviderNotConfiguredError,
  AIVisionModelNotConfiguredError,
  AIAuthError,
  AIRateLimitError,
  AIRequestError,
  AIProviderUnavailableError,
} from "./errors";

// ─────────────────────────────────────────────
// OpenRouter implementation of AIProvider
// Supports dual-mode: Chat (Text) and Crop Doctor (Vision)
// ─────────────────────────────────────────────

const OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions";

interface OpenRouterMessageContent {
  type: "text" | "image_url";
  text?: string;
  image_url?: { url: string };
}

interface OpenRouterMessage {
  role: "system" | "user" | "assistant";
  content: string | OpenRouterMessageContent[];
}

function isOpenRouterKeyValid(key?: string): boolean {
  return Boolean(
    key &&
    !key.includes("YOUR_") &&
    !key.includes("Example") &&
    !key.includes("placeholder") &&
    key.length > 10
  );
}

// Default reliable production models
const DEFAULT_TEXT_MODEL = "google/gemini-2.5-flash";
const DEFAULT_VISION_MODEL = "google/gemini-2.5-flash";

export class OpenRouterProvider implements AIProvider {
  private getChatConfig() {
    const apiKey = process.env.OPENROUTER_API_KEY;
    if (!isOpenRouterKeyValid(apiKey)) {
      throw new AIProviderNotConfiguredError(
        "OPENROUTER_API_KEY is not configured or contains placeholder in server environment."
      );
    }
    const envModel = process.env.OPENROUTER_MODEL;
    const model = (envModel && !envModel.includes("YOUR_")) ? envModel : DEFAULT_TEXT_MODEL;
    return { apiKey: apiKey as string, model };
  }

  private getVisionConfig() {
    const apiKey = process.env.OPENROUTER_API_KEY;
    if (!isOpenRouterKeyValid(apiKey)) {
      throw new AIProviderNotConfiguredError(
        "OPENROUTER_API_KEY is not configured or contains placeholder in server environment."
      );
    }
    const envVisionModel = process.env.OPENROUTER_VISION_MODEL;
    const envModel = process.env.OPENROUTER_MODEL;
    
    // Choose vision model, avoiding text-only aliases like openrouter/free
    let model = DEFAULT_VISION_MODEL;
    if (envVisionModel && !envVisionModel.includes("YOUR_")) {
      model = envVisionModel;
    } else if (envModel && !envModel.includes("YOUR_") && envModel !== "openrouter/free") {
      model = envModel;
    }

    return { apiKey: apiKey as string, model };
  }

  private async callWithModel(
    model: string,
    apiKey: string,
    messages: OpenRouterMessage[],
    maxOutputTokens = 700
  ): Promise<string> {
    let res: Response;
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 25000); // 25s timeout

      res = await fetch(OPENROUTER_URL, {
        method: "POST",
        signal: controller.signal,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
          ...(process.env.NEXT_PUBLIC_APP_URL ? { "HTTP-Referer": process.env.NEXT_PUBLIC_APP_URL } : {}),
          "X-Title": "AgroGuide",
        },
        body: JSON.stringify({
          model,
          messages,
          max_tokens: maxOutputTokens,
        }),
      });
      clearTimeout(timeoutId);
    } catch (fetchErr: any) {
      if (fetchErr?.name === "AbortError") {
        throw new AIProviderUnavailableError("AI provider request timed out.");
      }
      throw new AIProviderUnavailableError(`Network connection to AI provider failed: ${fetchErr?.message || ""}`);
    }

    if (!res.ok) {
      if (res.status === 401 || res.status === 403) {
        throw new AIAuthError("AI provider authorization failed. Please check your API key.");
      }
      if (res.status === 429) {
        throw new AIRateLimitError("AI provider rate limit reached. Please wait a moment.");
      }
      if (res.status === 400) {
        throw new AIRequestError("Invalid request sent to AI model.");
      }
      const errText = await res.text().catch(() => "");
      throw new AIProviderUnavailableError(`AI provider returned status ${res.status}: ${errText}`);
    }

    const data = await res.json().catch(() => null);
    const text: string = data?.choices?.[0]?.message?.content ?? "";
    if (!text.trim()) {
      throw new AIProviderUnavailableError("AI provider returned an empty response.");
    }
    return text;
  }

  async chat({ systemPrompt, history, question, maxOutputTokens }: AIChatRequest): Promise<string> {
    const { apiKey, model } = this.getChatConfig();
    const messages: OpenRouterMessage[] = [
      { role: "system", content: systemPrompt },
      ...history.map((m) => ({ role: m.role, content: m.content }) as OpenRouterMessage),
      { role: "user", content: question },
    ];
    return this.callWithModel(model, apiKey, messages, maxOutputTokens ?? 700);
  }

  async analyzeImage({
    systemPrompt,
    imageBase64,
    mimeType,
    instruction,
    maxOutputTokens,
  }: AIImageAnalysisRequest): Promise<string> {
    const { apiKey, model } = this.getVisionConfig();
    const messages: OpenRouterMessage[] = [
      { role: "system", content: systemPrompt },
      {
        role: "user",
        content: [
          { type: "text", text: instruction },
          { type: "image_url", image_url: { url: `data:${mimeType};base64,${imageBase64}` } },
        ],
      },
    ];
    return this.callWithModel(model, apiKey, messages, maxOutputTokens ?? 800);
  }
}
