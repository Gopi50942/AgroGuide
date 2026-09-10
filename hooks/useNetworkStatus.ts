"use client";

import { useEffect, useState } from "react";
import type { Language } from "@/types";

export type ConnectivityState = "online" | "offline" | "reconnecting";

export function useNetworkStatus() {
  const [isOnline, setIsOnline] = useState<boolean>(true);
  const [isReconnecting, setIsReconnecting] = useState<boolean>(false);
  const [offlineSince, setOfflineSince] = useState<Date | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;

    setIsOnline(navigator.onLine);

    const handleOnline = () => {
      setIsReconnecting(true);
      setIsOnline(true);
      setOfflineSince(null);
      const timer = setTimeout(() => {
        setIsReconnecting(false);
      }, 3000);
      return () => clearTimeout(timer);
    };

    const handleOffline = () => {
      setIsOnline(false);
      setIsReconnecting(false);
      setOfflineSince(new Date());
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  const state: ConnectivityState = !isOnline
    ? "offline"
    : isReconnecting
    ? "reconnecting"
    : "online";

  return { isOnline, isReconnecting, state, offlineSince };
}

/**
 * Format relative time for cached offline data display.
 */
export function formatDataFreshness(
  timestamp: string | number | Date | undefined,
  language: Language = "en"
): { label: string; isFresh: boolean; isStale: boolean } {
  if (!timestamp) {
    return {
      label: language === "ta" ? "நேரம் தெரியவில்லை" : "Time unknown",
      isFresh: false,
      isStale: true,
    };
  }

  const timeMs = new Date(timestamp).getTime();
  if (isNaN(timeMs)) {
    return {
      label: language === "ta" ? "நேரம் தெரியவில்லை" : "Time unknown",
      isFresh: false,
      isStale: true,
    };
  }

  const diffMinutes = Math.floor((Date.now() - timeMs) / 60000);

  if (diffMinutes < 5) {
    return {
      label: language === "ta" ? "சற்று முன் புதுப்பிக்கப்பட்டது" : "Just updated",
      isFresh: true,
      isStale: false,
    };
  }

  if (diffMinutes < 60) {
    return {
      label:
        language === "ta"
          ? `${diffMinutes} நிமிடங்களுக்கு முன்`
          : `${diffMinutes}m ago`,
      isFresh: true,
      isStale: false,
    };
  }

  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) {
    return {
      label:
        language === "ta"
          ? `${diffHours} மணிநேரத்திற்கு முன்`
          : `${diffHours}h ago`,
      isFresh: false,
      isStale: true,
    };
  }

  const diffDays = Math.floor(diffHours / 24);
  return {
    label:
      language === "ta"
        ? `${diffDays} நாட்களுக்கு முன்`
        : `${diffDays}d ago`,
    isFresh: false,
    isStale: true,
  };
}
