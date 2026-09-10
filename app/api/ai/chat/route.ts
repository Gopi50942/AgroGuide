import { NextRequest, NextResponse } from "next/server";
import { getAIProvider, type AIChatMessage } from "@/lib/ai/provider";
import {
  AIProviderNotConfiguredError,
  AIVisionModelNotConfiguredError,
  AIAuthError,
  AIRateLimitError,
  AIRequestError,
  AIProviderUnavailableError,
} from "@/lib/ai/errors";
import { chatSystemPrompt } from "@/lib/ai/prompts";
import { checkRateLimit, getClientIdentifier, logApiAccess } from "@/lib/api/rateLimiter";
import type { ChatMessage, Language } from "@/types";

// ─────────────────────────────────────────────
// POST /api/ai/chat
// Hardened server-only endpoint with rate limiting,
// input validation, and normalized error mapping.
// ─────────────────────────────────────────────

const MAX_QUESTION_LENGTH = 1500;
const MAX_HISTORY_ITEMS = 12;

export async function POST(req: NextRequest) {
  const start = Date.now();
  const clientId = getClientIdentifier(req);

  // Rate limit: 20 requests per minute per client
  const limit = checkRateLimit(`ai-chat:${clientId}`, { maxRequests: 20, windowMs: 60_000 });
  if (!limit.allowed) {
    logApiAccess("/api/ai/chat", 429, Date.now() - start, "Rate limit exceeded");
    return NextResponse.json(
      {
        success: false,
        errorCode: "RATE_LIMITED",
        error: "Too many AI questions. Please wait a moment.",
        messageTa: "அளவு வரம்பு எட்டப்பட்டது. சிறிது நேரம் காத்திருக்கவும்.",
      },
      {
        status: 429,
        headers: { "Retry-After": String(Math.ceil(limit.resetMs / 1000)) },
      }
    );
  }

  let body: {
    history?: ChatMessage[];
    question?: string;
    context?: unknown;
    language?: Language;
    toolCall?: { name: string; args: Record<string, any> };
  };
  try {
    body = await req.json();
  } catch {
    logApiAccess("/api/ai/chat", 400, Date.now() - start, "Invalid JSON body");
    return NextResponse.json(
      { success: false, errorCode: "INVALID_REQUEST", error: "Invalid JSON body" },
      { status: 400 }
    );
  }

  // Handle direct tool calling if toolCall is specified
  if (body.toolCall?.name) {
    const { executeAiReadOnlyTool } = await import("@/lib/ai/tools");
    const toolRes = await executeAiReadOnlyTool(body.toolCall.name, body.toolCall.args || {});
    logApiAccess("/api/ai/chat:tool", toolRes.success ? 200 : 400, Date.now() - start);
    return NextResponse.json(toolRes);
  }

  const { history, question, context, language } = body;
  if (!question || typeof question !== "string" || !question.trim()) {
    logApiAccess("/api/ai/chat", 400, Date.now() - start, "Missing question");
    return NextResponse.json(
      { success: false, errorCode: "INVALID_REQUEST", error: "Missing question parameter." },
      { status: 400 }
    );
  }

  if (question.length > MAX_QUESTION_LENGTH) {
    logApiAccess("/api/ai/chat", 400, Date.now() - start, "Question exceeds max length");
    return NextResponse.json(
      {
        success: false,
        errorCode: "QUESTION_TOO_LONG",
        error: `Question must be under ${MAX_QUESTION_LENGTH} characters.`,
      },
      { status: 400 }
    );
  }

  try {
    const provider = getAIProvider();
    const systemPrompt = chatSystemPrompt(language ?? "en", context);
    const boundedHistory = (history ?? []).slice(-MAX_HISTORY_ITEMS);

    const chatHistory: AIChatMessage[] = boundedHistory.map((m) => ({
      role: m.role === "assistant" ? "assistant" : "user",
      content: m.content,
    }));

    const answer = await provider.chat({
      systemPrompt,
      history: chatHistory,
      question,
      maxOutputTokens: 700,
    });

    logApiAccess("/api/ai/chat", 200, Date.now() - start);
    return NextResponse.json({ success: true, answer });
  } catch (error: any) {
    const duration = Date.now() - start;

    if (error instanceof AIProviderNotConfiguredError) {
      logApiAccess("/api/ai/chat", 501, duration, "Provider not configured");
      return NextResponse.json(
        {
          success: false,
          errorCode: "AI_NOT_CONFIGURED",
          error: "AI service is not configured.",
          messageTa: "AI சேவை கட்டமைக்கப்படவில்லை.",
        },
        { status: 200 }
      );
    }

    if (error instanceof AIAuthError) {
      logApiAccess("/api/ai/chat", 401, duration, "AI Auth failed");
      return NextResponse.json(
        {
          success: false,
          errorCode: "AI_AUTH_FAILED",
          error: "AI provider authorization failed. Please check your API key.",
          messageTa: "AI அங்கீகாரம் தோல்வியடைந்தது. API சாவியை சரிபார்க்கவும்.",
        },
        { status: 200 }
      );
    }

    if (error instanceof AIRateLimitError) {
      logApiAccess("/api/ai/chat", 429, duration, "AI Rate limited");
      return NextResponse.json(
        {
          success: false,
          errorCode: "AI_RATE_LIMITED",
          error: "AI provider rate limit reached. Please wait a moment.",
          messageTa: "AI சேவை வரம்பு எட்டப்பட்டது. சிறிது நேரம் கழித்து முயற்சிக்கவும்.",
        },
        { status: 429 }
      );
    }

    logApiAccess("/api/ai/chat", 502, duration, "AI Provider failure");
    return NextResponse.json(
      {
        success: false,
        errorCode: "AI_PROVIDER_UNAVAILABLE",
        error: "AI provider is temporarily unavailable.",
        messageTa: "AI சேவை தற்காலிகமாக கிடைக்கவில்லை. மீண்டும் முயற்சிக்கவும்.",
      },
      { status: 200 }
    );
  }
}
