"use client";

import { Quote, BookOpen, Sparkles } from "lucide-react";
import { useLanguage } from "@/hooks/useLanguage";
import { pickDailyWisdom } from "@/data/quotes";

export function FarmerQuoteTicker() {
  const { language, t } = useLanguage();
  const wisdom = pickDailyWisdom(language);

  return (
    <div className="card p-4.5 bg-wheat-100/70 border-wheat-200 shadow-sm transition-all">
      <div className="flex items-start gap-3">
        <div className="w-8 h-8 rounded-full bg-wheat-200/80 flex items-center justify-center text-clay-600 shrink-0 mt-0.5">
          {wisdom.type === "kural" ? <BookOpen size={16} /> : <Sparkles size={16} />}
        </div>

        <div className="min-w-0 flex-1">
          {/* Header with Title / Badge */}
          <div className="flex items-center gap-2 mb-1.5 flex-wrap">
            <span className="text-xs font-semibold uppercase tracking-wider text-forest-800 bg-forest-100/80 px-2 py-0.5 rounded-md">
              {t("dashboard.farmerWisdom")}
            </span>
            <span className="text-xs text-clay-600 font-medium bg-wheat-200/60 px-2 py-0.5 rounded-md">
              {wisdom.badgeLabel}
            </span>
          </div>

          {/* Content: If Thirukkural, render two distinct lines */}
          {wisdom.type === "kural" && wisdom.line1 && wisdom.line2 ? (
            <div className="space-y-1 my-2">
              <p className={`text-sm sm:text-base font-semibold leading-snug text-ink ${language === "ta" ? "font-serif tracking-wide" : ""}`}>
                {wisdom.line1}
              </p>
              <p className={`text-sm sm:text-base font-semibold leading-snug text-ink ${language === "ta" ? "font-serif tracking-wide" : ""}`}>
                {wisdom.line2}
              </p>
            </div>
          ) : (
            <p className={`text-sm sm:text-base font-semibold text-ink my-1.5 leading-snug ${language === "ta" ? "font-serif" : "italic"}`}>
              {wisdom.text}
            </p>
          )}

          {/* Chapter / Topic */}
          {wisdom.chapter && (
            <p className="text-xs font-medium text-forest-700 mt-1">
              {wisdom.chapter}
            </p>
          )}

          {/* Meaning / Explanation */}
          {wisdom.meaning && (
            <p className="text-xs text-ink-light mt-1 leading-relaxed">
              <span className="font-medium text-ink/80">{language === "ta" ? "பொருள்: " : "Meaning: "}</span>
              {wisdom.meaning}
            </p>
          )}

          {/* Source & Reference Footer */}
          <p className="text-[11px] text-ink-light/80 mt-2 border-t border-wheat-200/60 pt-1.5 flex items-center gap-1.5">
            <span>{wisdom.source}</span>
            <span>·</span>
            <span>{wisdom.reference}</span>
          </p>
        </div>
      </div>
    </div>
  );
}

