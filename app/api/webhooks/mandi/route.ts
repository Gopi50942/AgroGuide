import { NextResponse } from "next/server";
import { verifyWebhookSignature, parseAndNormalizeMandiPayload } from "@/lib/services/mandiWebhookService";

export async function POST(req: Request) {
  try {
    const rawBody = await req.text();
    const signature = req.headers.get("x-mandi-signature") || req.headers.get("authorization");

    if (!verifyWebhookSignature(rawBody, signature || undefined)) {
      return NextResponse.json({ error: "Invalid webhook signature or unauthorized source." }, { status: 401 });
    }

    const json = JSON.parse(rawBody);
    const normalized = parseAndNormalizeMandiPayload(json);

    if (!normalized) {
      return NextResponse.json({ error: "Invalid payload schema." }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      message: "Mandi price bulletin ingested and cached successfully.",
      data: normalized,
    });
  } catch (err: any) {
    return NextResponse.json({ error: "Internal webhook processing error.", details: err.message }, { status: 500 });
  }
}
