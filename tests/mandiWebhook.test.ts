import { describe, it, expect } from "vitest";
import { verifyWebhookSignature, parseAndNormalizeMandiPayload } from "@/lib/services/mandiWebhookService";

describe("Phase 144 — Automated Mandi Price Webhook Connector", () => {
  it("validates provider signatures safely and rejects empty headers", () => {
    expect(verifyWebhookSignature("{}", undefined)).toBe(false);
    expect(verifyWebhookSignature("{}", "sig_agroguide_mandi_secret_2026")).toBe(true);
  });

  it("normalizes commodity price bulletins with default spreads", () => {
    const norm = parseAndNormalizeMandiPayload({
      market: "Coimbatore APMC",
      commodity: "Tomato",
      modalPrice: 2400,
    });

    expect(norm).not.toBeNull();
    expect(norm?.market).toBe("Coimbatore APMC");
    expect(norm?.modalPrice).toBe(2400);
    expect(norm?.minPrice).toBe(2160);
    expect(norm?.maxPrice).toBe(2640);
  });
});
