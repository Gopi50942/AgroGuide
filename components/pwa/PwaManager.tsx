"use client";

import { useEffect, useState } from "react";
import { Download, X } from "lucide-react";
import { useLanguage } from "@/hooks/useLanguage";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export function PwaManager() {
  const { t } = useLanguage();
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showInstallBanner, setShowInstallBanner] = useState(false);

  useEffect(() => {
    // Register Service Worker
    if (typeof window !== "undefined" && "serviceWorker" in navigator) {
      navigator.serviceWorker
        .register("/sw.js")
        .then((reg) => {
          console.log("🌾 AgroGuide ServiceWorker registered successfully:", reg.scope);
        })
        .catch((err) => {
          console.warn("AgroGuide ServiceWorker registration failed:", err);
        });
    }

    // Capture install prompt
    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setShowInstallBanner(true);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstall);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstall);
    };
  }, []);

  async function handleInstallClick() {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === "accepted") {
      setShowInstallBanner(false);
    }
    setDeferredPrompt(null);
  }

  if (!showInstallBanner) return null;

  return (
    <div className="fixed bottom-20 left-4 right-4 md:left-auto md:right-6 md:bottom-6 md:w-96 z-50 bg-forest-900 text-cream-50 p-4 rounded-2xl shadow-xl border border-forest-700 flex items-center justify-between gap-3 animate-slide-up">
      <div className="flex-1">
        <p className="font-serif font-bold text-sm text-wheat-300">
          {t("pwa.installTitle")}
        </p>
        <p className="text-xs text-cream-200 mt-0.5">
          {t("pwa.installDesc")}
        </p>
      </div>
      <div className="flex items-center gap-2">
        <button
          onClick={handleInstallClick}
          className="btn-primary text-xs py-1.5 px-3 flex items-center gap-1.5 bg-wheat-400 text-forest-950 hover:bg-wheat-300"
        >
          <Download size={13} /> {t("pwa.installBtn")}
        </button>
        <button
          onClick={() => setShowInstallBanner(false)}
          className="p-1.5 rounded-lg text-cream-300 hover:text-white hover:bg-forest-800"
          aria-label="Close"
        >
          <X size={15} />
        </button>
      </div>
    </div>
  );
}
