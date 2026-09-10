"use client";

import { Printer, Download, X, FileText, CheckCircle } from "lucide-react";
import { useLanguage } from "@/hooks/useLanguage";
import { openPrintDialog, type FarmSummaryReportData } from "@/lib/utils/reportGenerator";

interface Props {
  data: FarmSummaryReportData;
  isOpen: boolean;
  onClose: () => void;
}

export function FarmSummaryReportModal({ data, isOpen, onClose }: Props) {
  const { t, language } = useLanguage();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div className="card max-w-2xl w-full bg-white text-forest-950 shadow-2xl animate-scale-up border-forest-300 flex flex-col my-auto max-h-[95vh]">
        {/* Controls Bar (Hidden during print) */}
        <div className="p-4 bg-forest-900 text-cream-50 flex items-center justify-between print:hidden">
          <div className="flex items-center gap-2">
            <FileText size={18} className="text-wheat-300" />
            <h3 className="font-serif font-bold text-sm sm:text-base">
              {t("reports.farmSummaryTitle")}
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

        {/* Printable Document Body */}
        <div className="p-6 sm:p-8 overflow-y-auto space-y-6 text-xs text-forest-950 print:p-0 print:text-black">
          {/* Header */}
          <div className="border-b-2 border-forest-800 pb-4 flex justify-between items-start">
            <div>
              <h1 className="font-serif text-xl font-bold text-forest-950 tracking-tight">
                AGROGUIDE — {t("reports.farmSummaryCard")}
              </h1>
              <p className="text-xs text-forest-700 font-medium mt-0.5">
                {data.farm.name} · {data.farm.location || data.district}
              </p>
            </div>
            <div className="text-right">
              <p className="text-[11px] text-ink-light">{t("reports.generatedOn")}:</p>
              <p className="font-semibold text-xs">{data.generatedAt}</p>
            </div>
          </div>

          {/* Farmer & Farm Overview */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-cream-50 p-3.5 rounded-xl border border-forest-100 print:bg-transparent print:border-gray-300">
            <div>
              <span className="text-[10px] uppercase tracking-wider text-ink-light">
                {t("reports.farmer")}
              </span>
              <p className="font-bold text-xs mt-0.5">{data.farmerName}</p>
            </div>
            <div>
              <span className="text-[10px] uppercase tracking-wider text-ink-light">
                {t("farm.acres")}
              </span>
              <p className="font-bold text-xs mt-0.5">{data.farm.areaAcres} Acres</p>
            </div>
            <div>
              <span className="text-[10px] uppercase tracking-wider text-ink-light">
                {t("settings.soilType")}
              </span>
              <p className="font-bold text-xs mt-0.5">{data.farm.soilType || "–"}</p>
            </div>
            <div>
              <span className="text-[10px] uppercase tracking-wider text-ink-light">
                {t("settings.irrigationType")}
              </span>
              <p className="font-bold text-xs mt-0.5">{data.farm.irrigationType || "–"}</p>
            </div>
          </div>

          {/* Active Crops Section */}
          <div>
            <h4 className="font-bold text-xs uppercase tracking-wider text-forest-800 mb-2 border-b border-forest-100 pb-1">
              {t("reports.activeCropsTitle")} ({data.activeCrops.length})
            </h4>
            {data.activeCrops.length === 0 ? (
              <p className="text-ink-light italic">No active crops registered.</p>
            ) : (
              <div className="grid sm:grid-cols-2 gap-2">
                {data.activeCrops.map((c) => (
                  <div
                    key={c.id}
                    className="p-2.5 rounded-lg border border-forest-200 bg-white print:border-gray-300"
                  >
                    <div className="flex justify-between items-center font-bold">
                      <span>{c.name}</span>
                      <span className="text-[11px] capitalize text-forest-700 font-semibold">
                        {c.stage.replace(/_/g, " ")}
                      </span>
                    </div>
                    <div className="mt-1 text-[11px] text-ink-light flex justify-between">
                      <span>Sown: {c.sowingDate}</span>
                      <span>Area: {c.areaAcres} ac</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Soil Report Summary */}
          {data.latestSoilReport && (
            <div>
              <h4 className="font-bold text-xs uppercase tracking-wider text-forest-800 mb-2 border-b border-forest-100 pb-1">
                {t("reports.latestSoilReport")}
              </h4>
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 bg-cream-50 p-2.5 rounded-xl border border-forest-100 text-center print:bg-transparent print:border-gray-300">
                <div>
                  <span className="text-[10px] text-ink-light">pH</span>
                  <p className="font-bold">{data.latestSoilReport.ph ?? "–"}</p>
                </div>
                <div>
                  <span className="text-[10px] text-ink-light">N (kg/ha)</span>
                  <p className="font-bold">{data.latestSoilReport.nitrogen ?? "–"}</p>
                </div>
                <div>
                  <span className="text-[10px] text-ink-light">P (kg/ha)</span>
                  <p className="font-bold">{data.latestSoilReport.phosphorus ?? "–"}</p>
                </div>
                <div>
                  <span className="text-[10px] text-ink-light">K (kg/ha)</span>
                  <p className="font-bold">{data.latestSoilReport.potassium ?? "–"}</p>
                </div>
                <div>
                  <span className="text-[10px] text-ink-light">EC (dS/m)</span>
                  <p className="font-bold">{data.latestSoilReport.ec ?? "–"}</p>
                </div>
                <div>
                  <span className="text-[10px] text-ink-light">OC (%)</span>
                  <p className="font-bold">{data.latestSoilReport.organicCarbon ?? "–"}</p>
                </div>
              </div>
            </div>
          )}

          {/* Financial Summary */}
          <div>
            <h4 className="font-bold text-xs uppercase tracking-wider text-forest-800 mb-2 border-b border-forest-100 pb-1">
              {t("reports.financialSummary")}
            </h4>
            <div className="grid grid-cols-3 gap-2">
              <div className="p-2.5 rounded-lg border border-forest-100 bg-cream-50 print:bg-transparent print:border-gray-300">
                <span className="text-[10px] text-ink-light">{t("profitability.cultivationCost")}</span>
                <p className="font-bold text-sm text-forest-950 mt-0.5">
                  ₹{data.totalExpenses.toLocaleString("en-IN")}
                </p>
              </div>
              <div className="p-2.5 rounded-lg border border-forest-100 bg-cream-50 print:bg-transparent print:border-gray-300">
                <span className="text-[10px] text-ink-light">{t("profitability.netRealization")}</span>
                <p className="font-bold text-sm text-forest-950 mt-0.5">
                  ₹{data.totalSalesRealization.toLocaleString("en-IN")}
                </p>
              </div>
              <div className="p-2.5 rounded-lg border border-forest-100 bg-cream-50 print:bg-transparent print:border-gray-300">
                <span className="text-[10px] text-ink-light">{t("profitability.netProfit")}</span>
                <p
                  className={`font-bold text-sm mt-0.5 ${
                    data.netProfit >= 0 ? "text-forest-700" : "text-rust-600"
                  }`}
                >
                  ₹{data.netProfit.toLocaleString("en-IN")}
                </p>
              </div>
            </div>
          </div>

          {/* Disclaimer Footer */}
          <div className="pt-4 border-t border-forest-100 text-[10px] text-ink-light text-center leading-normal">
            <p>{t("reports.disclaimer")}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
