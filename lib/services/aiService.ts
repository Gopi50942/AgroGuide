import type { ChatMessage, CropDoctorResult, FarmerProfile, Language, WeatherCurrent } from "@/types";

// ─────────────────────────────────────────────
// AI service — client wrapper around the server API routes
// in app/api/ai/*.
// ─────────────────────────────────────────────

export interface FarmerContext {
  profile: Pick<FarmerProfile, "name" | "district" | "state" | "soilType" | "irrigationType">;
  cropName?: string;
  cropStage?: string;
  weather?: Pick<WeatherCurrent, "temperatureC" | "humidity" | "rainProbability" | "condition">;
  soilReport?: {
    ph?: number;
    nitrogen?: number;
    phosphorus?: number;
    potassium?: number;
    ec?: number;
    organicCarbon?: number;
    sampleDate?: string;
    farmName?: string;
    summary?: string[];
  };
  diseaseReport?: {
    cropName?: string;
    scanDate?: string;
    possibleIssue?: string;
    severity?: string;
    recommendation?: string;
  };
}

export type AIResult<T> = {
  success: true;
  data: T;
} | {
  success: false;
  error: string;
  errorCode?: string;
  messageTa?: string;
};

export async function askAgroGuideAI(
  history: ChatMessage[],
  question: string,
  context: FarmerContext,
  language: Language = "en",
  signal?: AbortSignal
): Promise<AIResult<string>> {
  try {
    const res = await fetch("/api/ai/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ history, question, context, language }),
      signal,
    });
    const data = await res.json();
    if (!res.ok || !data.success) {
      return {
        success: false,
        error: data.error ?? "SERVICE_UNAVAILABLE",
        errorCode: data.errorCode ?? "AI_PROVIDER_UNAVAILABLE",
        messageTa: data.messageTa,
      };
    }
    return { success: true, data: data.answer as string };
  } catch (err: any) {
    if (err?.name === "AbortError") {
      return { success: false, error: "REQUEST_CANCELLED", errorCode: "CANCELLED" };
    }
    return { success: false, error: "NETWORK_ERROR", errorCode: "NETWORK_ERROR" };
  }
}

export async function analyzeCropImage(
  imageBase64: string,
  mimeType: string,
  context: FarmerContext,
  language: Language = "en",
  signal?: AbortSignal
): Promise<AIResult<CropDoctorResult>> {
  try {
    const res = await fetch("/api/ai/crop-doctor", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ imageBase64, mimeType, context, language }),
      signal,
    });
    const data = await res.json();
    if (!res.ok || !data.success) {
      return {
        success: false,
        error: data.error ?? "SERVICE_UNAVAILABLE",
        errorCode: data.errorCode ?? "AI_PROVIDER_UNAVAILABLE",
        messageTa: data.messageTa,
      };
    }
    return { success: true, data: data.result as CropDoctorResult };
  } catch (err: any) {
    if (err?.name === "AbortError") {
      return { success: false, error: "REQUEST_CANCELLED", errorCode: "CANCELLED" };
    }
    return { success: false, error: "NETWORK_ERROR", errorCode: "NETWORK_ERROR" };
  }
}

export const SUGGESTED_QUESTIONS = [
  "Should I irrigate today?",
  "What disease may affect my crop?",
  "What should I do this week?",
  "What government schemes may help me?",
  "Where should I sell my crop?",
  "How can I reduce farming costs?",
];
