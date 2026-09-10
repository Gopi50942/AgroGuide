"use client";

// ─────────────────────────────────────────────
// Shared weather fetch with Offline LocalStorage caching
// Keyed off the shared location context.
//
// In online mode: fetches live Open-Meteo weather and updates local cache.
// In offline mode: restores cached weather with exact timestamp metadata,
// clearly labeled as cached data rather than live weather.
// ─────────────────────────────────────────────

import { useEffect, useRef, useState } from "react";
import { fetchWeather, getDemoWeather, type WeatherBundle } from "@/lib/services/weatherService";
import { useSharedLocation } from "@/hooks/useLocationContext";

const FAILED_LOCATION_STATUSES = new Set(["denied", "unavailable", "timeout", "error"]);
const WEATHER_CACHE_KEY = "agroguide_cached_weather";

interface CachedWeatherPayload {
  bundle: WeatherBundle;
  cachedAt: string;
  lat: number;
  lng: number;
}

export function useSharedWeather() {
  const { location, status: locationStatus } = useSharedLocation();
  const [weather, setWeather] = useState<WeatherBundle | null>(null);
  const [isFallback, setIsFallback] = useState(false);
  const [isCached, setIsCached] = useState(false);
  const [cachedAt, setCachedAt] = useState<string | null>(null);

  const lastKeyRef = useRef<string | null>(null);
  const inFlightRef = useRef(false);

  useEffect(() => {
    // Check if there is cached weather in localStorage to display immediately
    if (typeof window !== "undefined") {
      try {
        const raw = localStorage.getItem(WEATHER_CACHE_KEY);
        if (raw) {
          const parsed = JSON.parse(raw) as CachedWeatherPayload;
          if (parsed && parsed.bundle) {
            setCachedAt(parsed.cachedAt);
          }
        }
      } catch {
        // Ignore JSON error
      }
    }

    if (locationStatus === "idle" || locationStatus === "loading" || locationStatus === "requesting" || locationStatus === "granted") {
      return;
    }

    if (location) {
      const key = `${location.lat.toFixed(3)},${location.lng.toFixed(3)}`;
      if (lastKeyRef.current === key || inFlightRef.current) return;
      lastKeyRef.current = key;
      inFlightRef.current = true;

      fetchWeather(location.lat, location.lng)
        .then((bundle) => {
          setWeather(bundle);
          setIsFallback(false);
          setIsCached(false);
          setCachedAt(new Date().toISOString());

          if (typeof window !== "undefined") {
            try {
              const payload: CachedWeatherPayload = {
                bundle,
                cachedAt: new Date().toISOString(),
                lat: location.lat,
                lng: location.lng,
              };
              localStorage.setItem(WEATHER_CACHE_KEY, JSON.stringify(payload));
            } catch {
              // Ignore storage quota errors
            }
          }
        })
        .catch(() => {
          // Attempt to load from offline cache
          if (typeof window !== "undefined") {
            try {
              const raw = localStorage.getItem(WEATHER_CACHE_KEY);
              if (raw) {
                const parsed = JSON.parse(raw) as CachedWeatherPayload;
                if (parsed?.bundle) {
                  setWeather(parsed.bundle);
                  setIsFallback(false);
                  setIsCached(true);
                  setCachedAt(parsed.cachedAt);
                  return;
                }
              }
            } catch {
              // Ignore
            }
          }

          // If no cache, use demo fallback
          setWeather(getDemoWeather());
          setIsFallback(true);
          setIsCached(false);
        })
        .finally(() => {
          inFlightRef.current = false;
        });
      return;
    }

    if (FAILED_LOCATION_STATUSES.has(locationStatus) && lastKeyRef.current !== "fallback") {
      lastKeyRef.current = "fallback";
      setWeather(getDemoWeather());
      setIsFallback(true);
      setIsCached(false);
    }
  }, [location, locationStatus]);

  const loading = weather === null;

  return { weather, loading, isFallback, isCached, cachedAt };
}
