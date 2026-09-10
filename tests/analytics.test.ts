import { describe, it, expect } from "vitest";
import {
  sanitizeAnalyticsProperties,
  trackEvent,
} from "@/lib/observability/analytics";

describe("Phase 57 — Privacy-Safe Product Analytics", () => {
  it("strips sensitive PII, prompts, photos, and financial numbers from events", () => {
    const rawProps = {
      feature: "crop_doctor",
      cropType: "Tomato",
      promptText: "How do I treat this fungus?",
      imageBase64: "data:image/jpeg;base64,...",
      farmerPhone: "9876543210",
      incomeRs: 50000,
      userLat: 11.0168,
    };

    const clean = sanitizeAnalyticsProperties(rawProps);
    expect(clean.feature).toBe("crop_doctor");
    expect(clean.cropType).toBe("Tomato");
    expect(clean.promptText).toBeUndefined();
    expect(clean.imageBase64).toBeUndefined();
    expect(clean.farmerPhone).toBeUndefined();
    expect(clean.incomeRs).toBeUndefined();
    expect(clean.userLat).toBeUndefined();
  });

  it("records structured telemetry event successfully", () => {
    const event = trackEvent("weather_checked", { district: "Coimbatore" });
    expect(event.eventName).toBe("weather_checked");
    expect(event.timestamp).toBeDefined();
    expect(event.properties?.district).toBe("Coimbatore");
  });
});
