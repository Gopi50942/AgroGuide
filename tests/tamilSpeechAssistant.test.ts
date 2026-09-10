import { describe, it, expect } from "vitest";
import { processTamilSpeechQuery } from "@/lib/services/tamilSpeechAssistantService";

describe("Phase 167 — Tamil Speech-to-Speech Farmer Assistant", () => {
  it("processes Tamil voice queries for weather, market prices, and irrigation", () => {
    const weatherRes = processTamilSpeechQuery("இன்று மழை வருமா?");
    expect(weatherRes.intent).toBe("weather");
    expect(weatherRes.responseTa).toContain("மழைக்கு வாய்ப்புள்ளது");

    const priceRes = processTamilSpeechQuery("தக்காளி விலை என்ன?");
    expect(priceRes.intent).toBe("market_price");
    expect(priceRes.responseTa).toContain("ரூபாய்க்கு விற்கப்படுகிறது");

    const irrRes = processTamilSpeechQuery("அடுத்த பாசனம் எப்போது?");
    expect(irrRes.intent).toBe("irrigation");
    expect(irrRes.responseTa).toContain("பாசனம்");
  });
});
