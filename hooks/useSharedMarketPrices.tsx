"use client";

// ─────────────────────────────────────────────
// Shared market-price cache with Offline persistence
// Keyed by (state, district, commodity).
//
// In-memory deduping during session + LocalStorage persistence
// for offline access with timestamp and source metadata.
// ─────────────────────────────────────────────

import { useCallback, useEffect, useRef, useState } from "react";
import { getMarketPrices } from "@/lib/services/marketService";
import type { MarketApiResponse } from "@/lib/market/marketTypes";

interface MarketQuery {
  state?: string;
  district?: string;
  commodity?: string;
}

const CACHE_MAX_AGE_MS = 30 * 60 * 1000; // 30 min
const MARKET_OFFLINE_STORAGE_KEY = "agroguide_cached_market";

interface CacheEntry {
  response: MarketApiResponse;
  fetchedAt: number;
}

const memoryCache = new Map<string, CacheEntry>();
const inFlight = new Map<string, Promise<MarketApiResponse>>();

function keyFor(query: MarketQuery): string {
  return `${query.state ?? ""}|${query.district ?? ""}|${query.commodity ?? ""}`;
}

async function fetchDeduped(query: MarketQuery): Promise<MarketApiResponse> {
  const key = keyFor(query);

  const cached = memoryCache.get(key);
  if (cached && Date.now() - cached.fetchedAt < CACHE_MAX_AGE_MS) {
    return cached.response;
  }

  const existing = inFlight.get(key);
  if (existing) return existing;

  const promise = getMarketPrices(query)
    .then((response) => {
      memoryCache.set(key, { response, fetchedAt: Date.now() });
      inFlight.delete(key);

      if (typeof window !== "undefined" && response.records && response.records.length > 0) {
        try {
          localStorage.setItem(
            MARKET_OFFLINE_STORAGE_KEY,
            JSON.stringify({
              query,
              response,
              cachedAt: new Date().toISOString(),
            })
          );
        } catch {
          // Ignore
        }
      }
      return response;
    })
    .catch((err) => {
      inFlight.delete(key);

      // Attempt offline recovery
      if (typeof window !== "undefined") {
        try {
          const raw = localStorage.getItem(MARKET_OFFLINE_STORAGE_KEY);
          if (raw) {
            const parsed = JSON.parse(raw);
            if (parsed?.response) {
              return {
                ...parsed.response,
                isLive: false,
                cachedAt: parsed.cachedAt,
              };
            }
          }
        } catch {
          // Ignore
        }
      }
      throw err;
    });

  inFlight.set(key, promise);
  return promise;
}

export function useSharedMarketPrices(query: MarketQuery) {
  const [response, setResponse] = useState<MarketApiResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [isOfflineCached, setIsOfflineCached] = useState(false);
  const [cachedAt, setCachedAt] = useState<string | null>(null);
  const lastKeyRef = useRef<string | null>(null);

  const key = keyFor(query);
  const hasQuery = Boolean(query.state || query.district || query.commodity);

  const refetch = useCallback(() => {
    memoryCache.delete(key);
    lastKeyRef.current = null;
    setLoading(true);
    fetchDeduped(query)
      .then((res) => {
        setResponse(res);
        setIsOfflineCached(!res.isLive);
        setCachedAt(res.cachedAt ?? new Date().toISOString());
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  useEffect(() => {
    if (!hasQuery) {
      setLoading(false);
      return;
    }
    if (lastKeyRef.current === key) return;
    lastKeyRef.current = key;

    setLoading(true);
    fetchDeduped(query)
      .then((res) => {
        if (lastKeyRef.current === key) {
          setResponse(res);
          setIsOfflineCached(!res.isLive);
          setCachedAt(res.cachedAt ?? null);
          setLoading(false);
        }
      })
      .catch(() => {
        setLoading(false);
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key, hasQuery]);

  return { response, loading, refetch, isOfflineCached, cachedAt };
}
