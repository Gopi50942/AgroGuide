import { describe, it, expect, beforeEach } from "vitest";
import {
  orchestrateAlertDispatch,
  clearAlertCooldowns,
} from "@/lib/services/notificationOrchestrator";

describe("Phase 52 — Unified Notification Orchestration", () => {
  beforeEach(() => {
    clearAlertCooldowns();
  });

  it("delivers alert and suppresses rapid duplicate within anti-spam window", async () => {
    const alertReq = {
      ownerId: "farmer_1",
      recipientPhone: "+919876543210",
      type: "task_reminder" as const,
      severity: "ADVISORY" as const,
      titleEn: "Fertigation Due",
      titleTa: "உரமிடுதல் பணி",
      messageEn: "DAP Fertigation due today",
      messageTa: "இன்று உரமிடவும்",
      fingerprint: "task_123_fertigation",
      messagingPreferences: {
        smsEnabled: true,
        whatsappEnabled: false,
        criticalOnly: false,
        language: "ta" as const,
      },
    };

    // First dispatch
    const first = await orchestrateAlertDispatch(alertReq, true);
    expect(first.inAppDelivered).toBe(true);
    expect(first.suppressedByCooldown).toBe(false);

    // Immediate duplicate dispatch
    const second = await orchestrateAlertDispatch(alertReq, true);
    expect(second.suppressedByCooldown).toBe(true);
    expect(second.inAppDelivered).toBe(false);
  });

  it("permits CRITICAL weather emergencies to bypass cooldown", async () => {
    const criticalReq = {
      ownerId: "farmer_1",
      recipientPhone: "+919876543210",
      type: "severe_weather" as const,
      severity: "CRITICAL" as const,
      titleEn: "Cyclone Warning",
      titleTa: "புயல் எச்சரிக்கை",
      messageEn: "Severe cyclonic storm warning in delta district",
      messageTa: "டெல்டா பகுதியில் தீவிர புயல் எச்சரிக்கை",
      fingerprint: "cyclone_alert_01",
    };

    const first = await orchestrateAlertDispatch(criticalReq, true);
    expect(first.inAppDelivered).toBe(true);

    const second = await orchestrateAlertDispatch(criticalReq, true);
    expect(second.suppressedByCooldown).toBe(false); // Bypassed
    expect(second.inAppDelivered).toBe(true);
  });
});
