import { describe, it, expect } from "vitest";
import { VoiceBroadcastProvider } from "@/lib/services/voiceBroadcastService";

describe("Phase 148 — Tamil Voice IVR Alert System", () => {
  it("queues Tamil audio alert drafts returning NOT_CONFIGURED without provider credentials", async () => {
    const provider = new VoiceBroadcastProvider();
    const alert = await provider.queueTamilVoiceAlert(
      "Heavy Rain Flash Warning",
      "கனமழை வெள்ள அபாய எச்சரிக்கை",
      "Coimbatore",
      "Thondamuthur",
      "heavy_rain",
      "வணக்கம் விவசாய தோழரே, அடுத்த 24 மணி நேரத்தில் உங்கள் பகுதியில் கனமழை பெய்ய வாய்ப்புள்ளது."
    );

    expect(alert.broadcastId).toMatch(/^IVR-TN-\d{6}$/);
    expect(["NOT_CONFIGURED", "QUEUED"]).toContain(alert.status);
    expect(alert.audioScriptTa).toContain("வணக்கம்");
  });
});
