"use client";

import { useEffect, useState, useCallback } from "react";

export interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

const DISMISSAL_KEY = "agroguide_pwa_prompt_dismissed_at";
const LEGACY_DISMISSAL_KEY = "agroguide_pwa_prompt_dismissed_v1";
const INSTALLED_KEY = "agroguide_pwa_installed";
const DISMISSAL_WINDOW_MS = 30 * 24 * 60 * 60 * 1000; // 30 days

export function isRunningStandalone(): boolean {
  if (typeof window === "undefined") return false;
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    (window.navigator as unknown as { standalone?: boolean }).standalone === true ||
    document.referrer.includes("android-app://")
  );
}

export function isPromptDismissed(): boolean {
  if (typeof window === "undefined") return false;
  if (localStorage.getItem(INSTALLED_KEY) === "true") return true;
  if (localStorage.getItem(LEGACY_DISMISSAL_KEY) === "true") return true;

  const dismissedAt = localStorage.getItem(DISMISSAL_KEY);
  if (!dismissedAt) return false;

  const timestamp = parseInt(dismissedAt, 10);
  if (Number.isNaN(timestamp)) return false;

  return Date.now() - timestamp < DISMISSAL_WINDOW_MS;
}

export function usePwaInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [canInstall, setCanInstall] = useState<boolean>(false);
  const [isInstalled, setIsInstalled] = useState<boolean>(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    // Check if app is already running in standalone/installed mode
    if (isRunningStandalone() || localStorage.getItem(INSTALLED_KEY) === "true") {
      setIsInstalled(true);
      setCanInstall(false);
      return;
    }

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      const promptEvent = e as BeforeInstallPromptEvent;
      setDeferredPrompt(promptEvent);

      // Only allow banner if not installed and not dismissed within last 30 days
      if (!isPromptDismissed() && !isRunningStandalone()) {
        setCanInstall(true);
      }
    };

    const handleAppInstalled = () => {
      localStorage.setItem(INSTALLED_KEY, "true");
      setIsInstalled(true);
      setCanInstall(false);
      setDeferredPrompt(null);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    window.addEventListener("appinstalled", handleAppInstalled);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
      window.removeEventListener("appinstalled", handleAppInstalled);
    };
  }, []);

  const dismiss = useCallback(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem(DISMISSAL_KEY, Date.now().toString());
      localStorage.setItem(LEGACY_DISMISSAL_KEY, "true");
    }
    setCanInstall(false);
  }, []);

  const install = useCallback(async () => {
    if (!deferredPrompt) return;
    try {
      await deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === "accepted") {
        if (typeof window !== "undefined") {
          localStorage.setItem(INSTALLED_KEY, "true");
        }
        setIsInstalled(true);
        setCanInstall(false);
      } else {
        dismiss();
      }
    } catch {
      // User cancelled or prompt failed
      dismiss();
    } finally {
      setDeferredPrompt(null);
    }
  }, [deferredPrompt, dismiss]);

  return {
    canInstall,
    isInstalled,
    deferredPrompt,
    install,
    dismiss,
  };
}
