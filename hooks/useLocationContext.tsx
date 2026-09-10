"use client";

// ─────────────────────────────────────────────
// Shared location state.
//
// This is the ONE place that talks to the browser Geolocation API and
// Nominatim. Dashboard/Weather/Irrigation/Settings all read from this
// context instead of each calling requestBrowserLocation()/reverseGeocode()
// on their own — that's what caused the repeated "Browser location /
// Nominatim / Open-Meteo" console spam.
//
// Flow on app start:
//   1. Look for a cached, not-too-stale location in localStorage.
//      If found, use it immediately (no permission prompt, no flash of
//      demo data) and quietly refresh it in the background.
//   2. Otherwise, ask the browser for a fresh location.
// Browser APIs (navigator/window) are only ever touched inside
// useEffect/event handlers, so this is safe under Next.js SSR.
// ─────────────────────────────────────────────

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  requestBrowserLocation,
  reverseGeocode,
  type ResolvedLocation,
} from "@/lib/services/locationService";
import { useAuth } from "@/hooks/useAuth";

export type LocationStatus =
  | "idle"
  | "loading" // checking cache / initializing
  | "requesting" // asking the browser for permission + GPS
  | "granted" // GPS obtained, resolving place name
  | "resolved" // full location (with place name) is ready
  | "denied" // user denied the permission prompt
  | "unavailable" // GPS/location not available on this device
  | "timeout" // browser took too long to respond
  | "error"; // any other failure

export interface SharedLocation extends ResolvedLocation {
  resolvedAt: number;
}

interface LocationContextValue {
  location: SharedLocation | null;
  status: LocationStatus;
  error: string | null;
  /** Ask the browser for location. Safe to call repeatedly — de-duped internally. */
  requestLocation: () => Promise<void>;
  /** Alias of requestLocation(), for a "Try Again" button after denial/error. */
  refreshLocation: () => Promise<void>;
}

const LocationContext = createContext<LocationContextValue | null>(null);

const CACHE_KEY = "agroguide:location";
const CACHE_MAX_AGE_MS = 6 * 60 * 60 * 1000; // 6 hours — after this we refresh in the background

function readCache(): SharedLocation | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<SharedLocation>;
    if (
      typeof parsed.lat !== "number" ||
      typeof parsed.lng !== "number" ||
      Number.isNaN(parsed.lat) ||
      Number.isNaN(parsed.lng) ||
      typeof parsed.resolvedAt !== "number"
    ) {
      return null;
    }
    return parsed as SharedLocation;
  } catch {
    return null;
  }
}

function writeCache(loc: SharedLocation) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(CACHE_KEY, JSON.stringify(loc));
  } catch {
    // Storage can throw in private-browsing / quota-exceeded situations.
    // Location still works for this session, it just won't be cached.
  }
}

export function LocationProvider({ children }: { children: React.ReactNode }) {
  const { profile, isDemoMode, updateProfile } = useAuth();
  const [location, setLocation] = useState<SharedLocation | null>(null);
  const [status, setStatus] = useState<LocationStatus>("idle");
  const [error, setError] = useState<string | null>(null);

  const inFlight = useRef(false);
  const initialized = useRef(false); // guards React Strict Mode double-invoke in dev
  const syncedProfileKey = useRef<string | null>(null);

  const requestLocation = useCallback(async () => {
    if (inFlight.current) return;
    inFlight.current = true;
    setStatus("requesting");
    setError(null);
    try {
      const pos = await requestBrowserLocation();
      setStatus("granted");
      const resolved: ResolvedLocation = await reverseGeocode(
        pos.coords.latitude,
        pos.coords.longitude,
        pos.coords.accuracy
      );
      const next: SharedLocation = { ...resolved, resolvedAt: Date.now() };
      setLocation(next);
      writeCache(next);
      setStatus("resolved");
    } catch (err) {
      const geoErr = err as GeolocationPositionError | Error;
      const code = "code" in geoErr ? geoErr.code : undefined;
      if (code === 1) {
        setStatus("denied");
        setError("Location permission was denied.");
      } else if (code === 3) {
        setStatus("timeout");
        setError("Location request timed out.");
      } else if (code === 2) {
        setStatus("unavailable");
        setError("Location is unavailable on this device.");
      } else {
        setStatus("error");
        setError(geoErr instanceof Error ? geoErr.message : "Could not get your location.");
      }
    } finally {
      inFlight.current = false;
    }
  }, []);

  // ── Automatic initialization (runs once per app load) ──────────
  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;

    const cached = readCache();
    if (cached) {
      setLocation(cached);
      setStatus("resolved");
      const isStale = Date.now() - cached.resolvedAt > CACHE_MAX_AGE_MS;
      if (isStale) {
        // Refresh quietly in the background; the cached value is shown meanwhile.
        requestLocation();
      }
      return;
    }

    setStatus("loading");
    requestLocation();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Persist a resolved location onto the farmer's Firestore profile ──
  useEffect(() => {
    if (!location || !profile || isDemoMode) return;
    const key = `${location.lat.toFixed(4)},${location.lng.toFixed(4)}`;
    if (syncedProfileKey.current === key) return;

    const alreadySaved =
      profile.location &&
      Math.abs(profile.location.lat - location.lat) < 0.0005 &&
      Math.abs(profile.location.lng - location.lng) < 0.0005;

    if (alreadySaved) {
      syncedProfileKey.current = key;
      return;
    }

    syncedProfileKey.current = key;
    updateProfile({
      location: {
        lat: location.lat,
        lng: location.lng,
        ...(location.accuracy !== undefined ? { accuracy: location.accuracy } : {}),
        ...(location.village ? { village: location.village } : {}),
        ...(location.panchayat ? { panchayat: location.panchayat } : {}),
        ...(location.taluk ? { taluk: location.taluk } : {}),
        ...(location.pinCode ? { pinCode: location.pinCode } : {}),
        ...(location.displayName ? { displayName: location.displayName } : {}),
        updatedAt: new Date().toISOString(),
      },
      ...(location.state ? { state: location.state } : {}),
      ...(location.district ? { district: location.district } : {}),
    }).catch(() => {
      // Non-fatal — the in-memory/localStorage location still works this session.
    });
  }, [location, profile, isDemoMode, updateProfile]);

  const value = useMemo<LocationContextValue>(
    () => ({
      location,
      status,
      error,
      requestLocation,
      refreshLocation: requestLocation,
    }),
    [location, status, error, requestLocation]
  );

  return <LocationContext.Provider value={value}>{children}</LocationContext.Provider>;
}

export function useSharedLocation() {
  const ctx = useContext(LocationContext);
  if (!ctx) throw new Error("useSharedLocation must be used within LocationProvider");
  return ctx;
}
