import { describe, it, expect } from "vitest";
import {
  dispatchFarmerAlert,
  SMS_TEMPLATES,
} from "@/lib/services/messagingService";

describe("Phase 33 — SMS / WhatsApp Advisory Gateway", () => {
  it("formats concise Tamil and English alert templates for SMS", () => {
    const tmplEn = SMS_TEMPLATES.severe_weather.en("Thanjavur", "Heavy Rainfall");
    const tmplTa = SMS_TEMPLATES.severe_weather.ta("தஞ்சாவூர்", "கனமழை");

    expect(tmplEn).toContain("Severe weather warning");
    expect(tmplTa).toContain("அக்ரோகைடு எச்சரிக்கை");
    expect(tmplTa.length).toBeLessThan(160); // Under GSM standard single-SMS length
  });

  it("respects farmer opt-out preferences safely without errors", async () => {
    const res = await dispatchFarmerAlert(
      "farmer_01",
      "+919876543210",
      "sms",
      "severe_weather",
      "Test alert",
      {
        smsEnabled: false,
        whatsappEnabled: true,
        criticalOnly: true,
        language: "ta",
      },
      true
    );

    expect(res.success).toBe(false);
    expect(res.status).toBe("disabled");
    expect(res.error).toContain("opted out");
  });
});
