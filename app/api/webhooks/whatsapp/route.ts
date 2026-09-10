import { NextRequest, NextResponse } from "next/server";
import { processWhatsAppInboundCommand } from "@/lib/services/whatsappService";
import { logger } from "@/lib/observability/logger";

// ─────────────────────────────────────────────
// Phase 43: WhatsApp Cloud API Webhook Receiver & Read-Only Auto-Responder
// Verification endpoint (GET) + Inbound message processor (POST)
// ─────────────────────────────────────────────

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const mode = searchParams.get("hub.mode");
  const token = searchParams.get("hub.verify_token");
  const challenge = searchParams.get("hub.challenge");

  const expectedToken = process.env.WHATSAPP_VERIFY_TOKEN || "agroguide_wa_verify_demo_2026";

  if (mode === "subscribe" && token === expectedToken) {
    logger.info("WHATSAPP", "WhatsApp webhook verified successfully");
    return new NextResponse(challenge, { status: 200 });
  }

  return new NextResponse("Forbidden", { status: 403 });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));

    // Extract message body if present
    const entry = body?.entry?.[0];
    const changes = entry?.changes?.[0]?.value;
    const message = changes?.messages?.[0];

    if (message?.text?.body) {
      const incomingText = message.text.body;
      const fromNumber = message.from || "unknown";

      const commandResult = processWhatsAppInboundCommand(incomingText);
      logger.info(
        "WHATSAPP",
        `Processed inbound WhatsApp command '${commandResult.commandRecognized}' from ${fromNumber.replace(/.(?=.{4})/g, "*")}`
      );

      return NextResponse.json({
        success: true,
        command: commandResult.commandRecognized,
        replyEn: commandResult.replyTextEn,
        replyTa: commandResult.replyTextTa,
      });
    }

    return NextResponse.json({ status: "EVENT_RECEIVED" });
  } catch (err: any) {
    logger.error("WHATSAPP", "Failed to process WhatsApp webhook", err?.message);
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }
}
