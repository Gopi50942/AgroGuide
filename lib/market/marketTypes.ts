// ─────────────────────────────────────────────
// Normalized market data shape used across providers/UI.
// A "provider" (see ./providers/) is any source of real mandi price
// data; the API route and UI only ever talk to this shape, never to
// a provider's raw response format.
// ─────────────────────────────────────────────

export interface MarketQuery {
  state?: string;
  district?: string;
  commodity?: string;
  limit?: number;
}

export interface NormalizedMarketRecord {
  commodity: string;
  variety?: string;
  market: string;
  district: string;
  state: string;
  minPrice: number;
  maxPrice: number;
  modalPrice: number;
  unit: string;
  arrivalDate: string;
  source: string;
  isLive: true;
}

export interface MarketApiResponse {
  records: NormalizedMarketRecord[];
  isLive: boolean;
  error?: string;
  cachedAt?: string;
}
