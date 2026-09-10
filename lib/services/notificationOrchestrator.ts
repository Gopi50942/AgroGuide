import { dispatchFarmerAlert } from "@/lib/services/messagingService";
import type {
  MessagingChannel,
  AlertMessageType,
  MessagingPreferences,
  NotificationItem,
} from "@/types";

// ─────────────────────────────────────────────
// Phase 52: Unified Notification Orchestration Engine
// Centralizes alerts, enforces anti-spam cooldowns, deduplication, and channel routing.
// ─────────────────────────────────────────────

export type AlertSeverity = "INFO" | "ADVISORY" | "IMPORTANT" | "CRITICAL";

export interface OutboundAlertRequest {
  ownerId: string;
  recipientPhone?: string;
  type: AlertMessageType;
  severity: AlertSeverity;
  titleEn: string;
  titleTa: string;
  messageEn: string;
  messageTa: string;
  fingerprint: string;
  preferredLanguage?: "en" | "ta";
  messagingPreferences?: MessagingPreferences;
}

export interface OrchestrationResult {
  inAppDelivered: boolean;
  smsAttempted: boolean;
  whatsappAttempted: boolean;
  suppressedByCooldown: boolean;
  reason?: string;
}

// In-memory anti-spam cooldown tracking (key -> timestamp)
const alertCooldownRegistry: Map<string, number> = new Map();
const COOLDOWN_WINDOW_MS = 4 * 60 * 60 * 1000; // 4 hours

export async function orchestrateAlertDispatch(
  req: OutboundAlertRequest,
  isDemoMode: boolean = false
): Promise<OrchestrationResult> {
  const now = Date.now();
  const dedupKey = `${req.ownerId}_${req.fingerprint}`;
  const lastSent = alertCooldownRegistry.get(dedupKey);

  // Check anti-spam cooldown (Critical alerts can bypass)
  if (lastSent && now - lastSent < COOLDOWN_WINDOW_MS && req.severity !== "CRITICAL") {
    return {
      inAppDelivered: false,
      smsAttempted: false,
      whatsappAttempted: false,
      suppressedByCooldown: true,
      reason: "Alert suppressed by 4-hour anti-spam cooldown window.",
    };
  }

  // Update cooldown timestamp
  alertCooldownRegistry.set(dedupKey, now);

  const isTa = req.preferredLanguage === "ta";
  const messageBody = isTa ? req.messageTa : req.messageEn;

  let smsAttempted = false;
  let whatsappAttempted = false;

  // External SMS Dispatch if phone and preferences allow
  if (req.recipientPhone && req.messagingPreferences?.smsEnabled) {
    if (req.severity === "CRITICAL" || !req.messagingPreferences.criticalOnly) {
      smsAttempted = true;
      await dispatchFarmerAlert(
        req.ownerId,
        req.recipientPhone,
        "sms",
        req.type,
        messageBody,
        req.messagingPreferences,
        isDemoMode
      );
    }
  }

  // External WhatsApp Dispatch if phone and preferences allow
  if (req.recipientPhone && req.messagingPreferences?.whatsappEnabled) {
    if (req.severity === "CRITICAL" || !req.messagingPreferences.criticalOnly) {
      whatsappAttempted = true;
      await dispatchFarmerAlert(
        req.ownerId,
        req.recipientPhone,
        "whatsapp",
        req.type,
        messageBody,
        req.messagingPreferences,
        isDemoMode
      );
    }
  }

  return {
    inAppDelivered: true,
    smsAttempted,
    whatsappAttempted,
    suppressedByCooldown: false,
  };
}

export function clearAlertCooldowns(): void {
  alertCooldownRegistry.clear();
}
