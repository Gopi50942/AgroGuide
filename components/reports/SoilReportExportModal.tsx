"use client";

import { Printer, X, FileText, CheckCircle } from "lucide-react";
import { useLanguage } from "@/hooks/useLanguage";
import { openPrintDialog } from "@/lib/utils/reportGenerator";
import type { SoilReport, FarmerProfile } from "@/types";

interface Props {
  report: SoilReport;
  profile?: FarmerProfile | null;
  isOpen: boolean;
  onClose: () => void;
}

export function SoilReportExportModal({ report, profile, isOpen, onClose }: Props) {
  const { language, t } = useLanguage();
  const isTa = language === "ta";

  if (!isOpen) return null;

  const generatedDate = new Date().toLocaleDateString(isTa ? "ta-IN" : "en-IN", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 overflow-y-auto print:static print:p-0 print:bg-white print:overflow-visible">
      <div className="card max-w-xl w-full bg-white text-forest-950 shadow-2xl animate-scale-up border-forest-300 flex flex-col my-auto max-h-[95vh] printable-soil-card-wrapper print:max-h-none print:shadow-none print:border-none">
        {/* Controls Header (Hidden in Print) */}
        <div className="p-4 bg-forest-900 text-cream-50 flex items-center justify-between print:hidden">
          <div className="flex items-center gap-2">
            <FileText size={18} className="text-wheat-300" />
            <h3 className="font-serif font-bold text-sm sm:text-base">
              {t("reports.soilReportExportTitle")}
            </h3>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={openPrintDialog}
              className="btn-primary text-xs py-1.5 px-3 bg-wheat-400 text-forest-950 hover:bg-wheat-300 flex items-center gap-1.5 font-bold"
            >
              <Printer size={14} /> {t("reports.printPdfBtn")}
            </button>
            <button
              onClick={onClose}
              className="p-1 text-cream-300 hover:text-white rounded"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Printable Soil Card */}
        <div className="p-6 sm:p-8 overflow-y-auto space-y-6 text-xs text-forest-950 print:p-0 print:space-y-4 print:text-black print:overflow-visible print-page-avoid">
          {/* Header */}
          <div className="border-b-2 border-forest-800 pb-3 flex justify-between items-start print:border-black">
            <div>
              <h1 className="font-serif text-lg sm:text-xl font-bold text-forest-950 tracking-tight print:text-black">
                AGROGUIDE — {t("reports.soilCardTitle")}
              </h1>
              <p className="text-xs text-forest-700 font-medium mt-0.5 print:text-gray-700">
                {report.farmName || "Farm Plot"} · {profile?.district || ""} {profile?.state ? `, ${profile.state}` : ""}
              </p>
            </div>
            <div className="text-right">
              <p className="text-[10px] text-ink-light print:text-gray-600">{t("reports.generatedOn")}:</p>
              <p className="font-semibold text-xs">{generatedDate}</p>
            </div>
          </div>

          {/* Farmer & Plot Metadata */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 bg-cream-50 p-3.5 rounded-xl border border-forest-100 print:bg-white print:border-gray-400 print:p-2.5">
            <div>
              <span className="text-[10px] uppercase text-ink-light print:text-gray-600 font-bold">{t("reports.farmer")}</span>
              <p className="font-bold text-xs mt-0.5">{profile?.name || "Farmer"}</p>
            </div>
            <div>
              <span className="text-[10px] uppercase text-ink-light print:text-gray-600 font-bold">{t("soil.sampleDate")}</span>
              <p className="font-bold text-xs mt-0.5">{report.sampleDate || "–"}</p>
            </div>
            <div>
              <span className="text-[10px] uppercase text-ink-light print:text-gray-600 font-bold">{t("settings.soilType")}</span>
              <p className="font-bold text-xs mt-0.5">{report.soilType || profile?.soilType || "–"}</p>
            </div>
          </div>

          {/* Test Parameters Matrix */}
          <div>
            <h4 className="font-bold text-xs uppercase tracking-wider text-forest-800 mb-2 border-b border-forest-100 pb-1 print:border-gray-400 print:text-black">
              {t("reports.soilParameters")}
            </h4>
            <div className="grid grid-cols-3 gap-2.5 text-center">
              {/* Row 1: Reaction, Salinity, Organic Matter */}
              <div className="p-3 bg-cream-50 rounded-xl border border-forest-100 print:bg-white print:border-gray-400">
                <span className="text-[10px] text-ink-light font-bold print:text-gray-600">pH (Soil Reaction)</span>
                <p className="font-bold text-base mt-0.5 text-forest-900 print:text-black">{report.ph ?? "–"}</p>
              </div>
              <div className="p-3 bg-cream-50 rounded-xl border border-forest-100 print:bg-white print:border-gray-400">
                <span className="text-[10px] text-ink-light font-bold print:text-gray-600">EC (dS/m - Salinity)</span>
                <p className="font-bold text-base mt-0.5 text-forest-900 print:text-black">{report.ec ?? "–"}</p>
              </div>
              <div className="p-3 bg-cream-50 rounded-xl border border-forest-100 print:bg-white print:border-gray-400">
                <span className="text-[10px] text-ink-light font-bold print:text-gray-600">Organic Carbon (%)</span>
                <p className="font-bold text-base mt-0.5 text-forest-900 print:text-black">{report.organicCarbon ?? "–"}</p>
              </div>

              {/* Row 2: Macronutrients N, P, K */}
              <div className="p-3 bg-cream-50 rounded-xl border border-forest-100 print:bg-white print:border-gray-400">
                <span className="text-[10px] text-ink-light font-bold print:text-gray-600">Nitrogen (N - kg/ha)</span>
                <p className="font-bold text-base mt-0.5 text-forest-900 print:text-black">{report.nitrogen ?? "–"}</p>
              </div>
              <div className="p-3 bg-cream-50 rounded-xl border border-forest-100 print:bg-white print:border-gray-400">
                <span className="text-[10px] text-ink-light font-bold print:text-gray-600">Phosphorus (P - kg/ha)</span>
                <p className="font-bold text-base mt-0.5 text-forest-900 print:text-black">{report.phosphorus ?? "–"}</p>
              </div>
              <div className="p-3 bg-cream-50 rounded-xl border border-forest-100 print:bg-white print:border-gray-400">
                <span className="text-[10px] text-ink-light font-bold print:text-gray-600">Potassium (K - kg/ha)</span>
                <p className="font-bold text-base mt-0.5 text-forest-900 print:text-black">{report.potassium ?? "–"}</p>
              </div>
            </div>
          </div>

          {/* Recommendations Summary */}
          {report.recommendationSummary && (
            <div>
              <h4 className="font-bold text-xs uppercase tracking-wider text-forest-800 mb-2 border-b border-forest-100 pb-1 print:border-gray-400 print:text-black">
                {t("reports.agronomicGuidance")}
              </h4>
              <div className="p-3.5 bg-cream-50 rounded-xl border border-forest-100 leading-relaxed print:bg-white print:border-gray-400 print:p-2.5">
                <p className="text-xs">{report.recommendationSummary}</p>
              </div>
            </div>
          )}

          {/* Official Verification & Disclaimer */}
          <div className="pt-3 border-t border-forest-100 text-[10px] text-ink-light text-center leading-normal print:border-gray-400 print:text-gray-600">
            <p>{t("reports.disclaimer")}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
