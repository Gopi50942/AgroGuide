import type { VoiceIvrBroadcast } from "@/types";

// ─────────────────────────────────────────────
// Phase 148: Tamil Voice IVR Alert System Service
// Voice alert dispatcher for low-literacy farmers. Provider abstraction.
// ─────────────────────────────────────────────

export class VoiceBroadcastProvider {
  private isConfigured: boolean;

  constructor() {
    this.isConfigured = Boolean(process.env.EXOTEL_API_KEY || process.env.TWILIO_VOICE_TOKEN);
  }

  async queueTamilVoiceAlert(
    titleEn: string,
    titleTa: string,
    targetDistrict: string,
    targetBlock: string,
    alertCategory: VoiceIvrBroadcast["alertCategory"],
    audioScriptTa: string
  ): Promise<VoiceIvrBroadcast> {
    const broadcastId = `IVR-TN-${Date.now().toString().slice(-6)}`;

    return {
      broadcastId,
      titleEn,
      titleTa,
      targetDistrict,
      targetBlock,
      alertCategory,
      audioScriptTa,
      status: this.isConfigured ? "QUEUED" : "NOT_CONFIGURED",
      createdAt: new Date().toISOString(),
    };
  }
}

export const voiceBroadcastProvider = new VoiceBroadcastProvider();
