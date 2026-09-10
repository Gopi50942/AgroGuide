"use client";

import { WifiOff, RefreshCw } from "lucide-react";
import { useNetworkStatus } from "@/hooks/useNetworkStatus";
import { useLanguage } from "@/hooks/useLanguage";

export function ConnectivityBanner() {
  const { state } = useNetworkStatus();
  const { t } = useLanguage();

  if (state === "online") {
    return null;
  }

  if (state === "reconnecting") {
    return (
      <div className="bg-wheat-500 text-forest-950 px-4 py-1.5 text-xs font-medium flex items-center justify-center gap-2 transition-all sticky top-0 z-50 shadow-sm">
        <RefreshCw size={13} className="animate-spin" />
        <span>{t("connectivity.reconnecting")}</span>
      </div>
    );
  }

  return (
    <div className="bg-rust-700 text-cream-50 px-4 py-1.5 text-xs font-medium flex items-center justify-center gap-2 transition-all sticky top-0 z-50 shadow-sm">
      <WifiOff size={13} />
      <span>{t("connectivity.offline")}</span>
    </div>
  );
}
