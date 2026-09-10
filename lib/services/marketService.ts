import type { MarketApiResponse, NormalizedMarketRecord } from "@/lib/market/marketTypes";

// ─────────────────────────────────────────────
// Client-side market service. Talks only to /api/market (server-side,
// see app/api/market/route.ts) which proxies the real Agmarknet/
// data.gov.in mandi price dataset. There is no demo/fabricated price
// path here — if live data can't be fetched, callers get isLive:false
// and an empty record list, and the UI must show that honestly.
// ─────────────────────────────────────────────

export async function getMarketPrices(query: {
  state?: string;
  district?: string;
  commodity?: string;
}): Promise<MarketApiResponse> {
  try {
    const params = new URLSearchParams();
    if (query.state) params.set("state", query.state);
    if (query.district) params.set("district", query.district);
    if (query.commodity) params.set("commodity", query.commodity);

    const res = await fetch(`/api/market?${params.toString()}`);
    const data = (await res.json()) as MarketApiResponse;
    if (!res.ok) {
      return { records: [], isLive: false, error: data.error ?? "Live market data is currently unavailable." };
    }
    return data;
  } catch {
    return { records: [], isLive: false, error: "Live market data is currently unavailable." };
  }
}

export interface SellComparison {
  market: string;
  district: string;
  variety?: string;
  minPrice: number;
  maxPrice: number;
  modalPrice: number;
  estGrossReturnRs: number;
  estCommissionRs: number;
  estNetReturnRs: number;
}

const APMC_COMMISSION_RATE = 0.06; // typical regulated-market commission; shown as an estimate, not a guarantee

/**
 * Ranks real market records by estimated net return for a given quantity.
 * No transport cost is estimated — the live dataset has no distance-from-farmer
 * field, and inventing one would reintroduce fabricated numbers.
 */
export function compareMarketsByReturn(
  records: NormalizedMarketRecord[],
  quintals: number
): SellComparison[] {
  return records
    .map((r) => {
      const estGrossReturnRs = Math.round(r.modalPrice * quintals);
      const estCommissionRs = Math.round(estGrossReturnRs * APMC_COMMISSION_RATE);
      return {
        market: r.market,
        district: r.district,
        variety: r.variety,
        minPrice: r.minPrice,
        maxPrice: r.maxPrice,
        modalPrice: r.modalPrice,
        estGrossReturnRs,
        estCommissionRs,
        estNetReturnRs: estGrossReturnRs - estCommissionRs,
      };
    })
    .sort((a, b) => b.estNetReturnRs - a.estNetReturnRs);
}
