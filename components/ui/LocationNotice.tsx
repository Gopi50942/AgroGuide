"use client";

import { MapPin, Loader2 } from "lucide-react";
import { useSharedLocation } from "@/hooks/useLocationContext";
import { useLanguage } from "@/hooks/useLanguage";

/**
 * Simple, non-technical location status banner for farmer-facing pages.
 * Shows nothing while location is loading/resolved — only surfaces when
 * the farmer needs to take an action (denied/unavailable/timeout/error).
 */
export function LocationNotice() {
  const { status, requestLocation } = useSharedLocation();
  const { t } = useLanguage();

  if (status === "denied" || status === "unavailable" || status === "timeout" || status === "error") {
    return (
      <div className="card p-4 flex items-start gap-3 border-clay-200 bg-clay-50/50">
        <MapPin size={18} className="text-clay-500 shrink-0 mt-0.5" />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold">
            {status === "denied" ? t("location.permissionNeeded") : t("location.unavailable")}
          </p>
          {status === "denied" && (
            <p className="text-xs text-ink-light mt-1">{t("location.permissionDeniedHelp")}</p>
          )}
          <button onClick={() => requestLocation()} className="btn-secondary text-xs mt-3">
            <MapPin size={13} /> {t("location.tryAgain")}
          </button>
        </div>
      </div>
    );
  }

  if (status === "requesting" || status === "loading") {
    return (
      <div className="card p-4 flex items-center gap-3 text-sm text-ink-light">
        <Loader2 size={16} className="animate-spin text-forest-600" />
        {t("location.gettingLocation")}
      </div>
    );
  }

  return null;
}
