import { logger } from "@/lib/observability/logger";
import type { AnalyticsEventName, AnalyticsEventPayload } from "@/types";

// ─────────────────────────────────────────────
// Phase 57: Privacy-Safe Product Analytics Dispatcher
// Collects anonymized aggregate telemetry without capturing private farmer contents.
// ─────────────────────────────────────────────

const SENSITIVE_PROPERTIES = [
  "prompt",
  "message",
  "text",
  "query",
  "image",
  "base64",
  "phone",
  "email",
  "amount",
  "income",
  "profit",
  "lat",
  "lng",
  "aadhaar",
];

export function sanitizeAnalyticsProperties(
  props?: Record<string, string | number | boolean>
): Record<string, string | number | boolean> {
  if (!props) return {};
  const clean: Record<string, string | number | boolean> = {};

  Object.entries(props).forEach(([key, val]) => {
    const kLower = key.toLowerCase();
    const isSensitive = SENSITIVE_PROPERTIES.some((s) => kLower.includes(s));
    if (!isSensitive) {
      clean[key] = val;
    }
  });

  return clean;
}

export function trackEvent(
  eventName: AnalyticsEventName,
  properties?: Record<string, string | number | boolean>
): AnalyticsEventPayload {
  const safeProps = sanitizeAnalyticsProperties(properties);
  const payload: AnalyticsEventPayload = {
    eventName,
    timestamp: new Date().toISOString(),
    properties: safeProps,
  };

  logger.info("ANALYTICS", `Tracked event '${eventName}'`, safeProps);
  return payload;
}
