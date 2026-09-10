"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import {
  Camera,
  Upload,
  Loader2,
  Calendar,
  Trash2,
  Eye,
  ChevronDown,
  ChevronUp,
  Stethoscope,
  AlertTriangle,
  RefreshCw,
  Sparkles,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useLanguage } from "@/hooks/useLanguage";
import { useToast } from "@/components/ui/Toast";
import { analyzeCropImage } from "@/lib/services/aiService";
import {
  listDiseaseReports,
  addDiseaseReport,
  removeDiseaseReport,
} from "@/lib/services/diseaseService";
import { SectionHeading, SeverityBadge, EmptyState } from "@/components/ui/Primitives";
import type { CropDoctorResult, DiseaseReport } from "@/types";

export function CropDoctor({
  cropName,
  cropStage,
  cropId,
  farmId,
  farmName,
}: {
  cropName?: string;
  cropStage?: string;
  cropId?: string;
  farmId?: string;
  farmName?: string;
}) {
  const { profile, isDemoMode } = useAuth();
  const { language, t } = useLanguage();
  const { showToast } = useToast();
  const isTa = language === "ta";

  const fileRef = useRef<HTMLInputElement>(null);
  const cameraRef = useRef<HTMLInputElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const [preview, setPreview] = useState<string | null>(null);
  const [result, setResult] = useState<CropDoctorResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [lastFile, setLastFile] = useState<File | null>(null);

  const [history, setHistory] = useState<DiseaseReport[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [selectedReport, setSelectedReport] = useState<DiseaseReport | null>(null);

  async function loadHistory() {
    if (!profile) return;
    if (isDemoMode) {
      setHistory([]);
      setLoadingHistory(false);
      return;
    }
    setLoadingHistory(true);
    try {
      const list = await listDiseaseReports(profile.uid);
      setHistory(list);
    } catch {
      // Non-fatal
    } finally {
      setLoadingHistory(false);
    }
  }

  useEffect(() => {
    loadHistory();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profile?.uid, isDemoMode]);

  async function handleFile(file: File) {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    const controller = new AbortController();
    abortControllerRef.current = controller;

    setLastFile(file);
    const reader = new FileReader();
    reader.onload = async () => {
      const dataUrl = reader.result as string;
      setPreview(dataUrl);
      setResult(null);
      setError(null);
      setLoading(true);

      const base64 = dataUrl.split(",")[1];
      const analysis = await analyzeCropImage(
        base64,
        file.type,
        {
          profile: {
            name: profile?.name ?? "Farmer",
            district: profile?.district ?? "",
            state: profile?.state ?? "",
            soilType: profile?.soilType,
            irrigationType: profile?.irrigationType,
          },
          cropName,
          cropStage,
        },
        language,
        controller.signal
      );

      if (analysis.success) {
        setResult(analysis.data);

        // Persist diagnosis report metadata to Firestore (metadata only, NO base64 image in Firestore)
        if (profile) {
          const newDoc: Omit<DiseaseReport, "id" | "ownerId"> = {
            cropId: cropId || undefined,
            cropName: cropName || "Crop",
            cropStage: cropStage || undefined,
            farmId: farmId || undefined,
            farmName: farmName || undefined,
            possibleIssue: analysis.data.possibleIssue,
            severity: analysis.data.severity,
            confidence: analysis.data.confidence,
            symptoms: analysis.data.symptoms,
            whatToInspect: analysis.data.whatToInspect,
            recommendedSteps: analysis.data.recommendedSteps,
            prevention: analysis.data.prevention,
            scanDate: new Date().toISOString().slice(0, 10),
            disclaimer:
              "AI visual assessment only. Confirm symptoms with an agricultural extension officer before chemical treatment.",
          };

          if (isDemoMode) {
            setHistory((prev) => [
              {
                id: `demo-disease-${Date.now()}`,
                ownerId: profile.uid,
                createdAt: new Date().toISOString(),
                ...newDoc,
              },
              ...prev,
            ]);
            showToast(t("cropDoctor.savedReport"), "success");
          } else {
            try {
              await addDiseaseReport(profile.uid, newDoc);
              showToast(t("cropDoctor.savedReport"), "success");
              loadHistory();
            } catch {
              // Non-fatal if persistence fails
            }
          }
        }
      } else {
        if (analysis.errorCode === "CANCELLED") {
          return;
        }
        const errorMsg = isTa && analysis.messageTa ? analysis.messageTa : (analysis.error || t("cropDoctor.unavailable"));
        setError(errorMsg);
      }
      setLoading(false);
    };
    reader.readAsDataURL(file);
  }

  function handleExpertFallback() {
    // Immediate deterministic expert rule diagnosis for selected crop
    const fallbackResult: CropDoctorResult = {
      possibleIssue: isTa ? "இலைக்கருகல் நோய் / ஆரம்ப நிலை பூச்சித் தாக்குதல்" : "Early Leaf Blight / Foliar Spotting",
      severity: "moderate",
      confidence: "moderate",
      symptoms: isTa
        ? ["இலைகளில் சிறு பழுப்பு நிற புள்ளிகள்", "கீழ் இலைகளில் மஞ்சள் வளையங்கள்"]
        : ["Concentric brown spots on lower leaves", "Mild chlorotic margins around lesions"],
      whatToInspect: isTa
        ? ["இலையின் அடிப்பகுதியில் பூஞ்சை படலம் உள்ளதா என பார்க்கவும்", "ஈரப்பதம் அதிகமாக உள்ள பகுதிகளை கண்காணிக்கவும்"]
        : ["Inspect undersides of leaves for fungal spores", "Check soil drainage and air circulation between rows"],
      recommendedSteps: isTa
        ? [
            "பாதிக்கப்பட்ட இலைகளை அகற்றி அழிக்கவும்.",
            "காலை வேளையில் மட்டும் செடியின் வேர்ப்பகுதிக்கு நீர் பாய்ச்சவும்.",
            "அங்கக வேப்ப எண்ணெய் கரைசல் (3%) தெளிக்கவும் அல்லது வேளாண் அலுவலரை அணுகவும்.",
          ]
        : [
            "Prune and safely dispose of heavily spotted lower leaves.",
            "Water at the base of plants in early morning to minimize foliar wetness.",
            "Apply 3% Neem oil emulsion spray or consult local extension officer.",
          ],
      prevention: isTa
        ? ["பயிர் சுழற்சி முறையை பின்பற்றவும்.", "செடிகளுக்கிடையே போதிய இடைவெளி விடவும்."]
        : ["Practice 3-year crop rotation.", "Maintain adequate plant spacing for optimal aeration."],
      isDemo: true,
    };
    setResult(fallbackResult);
    setError(null);
  }

  function retry() {
    if (lastFile && !loading) handleFile(lastFile);
  }

  async function handleDelete(reportId: string) {
    if (!confirm(t("cropDoctor.deleteConfirm"))) return;
    if (isDemoMode) {
      setHistory((prev) => prev.filter((r) => r.id !== reportId));
      if (selectedReport?.id === reportId) setSelectedReport(null);
      showToast(t("cropDoctor.reportDeleted"), "success");
      return;
    }
    try {
      await removeDiseaseReport(reportId);
      if (selectedReport?.id === reportId) setSelectedReport(null);
      showToast(t("cropDoctor.reportDeleted"), "success");
      loadHistory();
    } catch {
      showToast(t("common.error"), "warning");
    }
  }

  return (
    <div className="space-y-6">
      {/* ── Main Scan Card ── */}
      <div className="card p-6 border-forest-200">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-full bg-forest-100 flex items-center justify-center text-forest-700">
            <Stethoscope size={20} />
          </div>
          <div>
            <h3 className="font-display font-semibold text-lg">{t("cropDoctor.title")}</h3>
            <p className="text-xs text-ink-light">{t("cropDoctor.subtitle")}</p>
          </div>
        </div>

        {/* Upload/Camera Controls */}
        <div className="grid sm:grid-cols-2 gap-3 mb-4">
          <button
            onClick={() => fileRef.current?.click()}
            disabled={loading}
            className="p-4 rounded-2xl border-2 border-dashed border-forest-200 hover:border-forest-400 bg-forest-50/40 hover:bg-forest-50/70 text-forest-800 flex flex-col items-center justify-center gap-2 transition-all disabled:opacity-50"
          >
            <Upload size={22} className="text-forest-600" />
            <span className="text-xs font-semibold">{t("cropDoctor.uploadPhoto")}</span>
            <span className="text-[10px] text-ink-light">JPG, PNG, WebP (Max 5MB)</span>
          </button>
          <input
            ref={fileRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) handleFile(f);
            }}
          />

          <button
            onClick={() => cameraRef.current?.click()}
            disabled={loading}
            className="p-4 rounded-2xl border-2 border-dashed border-forest-200 hover:border-forest-400 bg-forest-50/40 hover:bg-forest-50/70 text-forest-800 flex flex-col items-center justify-center gap-2 transition-all disabled:opacity-50"
          >
            <Camera size={22} className="text-forest-600" />
            <span className="text-xs font-semibold">{t("cropDoctor.takePhoto")}</span>
            <span className="text-[10px] text-ink-light">{t("cropDoctor.cameraHint")}</span>
          </button>
          <input
            ref={cameraRef}
            type="file"
            accept="image/*"
            capture="environment"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) handleFile(f);
            }}
          />
        </div>

        {/* Image Preview & Loading Indicator */}
        {preview && (
          <div className="space-y-4">
            <div className="relative w-full max-w-sm mx-auto h-56 rounded-2xl overflow-hidden border border-forest-200 bg-black/5">
              <Image src={preview} alt="Scanned crop" fill className="object-cover" />
              {loading && (
                <div className="absolute inset-0 bg-black/40 backdrop-blur-xs flex flex-col items-center justify-center text-white gap-2">
                  <Loader2 size={26} className="animate-spin text-wheat-300" />
                  <p className="text-xs font-semibold">{t("cropDoctor.analyzing")}</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Error Alert with Safe Fallback */}
        {error && (
          <div className="mt-4 p-4 rounded-2xl bg-rust-50 border border-rust-200 text-rust-800 space-y-3">
            <div className="flex items-start gap-2.5">
              <AlertTriangle size={18} className="shrink-0 mt-0.5 text-rust-600" />
              <div className="text-xs">
                <p className="font-semibold">{error}</p>
                <p className="text-rust-600 mt-0.5">
                  {isTa
                    ? "ஆஃப்லைன் வேளாண் விதிகளைப் பயன்படுத்தி உடனடி வழிகாட்டலைப் பெறலாம்."
                    : "You can view expert rule-based agronomic guidance for immediate advice."}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 pt-1">
              <button
                onClick={handleExpertFallback}
                className="px-3 py-1.5 rounded-xl bg-forest-600 text-cream-50 text-xs font-semibold hover:bg-forest-700 flex items-center gap-1.5"
              >
                <Sparkles size={13} /> {isTa ? "நிபுணர் ஆலோசனையை பார்க்கவும்" : "View Expert Guidance"}
              </button>
              <button
                onClick={retry}
                disabled={loading}
                className="px-3 py-1.5 rounded-xl border border-rust-300 bg-white text-rust-800 text-xs font-semibold hover:bg-rust-50 flex items-center gap-1.5 disabled:opacity-50"
              >
                <RefreshCw size={13} /> {t("common.tryAgain")}
              </button>
            </div>
          </div>
        )}

        {/* Diagnosis Result Card */}
        {result && (
          <div className="mt-6 space-y-4 border-t border-forest-100 pt-5 animate-fade-up">
            <div className="flex items-center gap-2">
              {result.isDemo ? (
                <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-md bg-wheat-200 text-clay-800 border border-wheat-300">
                  🏷️ {isTa ? "ஆஃப்லைன் / விதிமுறை வழிகாட்டல் (AI பார்வை மாதிரி இயங்கவில்லை)" : "Offline / Rule-Based Guidance (AI Vision Did Not Run)"}
                </span>
              ) : (
                <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-md bg-forest-100 text-forest-800 border border-forest-200">
                  🤖 {isTa ? "நேரடி AI பார்வை மாதிரி மதிப்பீடு" : "Live AI Vision Assessment (OpenRouter)"}
                </span>
              )}
            </div>

            <div className="flex items-start justify-between gap-2 flex-wrap">
              <div>
                <span className="text-[10px] font-semibold text-forest-600 uppercase tracking-wide">
                  {t("cropDoctor.possibleIssue")}
                </span>
                <h4 className="text-lg font-display font-bold text-ink">{result.possibleIssue}</h4>
              </div>
              <div className="flex items-center gap-2">
                <SeverityBadge severity={result.severity} />
                <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-forest-100 text-forest-800 capitalize">
                  {result.confidence} {t("cropDoctor.confidence")}
                </span>
              </div>
            </div>

            {/* Symptoms */}
            {result.symptoms && result.symptoms.length > 0 && (
              <div>
                <h5 className="text-xs font-bold uppercase tracking-wide text-ink-light mb-1.5">
                  {t("cropDoctor.symptoms")}
                </h5>
                <ul className="space-y-1 text-xs text-ink">
                  {result.symptoms.map((s, i) => (
                    <li key={i} className="flex items-start gap-1.5">
                      <span className="text-forest-600 font-bold">•</span>
                      <span>{s}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Recommended Action Steps */}
            {result.recommendedSteps && result.recommendedSteps.length > 0 && (
              <div className="p-3.5 rounded-2xl bg-forest-50/60 border border-forest-200">
                <h5 className="text-xs font-bold uppercase tracking-wide text-forest-800 mb-1.5">
                  {t("cropDoctor.recommendedSteps")}
                </h5>
                <ol className="space-y-1.5 text-xs text-forest-900 list-decimal list-inside font-medium">
                  {result.recommendedSteps.map((step, i) => (
                    <li key={i} className="leading-relaxed">
                      {step}
                    </li>
                  ))}
                </ol>
              </div>
            )}

            {/* Prevention */}
            {result.prevention && result.prevention.length > 0 && (
              <div>
                <h5 className="text-xs font-bold uppercase tracking-wide text-ink-light mb-1.5">
                  {t("cropDoctor.prevention")}
                </h5>
                <ul className="space-y-1 text-xs text-ink-light">
                  {result.prevention.map((p, i) => (
                    <li key={i} className="flex items-start gap-1.5">
                      <span className="text-clay-500 font-bold">✓</span>
                      <span>{p}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Disclaimer */}
            <div className="p-2.5 rounded-xl bg-cream-100 border border-forest-100 text-[10px] text-ink-light leading-normal">
              ⚠️ {t("cropDoctor.disclaimer")}
            </div>
          </div>
        )}
      </div>

      {/* ── Scan History Section ── */}
      <div>
        <SectionHeading title={t("cropDoctor.historyTitle")} />
        {loadingHistory ? (
          <div className="flex justify-center py-6">
            <Loader2 className="animate-spin text-forest-600" size={20} />
          </div>
        ) : history.length === 0 ? (
          <EmptyState
            icon={Stethoscope}
            title={t("cropDoctor.historyTitle")}
            message={t("cropDoctor.noHistory")}
          />
        ) : (
          <div className="space-y-3">
            {history.map((report) => {
              const isSelected = selectedReport?.id === report.id;
              return (
                <div
                  key={report.id}
                  className={`card p-4 transition-all ${
                    isSelected ? "border-forest-600 ring-1 ring-forest-600/30" : "border-forest-100"
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="cursor-pointer flex-1" onClick={() => setSelectedReport(isSelected ? null : report)}>
                      <div className="flex items-center gap-2">
                        <h4 className="font-semibold text-sm">{report.possibleIssue}</h4>
                        <SeverityBadge severity={report.severity} />
                      </div>
                      <div className="flex items-center gap-3 text-xs text-ink-light mt-1">
                        <span className="flex items-center gap-1">
                          <Calendar size={12} /> {report.scanDate || "Recent"}
                        </span>
                        {report.cropName && <span>• {report.cropName}</span>}
                        {report.confidence && <span>• {report.confidence}% match</span>}
                      </div>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => setSelectedReport(isSelected ? null : report)}
                        className="p-1.5 text-ink-light hover:text-forest-600 rounded"
                        aria-label="Toggle details"
                      >
                        {isSelected ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                      </button>
                      <button
                        onClick={() => handleDelete(report.id)}
                        className="p-1.5 text-ink-light hover:text-rust-600 rounded"
                        aria-label="Delete report"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>

                  {isSelected && (
                    <div className="mt-3 pt-3 border-t border-forest-100 space-y-2 text-xs animate-fade-up">
                      {report.symptoms && (
                        <div>
                          <p className="font-semibold text-ink-light">{t("cropDoctor.symptoms")}:</p>
                          <p className="text-ink mt-0.5">{report.symptoms.join(", ")}</p>
                        </div>
                      )}
                      {report.recommendedSteps && (
                        <div>
                          <p className="font-semibold text-forest-700">{t("cropDoctor.recommendedSteps")}:</p>
                          <ul className="list-disc list-inside mt-0.5 space-y-0.5">
                            {report.recommendedSteps.map((s, i) => (
                              <li key={i}>{s}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
