"use client";

import { useState } from "react";
import {
  Sparkles,
  Calendar,
  Droplets,
  Sprout,
  CheckCircle2,
  AlertCircle,
  X,
  ChevronRight,
  Info,
} from "lucide-react";
import { evaluateCropSeasonPlan } from "@/lib/services/cropSeasonPlannerService";
import { useLanguage } from "@/hooks/useLanguage";
import type { CropSeasonPlanCriteria, CropSeasonRecommendation, UserProfile } from "@/types";

export function CropSeasonPlannerModal({
  isOpen,
  onClose,
  profile,
  onSelectCrop,
}: {
  isOpen: boolean;
  onClose: () => void;
  profile: UserProfile | null;
  onSelectCrop?: (cropName: string) => void;
}) {
  const { language, t } = useLanguage();

  const [criteria, setCriteria] = useState<CropSeasonPlanCriteria>({
    state: profile?.state || "Tamil Nadu",
    district: profile?.district || "Coimbatore",
    seasonOrMonth: "samba",
    soilType: profile?.soilType || "red",
    waterAvailability: "moderate",
    landAreaAcres: profile?.landAreaAcres || 2,
  });

  const [results, setResults] = useState<CropSeasonRecommendation[] | null>(null);

  if (!isOpen) return null;

  function handleCalculate(e: React.FormEvent) {
    e.preventDefault();
    const recommendations = evaluateCropSeasonPlan(criteria);
    setResults(recommendations);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-forest-950/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="card max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 space-y-5 bg-white shadow-xl border-forest-200">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-forest-100 pb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-forest-100 text-forest-800 flex items-center justify-center">
              <Calendar size={18} />
            </div>
            <div>
              <h2 className="font-serif font-bold text-lg text-forest-950">
                {t("cropPlanner.modalTitle")}
              </h2>
              <p className="text-xs text-ink-light">{t("cropPlanner.modalSubtitle")}</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-ink-light hover:text-forest-900 p-1 rounded-lg"
          >
            <X size={18} />
          </button>
        </div>

        {/* Input Form */}
        {!results ? (
          <form onSubmit={handleCalculate} className="space-y-4">
            <div className="grid sm:grid-cols-2 gap-3">
              <div>
                <label className="label-field">{t("settings.district")}</label>
                <input
                  type="text"
                  value={criteria.district}
                  onChange={(e) => setCriteria({ ...criteria, district: e.target.value })}
                  className="input-field text-xs"
                  required
                />
              </div>

              <div>
                <label className="label-field">{t("cropPlanner.seasonLabel")}</label>
                <select
                  value={criteria.seasonOrMonth}
                  onChange={(e) => setCriteria({ ...criteria, seasonOrMonth: e.target.value })}
                  className="input-field text-xs"
                >
                  <option value="kuruvai">{t("cropPlanner.seasonKuruvai")} (Jun–Sep)</option>
                  <option value="samba">{t("cropPlanner.seasonSamba")} (Aug–Jan)</option>
                  <option value="thaladi">{t("cropPlanner.seasonThaladi")} (Oct–Feb)</option>
                  <option value="navarai">{t("cropPlanner.seasonNavarai")} (Dec–Apr)</option>
                  <option value="sornavari">{t("cropPlanner.seasonSornavari")} (Apr–Aug)</option>
                  <option value="kharif">Kharif (Monsoon)</option>
                  <option value="rabi">Rabi (Winter)</option>
                  <option value="zaid">Zaid (Summer)</option>
                </select>
              </div>

              <div>
                <label className="label-field">{t("settings.soilType")}</label>
                <select
                  value={criteria.soilType}
                  onChange={(e) => setCriteria({ ...criteria, soilType: e.target.value })}
                  className="input-field text-xs"
                >
                  <option value="red">{t("cropPlanner.soilRed")}</option>
                  <option value="clay">{t("cropPlanner.soilClay")}</option>
                  <option value="loam">{t("cropPlanner.soilLoam")}</option>
                  <option value="black">{t("cropPlanner.soilBlack")}</option>
                  <option value="alluvial">{t("cropPlanner.soilAlluvial")}</option>
                  <option value="sandy">{t("cropPlanner.soilSandy")}</option>
                </select>
              </div>

              <div>
                <label className="label-field">{t("cropPlanner.waterAvailability")}</label>
                <select
                  value={criteria.waterAvailability}
                  onChange={(e) =>
                    setCriteria({
                      ...criteria,
                      waterAvailability: e.target.value as CropSeasonPlanCriteria["waterAvailability"],
                    })
                  }
                  className="input-field text-xs"
                >
                  <option value="abundant">{t("cropPlanner.waterAbundant")}</option>
                  <option value="moderate">{t("cropPlanner.waterModerate")}</option>
                  <option value="limited">{t("cropPlanner.waterLimited")}</option>
                  <option value="rainfed">{t("cropPlanner.waterRainfed")}</option>
                </select>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="submit"
                className="btn-primary text-xs flex items-center gap-1.5 py-2 px-4 shadow-sm"
              >
                <Sparkles size={14} /> {t("cropPlanner.findSuitableCrops")}
              </button>
            </div>
          </form>
        ) : (
          <div className="space-y-4 animate-in fade-in duration-200">
            <div className="flex items-center justify-between">
              <p className="text-xs font-bold text-forest-900 font-serif">
                {t("cropPlanner.recommendationsTitle")} ({results.length})
              </p>
              <button
                onClick={() => setResults(null)}
                className="text-xs text-forest-700 hover:underline"
              >
                {t("cropPlanner.recalculate")}
              </button>
            </div>

            <div className="space-y-3">
              {results.map((rec, idx) => {
                const name = language === "ta" ? rec.cropNameTa : rec.cropNameEn;
                const reason = language === "ta" ? rec.suitabilityReasonTa : rec.suitabilityReasonEn;
                const varieties = language === "ta" ? rec.varietySuggestionsTa : rec.varietySuggestionsEn;
                const considerations = language === "ta" ? rec.considerationsTa : rec.considerationsEn;

                return (
                  <div
                    key={idx}
                    className="card p-4 space-y-2.5 bg-cream-50/60 border-forest-200 shadow-sm"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <Sprout size={18} className="text-forest-700" />
                        <h3 className="font-serif font-bold text-base text-forest-950">
                          {name}
                        </h3>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="chip bg-forest-100 text-forest-900 text-xs">
                          {rec.durationDays}
                        </span>
                        <span className="chip bg-wheat-100 text-forest-950 text-xs font-mono">
                          ~₹{rec.estimatedCostPerAcre.toLocaleString()}/ac
                        </span>
                      </div>
                    </div>

                    <p className="text-xs text-forest-900 leading-relaxed font-sans">{reason}</p>

                    <div className="grid sm:grid-cols-2 gap-2 text-xs pt-1 border-t border-forest-100">
                      <div>
                        <p className="font-semibold text-forest-950 mb-1">
                          {t("cropPlanner.recommendedVarieties")}:
                        </p>
                        <p className="text-ink-light">{varieties.join(", ")}</p>
                      </div>

                      <div>
                        <p className="font-semibold text-forest-950 mb-1">
                          {t("cropPlanner.keyConsiderations")}:
                        </p>
                        <ul className="space-y-0.5 text-ink-light">
                          {considerations.slice(0, 2).map((c, i) => (
                            <li key={i} className="flex items-start gap-1">
                              <CheckCircle2 size={11} className="text-forest-600 shrink-0 mt-0.5" />
                              <span>{c}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    {onSelectCrop && (
                      <div className="pt-2 flex justify-end">
                        <button
                          type="button"
                          onClick={() => {
                            onSelectCrop(rec.cropNameEn);
                            onClose();
                          }}
                          className="btn-secondary text-xs flex items-center gap-1 py-1 px-3"
                        >
                          {t("cropPlanner.planThisCrop")} <ChevronRight size={12} />
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            <div className="flex items-start gap-2 text-[11px] text-ink-light bg-cream-100/70 p-2.5 rounded-xl border border-cream-300">
              <Info size={13} className="shrink-0 text-clay-600 mt-0.5" />
              <span>{t("cropPlanner.disclaimer")}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
