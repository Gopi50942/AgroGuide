import { createOwned, listOwned, updateOwned, removeOwned } from "@/lib/firebase/firestore";
import type { MarketWatchlist } from "@/types";

// ─────────────────────────────────────────────
// Real farmer market watchlist preferences.
// ─────────────────────────────────────────────

export async function listMarketWatchlists(ownerId: string): Promise<MarketWatchlist[]> {
  const list = await listOwned<MarketWatchlist>("market_watchlists", ownerId);
  return list.sort((a, b) => (b.createdAt || "").localeCompare(a.createdAt || ""));
}

export async function addMarketWatchlist(
  ownerId: string,
  item: Omit<MarketWatchlist, "id" | "ownerId">
): Promise<string> {
  return createOwned("market_watchlists", ownerId, {
    ...item,
    updatedAt: new Date().toISOString(),
  } as unknown as Record<string, unknown>);
}

export async function updateMarketWatchlist(id: string, data: Partial<MarketWatchlist>): Promise<void> {
  return updateOwned("market_watchlists", id, {
    ...data,
    updatedAt: new Date().toISOString(),
  } as Record<string, unknown>);
}

export async function removeMarketWatchlist(id: string): Promise<void> {
  return removeOwned("market_watchlists", id);
}

export function evaluateTargetPriceStatus(
  currentModalPrice: number,
  targetPrice?: number,
  direction: "ABOVE" | "BELOW" = "ABOVE"
): { status: "reached" | "pending"; difference: number } {
  if (!targetPrice || targetPrice <= 0) {
    return { status: "pending", difference: 0 };
  }

  const difference = currentModalPrice - targetPrice;

  if (direction === "ABOVE") {
    return {
      status: currentModalPrice >= targetPrice ? "reached" : "pending",
      difference,
    };
  } else {
    return {
      status: currentModalPrice <= targetPrice ? "reached" : "pending",
      difference: -difference,
    };
  }
}
