"use client";

import { useCallback, useEffect, useState } from "react";

// ─────────────────────────────────────────────
// Sample-data visibility, distinct from "demo mode".
//
// Demo mode (useAuth's isDemoMode) is a whole-app state for when
// Firebase itself isn't configured — everything the farmer sees is
// the same illustrative dataset.
//
// This is different: a REAL, authenticated farmer with zero farms/
// crops yet sees the SAME illustrative dataset, but explicitly
// labeled "Sample" on every card, so the app doesn't look empty on
// day one. It is never written to Firestore — there is nothing to
// "delete", only a UI preference (stored in localStorage) to hide it.
// The instant the farmer adds a real farm/crop, the real data takes
// over and sample cards stop showing regardless of this preference.
// ─────────────────────────────────────────────

const STORAGE_KEY = "agroguide:hideSampleData";

export function useSampleDataVisible() {
  const [hidden, setHidden] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      setHidden(window.localStorage.getItem(STORAGE_KEY) === "true");
    } catch {
      // ignore
    } finally {
      setHydrated(true);
    }
  }, []);

  const dismiss = useCallback(() => {
    setHidden(true);
    try {
      window.localStorage.setItem(STORAGE_KEY, "true");
    } catch {
      // ignore storage errors (private browsing, quota, etc.)
    }
  }, []);

  // Before hydration, default to hidden so the sample card never flashes
  // in before we know the farmer's actual preference.
  return { visible: hydrated && !hidden, dismiss };
}
