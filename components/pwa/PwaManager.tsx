"use client";

import { useEffect } from "react";
import { Download, X } from "lucide-react";
import { useLanguage } from "@/hooks/useLanguage";
import { usePwaInstallPrompt } from "@/hooks/usePwaInstallPrompt";

export function PwaManager() {
  const { t } = useLanguage();
  const { canInstall, isInstalled, install, dismiss } = usePwaInstallPrompt();

  useEffect(() => {
    // Register Service Worker
    if (typeof window !== "undefined" && "serviceWorker" in navigator) {
      navigator.serviceWorker
        .register("/sw.js")
        .then((reg) => {
          if (process.env.NODE_ENV !== "production") {
            console.log("🌾 AgroGuide ServiceWorker registered successfully:", reg.scope);
          }
        })
        .catch((err) => {
          if (process.env.NODE_ENV !== "production") {
            console.warn("AgroGuide ServiceWorker registration failed:", err);
          }
        });
    }
  }, []);

  if (!canInstall || isInstalled) return null;

  return (
    <div className="fixed bottom-24 left-4 right-4 md:left-auto md:right-6 md:bottom-6 md:w-96 z-40 bg-forest-900 text-cream-50 p-4 rounded-2xl shadow-xl border border-forest-700 flex items-center justify-between gap-3 animate-slide-up print:hidden">
      <div className="flex-1">
        <p className="font-serif font-bold text-sm text-wheat-300">
          {t("pwa.installTitle")}
        </p>
        <p className="text-xs text-cream-200 mt-0.5">
          {t("pwa.installDesc")}
        </p>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <button
          onClick={install}
          className="btn-primary text-xs py-1.5 px-3 flex items-center gap-1.5 bg-wheat-400 text-forest-950 hover:bg-wheat-300"
        >
          <Download size={13} /> {t("pwa.installBtn")}
        </button>
        <button
          onClick={dismiss}
          className="p-1.5 rounded-lg text-cream-300 hover:text-white hover:bg-forest-800"
          aria-label="Close"
        >
          <X size={15} />
        </button>
      </div>
    </div>
  );
}
