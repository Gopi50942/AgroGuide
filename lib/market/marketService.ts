import { fetchAgmarknetPrices } from "./providers/agmarknet";
import type { MarketQuery, NormalizedMarketRecord } from "./marketTypes";

// ─────────────────────────────────────────────
// Server-side market service. Agmarknet/data.gov.in is the only
// provider wired today; kept as a separate module (rather than inlined
// in the API route) so a state-specific or private provider can be
// added later — e.g. tried first, with Agmarknet as fallback — without
// touching the API route or the client.
// ─────────────────────────────────────────────

export async function getRealMarketPrices(query: MarketQuery): Promise<NormalizedMarketRecord[]> {
  // 1. Try exact query (state, district, commodity)
  let records = await fetchAgmarknetPrices(query);
  if (records.length > 0) return records;

  // 2. If district was specified but had no arrivals logged today, retry at state level
  if (query.district) {
    records = await fetchAgmarknetPrices({ ...query, district: undefined });
    if (records.length > 0) return records;
  }

  // 3. If commodity was specified but no arrivals in state today, retry commodity across all states
  if (query.commodity && query.state) {
    records = await fetchAgmarknetPrices({ commodity: query.commodity, limit: query.limit });
    if (records.length > 0) return records;
  }

  // 4. If query had only state/district with no commodity and no results, fetch recent arrivals
  if (!query.commodity) {
    records = await fetchAgmarknetPrices({ limit: query.limit ?? 20 });
  }

  return records;
}

