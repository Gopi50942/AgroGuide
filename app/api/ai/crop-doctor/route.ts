import { NextRequest, NextResponse } from "next/server";
import { getAIProvider } from "@/lib/ai/provider";
import {
  AIProviderNotConfiguredError,
  AIVisionModelNotConfiguredError,
  AIAuthError,
  AIRateLimitError,
  AIRequestError,
  AIProviderUnavailableError,
} from "@/lib/ai/errors";
import { cropDoctorSystemPrompt } from "@/lib/ai/prompts";
import { checkRateLimit, getClientIdentifier, logApiAccess } from "@/lib/api/rateLimiter";
import type { Language } from "@/types";

// ─────────────────────────────────────────────
// POST /api/ai/crop-doctor
// Analyzes an uploaded crop image with rate limiting,
// strict payload verification, and normalized error mapping.
// ─────────────────────────────────────────────

const MAX_IMAGE_BASE64_CHARS = 8_000_000; // ~6MB decoded
const ALLOWED_MIME_TYPES = ["image/jpeg", "image/png", "image/webp", "image/heic"];

export async function POST(req: NextRequest) {
  const start = Date.now();
  const clientId = getClientIdentifier(req);

  // Rate limit: 12 vision requests per minute per client
  const limit = checkRateLimit(`crop-doctor:${clientId}`, { maxRequests: 12, windowMs: 60_000 });
  if (!limit.allowed) {
    logApiAccess("/api/ai/crop-doctor", 429, Date.now() - start, "Rate limit exceeded");
    return NextResponse.json(
      {
        success: false,
        errorCode: "RATE_LIMITED",
        error: "Too many crop scans. Please wait a minute.",
        messageTa: "அதிக பயிர் ஸ்கேன்கள். ஒரு நிமிடம் காத்திருக்கவும்.",
      },
      {
        status: 429,
        headers: { "Retry-After": String(Math.ceil(limit.resetMs / 1000)) },
      }
    );
  }

  let body: { imageBase64?: string; mimeType?: string; context: unknown; language?: Language };
  try {
    body = await req.json();
  } catch {
    logApiAccess("/api/ai/crop-doctor", 400, Date.now() - start, "Invalid JSON body");
    return NextResponse.json(
      { success: false, errorCode: "INVALID_REQUEST", error: "Invalid JSON body" },
      { status: 400 }
    );
  }

  const { imageBase64, mimeType, context, language } = body;

  if (!imageBase64 || typeof imageBase64 !== "string") {
    logApiAccess("/api/ai/crop-doctor", 400, Date.now() - start, "Missing image payload");
    return NextResponse.json(
      { success: false, errorCode: "NO_IMAGE", error: "Missing image payload." },
      { status: 400 }
    );
  }
  if (imageBase64.length > MAX_IMAGE_BASE64_CHARS) {
    logApiAccess("/api/ai/crop-doctor", 413, Date.now() - start, "Image exceeds maximum size");
    return NextResponse.json(
      { success: false, errorCode: "IMAGE_TOO_LARGE", error: "Image size exceeds limit." },
      { status: 413 }
    );
  }
  const safeMimeType = ALLOWED_MIME_TYPES.includes(mimeType ?? "") ? (mimeType as string) : "image/jpeg";

  try {
    const provider = getAIProvider();
    const systemPrompt = cropDoctorSystemPrompt(language ?? "en", context);

    const raw = await provider.analyzeImage({
      systemPrompt,
      imageBase64,
      mimeType: safeMimeType,
      instruction: "Analyze this crop image and return diagnosis JSON matching the schema.",
      maxOutputTokens: 800,
    });

    const cleaned = raw.replace(/```json|```/g, "").trim();

    let parsed: unknown;
    try {
      parsed = JSON.parse(cleaned);
    } catch {
      logApiAccess("/api/ai/crop-doctor", 502, Date.now() - start, "Model returned non-JSON");
      return NextResponse.json(
        {
          success: false,
          errorCode: "MALFORMED_RESPONSE",
          error: "Model returned invalid JSON diagnosis.",
          messageTa: "மாதிரி தவறான முடிவை அளித்தது. மீண்டும் முயற்சிக்கவும்.",
        },
        { status: 200 }
      );
    }

    logApiAccess("/api/ai/crop-doctor", 200, Date.now() - start);
    return NextResponse.json({ success: true, result: { ...(parsed as object), isDemo: false } });
  } catch (error: any) {
    const duration = Date.now() - start;

    if (error instanceof AIProviderNotConfiguredError) {
      logApiAccess("/api/ai/crop-doctor", 501, duration, "Provider not configured");
      return NextResponse.json(
        {
          success: false,
          errorCode: "AI_NOT_CONFIGURED",
          error: "AI vision service is not configured.",
          messageTa: "AI பார்வை சேவை கட்டமைக்கப்படவில்லை.",
        },
        { status: 200 }
      );
    }

    if (error instanceof AIVisionModelNotConfiguredError) {
      logApiAccess("/api/ai/crop-doctor", 501, duration, "Vision model not configured");
      return NextResponse.json(
        {
          success: false,
          errorCode: "VISION_MODEL_NOT_CONFIGURED",
          error: "Vision model is not configured for image analysis.",
          messageTa: "பயிர் ஸ்கேனிங்கிற்கான பார்வை மாதிரி கட்டமைக்கப்படவில்லை.",
        },
        { status: 200 }
      );
    }

    if (error instanceof AIAuthError) {
      logApiAccess("/api/ai/crop-doctor", 401, duration, "AI Auth failed");
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
      logApiAccess("/api/ai/crop-doctor", 429, duration, "AI Rate limited");
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

    logApiAccess("/api/ai/crop-doctor", 502, duration, "Crop doctor upstream failure");
    return NextResponse.json(
      {
        success: false,
        errorCode: "AI_PROVIDER_UNAVAILABLE",
        error: "Crop Doctor vision service is temporarily unavailable.",
        messageTa: "பயிர் மருத்துவர் சேவை தற்காலிகமாக கிடைக்கவில்லை. மீண்டும் முயற்சிக்கவும்.",
      },
      { status: 200 }
    );
  }
}
