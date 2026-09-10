import { describe, it, expect } from "vitest";
import { GET as getHealth } from "@/app/api/health/route";
import { GET as getMarket } from "@/app/api/market/route";
import { POST as postWhatsApp } from "@/app/api/webhooks/whatsapp/route";
import { POST as postMessaging } from "@/app/api/webhooks/messaging/route";

describe("Phase 89 — Production API Runtime Smoke Suite", () => {
  it("/api/health returns valid JSON with operational status and version", async () => {
    const res = await getHealth();
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(["ok", "degraded"]).toContain(data.status);
    expect(data.version).toBeDefined();
  });

  it("/api/market returns localized mandi data without crashing", async () => {
    const req = new Request("http://localhost:3000/api/market?district=Coimbatore&commodity=Tomato");
    const res = await getMarket(req as any);
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(Array.isArray(data.records) || data.records !== undefined).toBe(true);
  }, 15000);

  it("/api/webhooks/whatsapp auto-responds in Tamil/English without throwing", async () => {
    const req = new Request("http://localhost:3000/api/webhooks/whatsapp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        From: "+919876543210",
        Body: "விலை தக்காளி",
      }),
    });
    const res = await postWhatsApp(req as any);
    expect(res.status).toBe(200);
    const text = await res.text();
    expect(text).toContain("EVENT_RECEIVED");
  });

  it("/api/webhooks/messaging receives delivery status reports cleanly", async () => {
    const req = new Request("http://localhost:3000/api/webhooks/messaging", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        MessageSid: "SM_test_123",
        MessageStatus: "delivered",
        To: "+919876543210",
      }),
    });
    const res = await postMessaging(req as any);
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.received).toBe(true);
  });
});
