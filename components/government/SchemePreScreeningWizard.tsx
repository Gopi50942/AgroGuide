"use client";

import { useState } from "react";
import {
  Sparkles,
  CheckCircle2,
  AlertCircle,
  FileCheck,
  ExternalLink,
  ChevronRight,
  ChevronLeft,
  Info,
  BookmarkPlus,
  X,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useLanguage } from "@/hooks/useLanguage";
import { useToast } from "@/components/ui/Toast";
import {
  evaluateSchemeScreening,
  type SchemeScreeningCriteria,
  type SchemeScreeningResult,
} from "@/lib/services/governmentService";
import { addSchemeApplication } from "@/lib/services/schemeApplicationService";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onApplicationCreated?: () => void;
}

export function SchemePreScreeningWizard({ isOpen, onClose, onApplicationCreated }: Props) {
  const { profile, isDemoMode } = useAuth();
  const { t, language } = useLanguage();
  const { showToast } = useToast();

  const [step, setStep] = useState<number>(1);
  const [criteria, setCriteria] = useState<SchemeScreeningCriteria>({
    state: profile?.state || "Tamil Nadu",
    landAreaAcres: profile?.landAreaAcres || 2.5,
    farmerCategory: "small_marginal",
    cropCategory: profile?.currentCrops?.[0] || "Paddy",
    irrigationType: profile?.irrigationType || "Drip Irrigation",
    hasSoilReport: true,
    hasKccLoan: false,
  });

  const [results, setResults] = useState<SchemeScreeningResult[] | null>(null);
  const [savingSchemeId, setSavingSchemeId] = useState<string | null>(null);

  if (!isOpen) return null;

  function runScreening() {
    const evaluated = evaluateSchemeScreening(criteria);
    setResults(evaluated);
    setStep(3); // Results step
  }

  async function handleTrackScheme(res: SchemeScreeningResult) {
    if (!profile) return;
    setSavingSchemeId(res.schemeId);

    try {
      if (isDemoMode) {
        showToast(t("schemes.trackedSuccess"));
        onApplicationCreated?.();
        setSavingSchemeId(null);
        return;
      }

      await addSchemeApplication(profile.uid, {
        schemeId: res.schemeId,
        schemeName: res.schemeName,
        appliedDate: new Date().toISOString().slice(0, 10),
        status: "planning",
        notes: `Pre-screened result: ${res.verdictLabelEn}. Documents required: ${res.requiredDocumentsEn.length}`,
        officialUrl: res.officialUrl,
      });

      showToast(t("schemes.trackedSuccess"));
      onApplicationCreated?.();
    } catch {
      showToast(t("common.error"));
    } finally {
      setSavingSchemeId(null);
    }
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div className="card max-w-2xl w-full bg-cream-50 text-forest-950 shadow-2xl animate-scale-up border-forest-200 flex flex-col my-auto max-h-[92vh]">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-forest-100 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-forest-100 text-forest-700 flex items-center justify-center">
              <Sparkles size={18} />
            </div>
            <div>
              <h3 className="font-serif font-bold text-sm sm:text-base text-forest-950">
                {t("schemes.wizardTitle")}
              </h3>
              <p className="text-xs text-ink-light">{t("schemes.wizardSubtitle")}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg text-ink-light hover:bg-forest-100">
            <X size={18} />
          </button>
        </div>

        {/* Wizard Content */}
        <div className="p-5 sm:p-6 overflow-y-auto flex-1 space-y-5">
          {/* Step 1: Land & Category */}
          {step === 1 && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-xs font-semibold text-forest-700">
                <span className="w-5 h-5 rounded-full bg-forest-200 flex items-center justify-center">
                  1
                </span>
                <span>{t("schemes.step1Title")}</span>
              </div>

              <div className="grid sm:grid-cols-2 gap-3">
                <div>
                  <label className="label-field">{t("settings.state")}</label>
                  <input
                    type="text"
                    value={criteria.state}
                    onChange={(e) => setCriteria({ ...criteria, state: e.target.value })}
                    className="input-field"
                  />
                </div>

                <div>
                  <label className="label-field">{t("settings.landArea")} (Acres)</label>
                  <input
                    type="number"
                    step="0.5"
                    min="0.1"
                    value={criteria.landAreaAcres}
                    onChange={(e) =>
                      setCriteria({ ...criteria, landAreaAcres: Number(e.target.value) || 1 })
                    }
                    className="input-field"
                  />
                </div>
              </div>

              <div>
                <label className="label-field">{t("schemes.farmerCategoryLabel")}</label>
                <select
                  value={criteria.farmerCategory}
                  onChange={(e) =>
                    setCriteria({
                      ...criteria,
                      farmerCategory: e.target.value as SchemeScreeningCriteria["farmerCategory"],
                    })
                  }
                  className="input-field"
                >
                  <option value="small_marginal">{t("schemes.catSmallMarginal")}</option>
                  <option value="women">{t("schemes.catWomen")}</option>
                  <option value="sc_st">{t("schemes.catScSt")}</option>
                  <option value="general">{t("schemes.catGeneral")}</option>
                </select>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="btn-primary text-xs flex items-center gap-1.5"
                >
                  {t("common.next")} <ChevronRight size={14} />
                </button>
              </div>
            </div>
          )}

          {/* Step 2: Crops & Infrastructure */}
          {step === 2 && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-xs font-semibold text-forest-700">
                <span className="w-5 h-5 rounded-full bg-forest-200 flex items-center justify-center">
                  2
                </span>
                <span>{t("schemes.step2Title")}</span>
              </div>

              <div className="grid sm:grid-cols-2 gap-3">
                <div>
                  <label className="label-field">{t("harvest.selectCrop")}</label>
                  <input
                    type="text"
                    value={criteria.cropCategory}
                    onChange={(e) => setCriteria({ ...criteria, cropCategory: e.target.value })}
                    className="input-field"
                    placeholder="e.g. Paddy / Tomato"
                  />
                </div>

                <div>
                  <label className="label-field">{t("settings.irrigationType")}</label>
                  <select
                    value={criteria.irrigationType}
                    onChange={(e) =>
                      setCriteria({ ...criteria, irrigationType: e.target.value })
                    }
                    className="input-field"
                  >
                    <option value="Drip Irrigation">Drip Irrigation</option>
                    <option value="Sprinkler Irrigation">Sprinkler Irrigation</option>
                    <option value="Rainfed / Dryland">Rainfed / Dryland</option>
                    <option value="Borewell / Open Well">Borewell / Open Well</option>
                    <option value="Canal / River">Canal / River</option>
                  </select>
                </div>
              </div>

              <div className="space-y-2 pt-1">
                <label className="flex items-center gap-2 text-xs text-ink cursor-pointer">
                  <input
                    type="checkbox"
                    checked={criteria.hasSoilReport}
                    onChange={(e) =>
                      setCriteria({ ...criteria, hasSoilReport: e.target.checked })
                    }
                    className="rounded text-forest-600 focus:ring-forest-500"
                  />
                  <span>{t("schemes.hasSoilReport")}</span>
                </label>

                <label className="flex items-center gap-2 text-xs text-ink cursor-pointer">
                  <input
                    type="checkbox"
                    checked={criteria.hasKccLoan}
                    onChange={(e) =>
                      setCriteria({ ...criteria, hasKccLoan: e.target.checked })
                    }
                    className="rounded text-forest-600 focus:ring-forest-500"
                  />
                  <span>{t("schemes.hasKccLoan")}</span>
                </label>
              </div>

              <div className="flex justify-between pt-2">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="btn-secondary text-xs flex items-center gap-1"
                >
                  <ChevronLeft size={14} /> {t("common.back")}
                </button>

                <button
                  type="button"
                  onClick={runScreening}
                  className="btn-primary text-xs flex items-center gap-1.5"
                >
                  <Sparkles size={14} /> {t("schemes.runScreeningBtn")}
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Screening Results */}
          {step === 3 && results && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-xs text-ink-light">
                  {t("schemes.evaluatedResults")} ({results.length})
                </p>
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="text-xs text-forest-700 hover:underline font-medium"
                >
                  {t("schemes.adjustAnswers")}
                </button>
              </div>

              <div className="space-y-3 max-h-[55vh] overflow-y-auto pr-1">
                {results.map((res) => (
                  <div
                    key={res.schemeId}
                    className={`card p-4 border transition-all ${
                      res.verdict === "likely_relevant"
                        ? "bg-forest-50/50 border-forest-300"
                        : res.verdict === "may_be_relevant"
                        ? "bg-wheat-50/40 border-wheat-200"
                        : "bg-cream-100/40 border-cream-200 opacity-70"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h4 className="font-bold text-sm text-forest-950">{res.schemeName}</h4>
                        <p className="text-xs text-ink-light mt-0.5">{res.description}</p>
                      </div>

                      <span
                        className={`chip text-[10px] font-semibold shrink-0 ${
                          res.verdict === "likely_relevant"
                            ? "bg-forest-100 text-forest-900 border-forest-300"
                            : res.verdict === "may_be_relevant"
                            ? "bg-wheat-100 text-wheat-900 border-wheat-300"
                            : "bg-cream-200 text-ink-light"
                        }`}
                      >
                        {language === "ta" ? res.verdictLabelTa : res.verdictLabelEn}
                      </span>
                    </div>

                    {/* Matched Criteria */}
                    <div className="mt-2.5 space-y-1">
                      {(language === "ta" ? res.matchedCriteriaTa : res.matchedCriteriaEn).map(
                        (crit, idx) => (
                          <div
                            key={idx}
                            className="flex items-center gap-1.5 text-[11px] text-forest-800"
                          >
                            <CheckCircle2 size={12} className="text-forest-600 shrink-0" />
                            <span>{crit}</span>
                          </div>
                        )
                      )}
                    </div>

                    {/* Required Documents */}
                    <div className="mt-3 pt-2.5 border-t border-forest-100">
                      <p className="text-[11px] font-semibold text-ink-light flex items-center gap-1 mb-1">
                        <FileCheck size={12} /> {t("schemes.requiredDocuments")}:
                      </p>
                      <ul className="text-[11px] text-ink space-y-0.5 pl-4 list-disc">
                        {(language === "ta"
                          ? res.requiredDocumentsTa
                          : res.requiredDocumentsEn
                        ).map((doc, idx) => (
                          <li key={idx}>{doc}</li>
                        ))}
                      </ul>
                    </div>

                    {/* Action Bar */}
                    <div className="mt-3.5 pt-2.5 border-t border-forest-100 flex items-center justify-between gap-2 flex-wrap text-xs">
                      <a
                        href={res.officialUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-forest-700 font-semibold hover:underline flex items-center gap-1"
                      >
                        {t("schemes.openOfficialPortal")} <ExternalLink size={12} />
                      </a>

                      <button
                        type="button"
                        onClick={() => handleTrackScheme(res)}
                        disabled={savingSchemeId === res.schemeId}
                        className="btn-primary text-xs py-1 px-2.5 flex items-center gap-1"
                      >
                        <BookmarkPlus size={13} />
                        {t("schemes.trackInTracker")}
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Informational Disclaimer */}
              <div className="card p-3 bg-wheat-100/60 border-wheat-200 text-xs text-forest-900 flex items-start gap-2">
                <Info size={15} className="text-clay-700 shrink-0 mt-0.5" />
                <p className="text-[11px] leading-relaxed">{t("schemes.wizardDisclaimer")}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
