import { NextRequest, NextResponse } from "next/server";
import { getRealMarketPrices } from "@/lib/market/marketService";
import { checkRateLimit, getClientIdentifier, logApiAccess } from "@/lib/api/rateLimiter";
import type { MarketApiResponse } from "@/lib/market/marketTypes";

// ─────────────────────────────────────────────
// GET /api/market?state=&district=&commodity=
// Hardened proxy for government Agmarknet dataset with rate limiting.
// ─────────────────────────────────────────────

export async function GET(req: NextRequest) {
  const start = Date.now();
  const clientId = getClientIdentifier(req);

  // Rate limit: 30 requests per minute per client
  const limit = checkRateLimit(`market:${clientId}`, { maxRequests: 30, windowMs: 60_000 });
  if (!limit.allowed) {
    logApiAccess("/api/market", 429, Date.now() - start, "Rate limit exceeded");
    return NextResponse.json(
      { records: [], isLive: false, error: "Market query limit reached. Please wait a moment." },
      { status: 429, headers: { "Retry-After": String(Math.ceil(limit.resetMs / 1000)) } }
    );
  }

  const { searchParams } = new URL(req.url);
  const state = searchParams.get("state")?.slice(0, 50) || undefined;
  const district = searchParams.get("district")?.slice(0, 50) || undefined;
  const commodity = searchParams.get("commodity")?.slice(0, 50) || undefined;

  try {
    const records = await getRealMarketPrices({ state, district, commodity, limit: 20 });
    const body: MarketApiResponse = { records, isLive: true };
    logApiAccess("/api/market", 200, Date.now() - start, `${records.length} records returned`);
    return NextResponse.json(body);
  } catch (error) {
    logApiAccess("/api/market", 200, Date.now() - start, "Fallback response served");
    const body: MarketApiResponse = {
      records: [],
      isLive: false,
      error: "Live mandi prices currently rate-limited. Please retry shortly.",
    };
    return NextResponse.json(body, { status: 200 });
  }
}
