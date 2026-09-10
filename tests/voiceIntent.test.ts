import { describe, it, expect } from "vitest";
import { parseVoiceNavigationIntent } from "@/lib/utils/voiceIntentRouter";

describe("Voice Intent Router for Safe Navigation", () => {
  it("correctly identifies Tamil navigation voice intents", () => {
    const r1 = parseVoiceNavigationIntent("இன்றைய வானிலை காட்டு");
    expect(r1.matched).toBe(true);
    expect(r1.targetRoute).toBe("/weather");

    const r2 = parseVoiceNavigationIntent("சந்தை விலை என்ன");
    expect(r2.matched).toBe(true);
    expect(r2.targetRoute).toBe("/market");

    const r3 = parseVoiceNavigationIntent("பயிர் மருத்துவர் திற");
    expect(r3.matched).toBe(true);
    expect(r3.targetRoute).toBe("/crop-doctor");

    const r4 = parseVoiceNavigationIntent("பாசன வழிகாட்டி");
    expect(r4.matched).toBe(true);
    expect(r4.targetRoute).toBe("/irrigation");
  });

  it("correctly identifies English navigation voice intents", () => {
    const r1 = parseVoiceNavigationIntent("show weather forecast");
    expect(r1.matched).toBe(true);
    expect(r1.targetRoute).toBe("/weather");

    const r2 = parseVoiceNavigationIntent("open mandi market price");
    expect(r2.matched).toBe(true);
    expect(r2.targetRoute).toBe("/market");

    const r3 = parseVoiceNavigationIntent("check my farm crops");
    expect(r3.matched).toBe(true);
    expect(r3.targetRoute).toBe("/farm");
  });

  it("safely ignores non-navigation general queries", () => {
    const r = parseVoiceNavigationIntent("how to prepare vermicompost for tomato");
    expect(r.matched).toBe(false);
  });
});
