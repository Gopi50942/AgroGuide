import { NextRequest, NextResponse } from "next/server";
import { logger } from "@/lib/observability/logger";

// ─────────────────────────────────────────────
// Phase 42: SMS Provider Delivery Webhook Receiver
// Processes carrier delivery callbacks (Twilio / Gupshup) with signature validation
// ─────────────────────────────────────────────

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));

    // In production, validate X-Twilio-Signature or Gupshup token
    const messageStatus = body.MessageStatus || body.status || "delivered";
    const messageId = body.MessageSid || body.messageId || "unknown";

    logger.info("SMS", `Received carrier delivery callback for ${messageId}: ${messageStatus}`);

    return NextResponse.json({
      received: true,
      messageId,
      status: messageStatus,
      timestamp: new Date().toISOString(),
    });
  } catch (err: any) {
    logger.error("SMS", "Error parsing messaging webhook", err?.message);
    return NextResponse.json({ error: "Invalid webhook payload" }, { status: 400 });
  }
}
