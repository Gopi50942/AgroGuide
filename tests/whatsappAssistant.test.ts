import { describe, it, expect } from "vitest";
import { processWhatsAppInboundCommand } from "@/lib/services/whatsappService";

describe("Phase 43 — WhatsApp Farmer Assistant Gateway", () => {
  it("processes WEATHER command in English and Tamil without state mutation", () => {
    const resEn = processWhatsAppInboundCommand("weather in coimbatore", "Coimbatore");
    expect(resEn.commandRecognized).toBe("WEATHER");
    expect(resEn.replyTextEn).toContain("AgroGuide Weather Advisory");

    const resTa = processWhatsAppInboundCommand("வானிலை நிலவரம்", "தஞ்சாவூர்");
    expect(resTa.commandRecognized).toBe("WEATHER");
    expect(resTa.replyTextTa).toContain("அக்ரோகைடு வானிலை");
  });

  it("processes MARKET and MANDI price commands", () => {
    const res = processWhatsAppInboundCommand("mandi prices for tomato", "Salem");
    expect(res.commandRecognized).toBe("MARKET");
    expect(res.replyTextEn).toContain("Tomato:");
  });

  it("provides helpful default fallback on unrecognized query", () => {
    const res = processWhatsAppInboundCommand("xyz random prompt");
    expect(res.commandRecognized).toBe("HELP");
    expect(res.replyTextEn).toContain("WEATHER");
  });
});
