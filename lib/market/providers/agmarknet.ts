import type { MarketQuery, NormalizedMarketRecord } from "../marketTypes";

// ─────────────────────────────────────────────
// Real market price provider — Government of India's official mandi
// price dataset ("Variety-wise Daily Market Prices Data of Commodity",
// generated from the AGMARKNET portal), served through the data.gov.in
// Open Government Data API.
//
//   Resource:   9ef84268-d588-465a-a308-a864a43d0070
//   Publisher:  Ministry of Agriculture & Farmers Welfare,
//               Directorate of Marketing and Inspection (DMI)
//   Docs:       https://www.data.gov.in/resource/variety-wise-daily-market-prices-data-commodity
//
// Auth: query-param api-key. Set MARKET_API_KEY in .env.local with a
// free key from https://data.gov.in (Sign in → My Account → Generate
// API Key). If MARKET_API_KEY is not set, this falls back to the
// public sample key data.gov.in itself publishes for testing on its
// API console — it works, but is rate-limited to ~10 records, so it's
// a development convenience only, not something to rely on in
// production.
// ─────────────────────────────────────────────

const RESOURCE_ID = "9ef84268-d588-465a-a308-a864a43d0070";
const BASE_URL = `https://api.data.gov.in/resource/${RESOURCE_ID}`;
const PUBLIC_SAMPLE_KEY = "579b464db66ec23bdd000001cdd3946e44ce4aad7209ff7b23ac571b";
const SOURCE_LABEL = "Agmarknet / data.gov.in (Ministry of Agriculture & Farmers Welfare)";

// The live API is inconsistent about whether JSON field names are
// lowercase snake_case ("min_price") or Title_Case ("Min_Price") —
// read defensively across both.
function field(record: Record<string, unknown>, ...names: string[]): string | undefined {
  for (const name of names) {
    const value = record[name];
    if (typeof value === "string" && value.trim()) return value.trim();
  }
  return undefined;
}

function numberField(record: Record<string, unknown>, ...names: string[]): number | undefined {
  const raw = field(record, ...names);
  if (raw === undefined) return undefined;
  const n = Number(raw.replace(/,/g, ""));
  return Number.isFinite(n) ? n : undefined;
}

function normalizeRecord(record: Record<string, unknown>): NormalizedMarketRecord | null {
  const state = field(record, "state", "State");
  const market = field(record, "market", "Market");
  const commodity = field(record, "commodity", "Commodity");
  const modalPrice = numberField(record, "modal_price", "Modal_Price", "Modal_x0020_Price");

  if (!state || !market || !commodity || modalPrice === undefined) return null;

  const minPrice = numberField(record, "min_price", "Min_Price", "Min_x0020_Price") ?? modalPrice;
  const maxPrice = numberField(record, "max_price", "Max_Price", "Max_x0020_Price") ?? modalPrice;

  return {
    commodity,
    variety: field(record, "variety", "Variety"),
    market,
    district: field(record, "district", "District") ?? "",
    state,
    minPrice,
    maxPrice,
    modalPrice,
    unit: "₹ per quintal",
    arrivalDate: field(record, "arrival_date", "Arrival_Date") ?? "",
    source: SOURCE_LABEL,
    isLive: true,
  };
}

export async function fetchAgmarknetPrices(query: MarketQuery): Promise<NormalizedMarketRecord[]> {
  const apiKey = process.env.MARKET_API_KEY || PUBLIC_SAMPLE_KEY;

  const url = new URL(BASE_URL);
  url.searchParams.set("api-key", apiKey);
  url.searchParams.set("format", "json");
  url.searchParams.set("limit", String(query.limit ?? 20));
  if (query.state) url.searchParams.set("filters[state]", query.state);
  if (query.district) url.searchParams.set("filters[district]", query.district);
  if (query.commodity) url.searchParams.set("filters[commodity]", query.commodity);

  const res = await fetch(url.toString(), {
    headers: {
      "User-Agent": "AgroGuide/1.0 (Agriculture Assistant)",
      Accept: "application/json",
    },
    // Mandi prices update once (sometimes twice) daily — 30 min cache is
    // plenty fresh and avoids hammering the government API on every load.
    next: { revalidate: 1800 },
  });

  if (!res.ok) {
    throw new Error(`Agmarknet/data.gov.in API error: ${res.status} ${res.statusText}`);
  }

  const data = await res.json();
  const rawRecords: unknown = data?.records;
  if (!Array.isArray(rawRecords)) {
    throw new Error("Agmarknet/data.gov.in returned an unexpected response shape.");
  }

  return rawRecords
    .map((r) => normalizeRecord(r as Record<string, unknown>))
    .filter((r): r is NormalizedMarketRecord => r !== null);
}

