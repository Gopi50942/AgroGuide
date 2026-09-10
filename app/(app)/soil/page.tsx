"use client";

import { useEffect, useMemo, useState, useRef } from "react";
import Link from "next/link";
import {
  FlaskConical,
  Upload,
  Calendar,
  Sprout,
  Plus,
  Edit2,
  Trash2,
  Loader2,
  CheckCircle2,
  AlertCircle,
  FileText,
  Printer,
} from "lucide-react";
import { SoilReportExportModal } from "@/components/reports/SoilReportExportModal";
import { SectionHeading, EmptyState } from "@/components/ui/Primitives";
import { useAuth } from "@/hooks/useAuth";
import { useLanguage } from "@/hooks/useLanguage";
import { useToast } from "@/components/ui/Toast";
import { listFarms } from "@/lib/services/farmService";
import {
  listSoilReports,
  addSoilReport,
  updateSoilReport,
  removeSoilReport,
  getSoilGuidanceKeys,
} from "@/lib/services/soilService";
import { DEMO_FARMS, DEMO_SOIL_REPORTS } from "@/data/demoData";
import type { Farm, SoilReport } from "@/types";

interface FormState {
  farmId: string;
  sampleDate: string;
  ph: string;
  nitrogen: string;
  phosphorus: string;
  potassium: string;
  ec: string;
  organicCarbon: string;
  notes: string;
}

const INITIAL_FORM: FormState = {
  farmId: "",
  sampleDate: new Date().toISOString().slice(0, 10),
  ph: "",
  nitrogen: "",
  phosphorus: "",
  potassium: "",
  ec: "",
  organicCarbon: "",
  notes: "",
};

export default function SoilHealthPage() {
  const { profile, isDemoMode } = useAuth();
  const { t } = useLanguage();
  const { showToast } = useToast();
  const formTopRef = useRef<HTMLDivElement>(null);

  const [farms, setFarms] = useState<Farm[]>([]);
  const [reports, setReports] = useState<SoilReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [exportingReport, setExportingReport] = useState<SoilReport | null>(null);
  const [form, setForm] = useState<FormState>(INITIAL_FORM);

  const FIELDS: { key: keyof Pick<FormState, "ph" | "nitrogen" | "phosphorus" | "potassium" | "ec" | "organicCarbon">; labelKey: string; unit: string; step: string }[] = [
    { key: "ph", labelKey: "soil.ph", unit: "", step: "0.01" },
    { key: "nitrogen", labelKey: "soil.nitrogen", unit: "kg/ha", step: "1" },
    { key: "phosphorus", labelKey: "soil.phosphorus", unit: "kg/ha", step: "1" },
    { key: "potassium", labelKey: "soil.potassium", unit: "kg/ha", step: "1" },
    { key: "ec", labelKey: "soil.ec", unit: "dS/m", step: "0.01" },
    { key: "organicCarbon", labelKey: "soil.organicCarbon", unit: "%", step: "0.01" },
  ];

  async function loadData() {
    if (!profile) return;
    if (isDemoMode) {
      setFarms(DEMO_FARMS);
      setReports(DEMO_SOIL_REPORTS);
      if (DEMO_FARMS[0]) {
        setForm((prev) => ({ ...prev, farmId: prev.farmId || DEMO_FARMS[0].id }));
      }
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const [fList, rList] = await Promise.all([
        listFarms(profile.uid),
        listSoilReports(profile.uid),
      ]);
      setFarms(fList);
      setReports(rList);
      if (fList.length === 1 && fList[0]) {
        setForm((prev) => ({ ...prev, farmId: prev.farmId || fList[0].id }));
      }
    } catch {
      showToast(t("common.error"), "warning");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profile?.uid, isDemoMode]);

  // Compute live agronomic guidance based on current form inputs
  const liveGuidance = useMemo(() => {
    const phVal = form.ph ? parseFloat(form.ph) : undefined;
    const nVal = form.nitrogen ? parseFloat(form.nitrogen) : undefined;
    const ocVal = form.organicCarbon ? parseFloat(form.organicCarbon) : undefined;

    const keys = getSoilGuidanceKeys({ ph: phVal, nitrogen: nVal, organicCarbon: ocVal });
    return keys.map((k) => (t as any)(k) || k);
  }, [form.ph, form.nitrogen, form.organicCarbon, t]);

  function handleEdit(report: SoilReport) {
    setEditingId(report.id);
    setForm({
      farmId: report.farmId || (farms[0]?.id ?? ""),
      sampleDate: report.sampleDate || new Date().toISOString().slice(0, 10),
      ph: report.ph !== undefined ? String(report.ph) : "",
      nitrogen: report.nitrogen !== undefined ? String(report.nitrogen) : "",
      phosphorus: report.phosphorus !== undefined ? String(report.phosphorus) : "",
      potassium: report.potassium !== undefined ? String(report.potassium) : "",
      ec: report.ec !== undefined ? String(report.ec) : "",
      organicCarbon: report.organicCarbon !== undefined ? String(report.organicCarbon) : "",
      notes: report.notes || "",
    });
    formTopRef.current?.scrollIntoView({ behavior: "smooth" });
  }

  function handleCancelEdit() {
    setEditingId(null);
    setForm({
      ...INITIAL_FORM,
      farmId: farms.length === 1 ? farms[0].id : "",
    });
  }

  async function handleDelete(reportId: string) {
    if (!confirm(t("soil.deleteConfirm"))) return;

    if (isDemoMode) {
      setReports((prev) => prev.filter((r) => r.id !== reportId));
      showToast(t("soil.deletedSuccess"), "success");
      return;
    }

    try {
      await removeSoilReport(reportId);
      showToast(t("soil.deletedSuccess"), "success");
      loadData();
    } catch {
      showToast(t("common.error"), "warning");
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!profile) return;

    // Validate farm selection
    const selectedFarmId = form.farmId || (farms.length === 1 ? farms[0].id : "");
    if (!selectedFarmId && farms.length > 0) {
      showToast(t("soil.farmRequired"), "warning");
      return;
    }

    // Parse and validate numbers
    const ph = form.ph ? parseFloat(form.ph) : undefined;
    const nitrogen = form.nitrogen ? parseFloat(form.nitrogen) : undefined;
    const phosphorus = form.phosphorus ? parseFloat(form.phosphorus) : undefined;
    const potassium = form.potassium ? parseFloat(form.potassium) : undefined;
    const ec = form.ec ? parseFloat(form.ec) : undefined;
    const organicCarbon = form.organicCarbon ? parseFloat(form.organicCarbon) : undefined;

    const numList = [ph, nitrogen, phosphorus, potassium, ec, organicCarbon].filter(
      (v) => v !== undefined
    );

    if (numList.some((v) => isNaN(v!) || v! < 0)) {
      showToast(t("soil.invalidValues"), "warning");
      return;
    }

    const selectedFarm = farms.find((f) => f.id === selectedFarmId);
    const recommendationSummary = liveGuidance.length > 0 ? liveGuidance : undefined;

    const payload: Omit<SoilReport, "id" | "ownerId"> = {
      farmId: selectedFarmId,
      farmName: selectedFarm?.name,
      sampleDate: form.sampleDate || new Date().toISOString().slice(0, 10),
      ph,
      nitrogen,
      phosphorus,
      potassium,
      ec,
      organicCarbon,
      soilType: selectedFarm?.soilType,
      notes: form.notes.trim() || undefined,
      recommendationSummary,
    };

    setSaving(true);
    try {
      if (isDemoMode) {
        if (editingId) {
          setReports((prev) =>
            prev.map((r) => (r.id === editingId ? { ...r, ...payload, updatedAt: new Date().toISOString() } : r))
          );
          showToast(t("soil.updatedSuccess"), "success");
        } else {
          const newDoc: SoilReport = {
            id: `soil-demo-${Date.now()}`,
            ownerId: profile.uid,
            createdAt: new Date().toISOString(),
            ...payload,
          };
          setReports((prev) => [newDoc, ...prev]);
          showToast(t("soil.savedSuccess"), "success");
        }
        handleCancelEdit();
        return;
      }

      if (editingId) {
        await updateSoilReport(editingId, payload);
        showToast(t("soil.updatedSuccess"), "success");
      } else {
        await addSoilReport(profile.uid, payload);
        showToast(t("soil.savedSuccess"), "success");
      }

      handleCancelEdit();
      loadData();
    } catch {
      showToast(t("common.error"), "warning");
    } finally {
      setSaving(false);
    }
  }

  function handleUploadNotice() {
    showToast(t("soil.uploadComingSoon"), "info");
  }

  return (
    <div className="space-y-8 animate-fade-up" ref={formTopRef}>
      <SectionHeading eyebrow={t("nav.soil")} title={t("soil.enterValues")} />

      {/* Farm Guidance Warning if 0 farms */}
      {!loading && farms.length === 0 && (
        <div className="card p-4 border-l-4 border-l-clay-500 bg-clay-50/60 flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-2 text-sm text-ink">
            <AlertCircle size={18} className="text-clay-600 shrink-0" />
            <p>{t("soil.noFarmsWarning")}</p>
          </div>
          <Link href="/farm" className="btn-secondary text-xs shrink-0">
            <Plus size={14} /> {t("farm.addFarm")}
          </Link>
        </div>
      )}

      {/* Main Form & Live Summary */}
      <div className="grid lg:grid-cols-12 gap-5">
        {/* Form Card */}
        <div className="card p-5 sm:p-6 lg:col-span-7">
          <div className="flex items-center justify-between mb-4">
            <p className="font-display font-semibold text-base">
              {editingId ? t("soil.updateReport") : t("soil.enterValues")}
            </p>
            {editingId && (
              <button
                type="button"
                onClick={handleCancelEdit}
                className="text-xs font-semibold text-clay-600 hover:underline"
              >
                {t("common.cancel")}
              </button>
            )}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid sm:grid-cols-2 gap-3">
              {/* Farm Selector */}
              <div>
                <label className="label-field">{t("soil.selectFarm")}</label>
                <select
                  value={form.farmId}
                  onChange={(e) => setForm((p) => ({ ...p, farmId: e.target.value }))}
                  className="input-field"
                  required={farms.length > 0}
                >
                  <option value="">{t("soil.selectFarm")}</option>
                  {farms.map((f) => (
                    <option key={f.id} value={f.id}>
                      {f.name} {f.areaAcres ? `(${f.areaAcres} ${t("farm.acres")})` : ""}
                    </option>
                  ))}
                </select>
              </div>

              {/* Sample Date */}
              <div>
                <label className="label-field">{t("soil.sampleDate")}</label>
                <input
                  type="date"
                  value={form.sampleDate}
                  onChange={(e) => setForm((p) => ({ ...p, sampleDate: e.target.value }))}
                  className="input-field"
                  required
                />
              </div>
            </div>

            {/* Parameter Fields */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2 border-t border-forest-100">
              {FIELDS.map((f) => (
                <div key={f.key}>
                  <label className="label-field text-xs">
                    {(t as any)(f.labelKey)}{" "}
                    {f.unit && <span className="text-ink-light font-normal">({f.unit})</span>}
                  </label>
                  <input
                    type="number"
                    step={f.step}
                    min="0"
                    placeholder="0.00"
                    className="input-field"
                    value={form[f.key]}
                    onChange={(e) => setForm((prev) => ({ ...prev, [f.key]: e.target.value }))}
                  />
                </div>
              ))}
            </div>

            {/* Notes */}
            <div className="pt-2 border-t border-forest-100">
              <label className="label-field">{t("soil.notes")}</label>
              <input
                type="text"
                placeholder={t("soil.notesPlaceholder")}
                value={form.notes}
                onChange={(e) => setForm((p) => ({ ...p, notes: e.target.value }))}
                className="input-field"
              />
            </div>

            {/* Actions */}
            <div className="pt-2 flex gap-3">
              <button
                type="submit"
                disabled={saving || (farms.length === 0 && !isDemoMode)}
                className="btn-primary flex-1 justify-center"
              >
                {saving ? (
                  <>
                    <Loader2 size={16} className="animate-spin" /> {t("soil.saving")}
                  </>
                ) : editingId ? (
                  t("soil.updateReport")
                ) : (
                  t("soil.saveReport")
                )}
              </button>
            </div>
          </form>

          {/* Upload Button */}
          <button
            type="button"
            onClick={handleUploadNotice}
            className="btn-ghost w-full mt-4 text-xs justify-center border border-dashed border-forest-200 rounded-xl py-2.5 text-ink-light hover:text-forest-700"
          >
            <Upload size={14} /> {t("soil.uploadReport")}
          </button>
        </div>

        {/* Live Summary Card */}
        <div className="card p-5 sm:p-6 lg:col-span-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 text-forest-700 mb-3">
              <FlaskConical size={18} />
              <p className="font-display font-semibold">{t("soil.summary")}</p>
            </div>

            {liveGuidance.length === 0 ? (
              <p className="text-sm text-ink-light leading-relaxed">
                {t("soil.emptyPrompt")}
              </p>
            ) : (
              <div className="space-y-2.5">
                {liveGuidance.map((note, i) => (
                  <div key={i} className="flex items-start gap-2 text-sm text-ink bg-forest-50/60 p-2.5 rounded-lg border border-forest-100">
                    <CheckCircle2 size={15} className="text-forest-600 shrink-0 mt-0.5" />
                    <span>{note}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="mt-4 pt-4 border-t border-forest-100">
            <p className="text-xs text-clay-600 bg-wheat-100 border border-wheat-200 rounded-lg p-2.5">
              ⚠️ {t("soil.disclaimer")}
            </p>
          </div>
        </div>
      </div>

      {/* ── Soil Report History Section ── */}
      <div>
        <SectionHeading title={`${t("soil.historyTitle")} (${reports.length})`} />

        {loading ? (
          <div className="space-y-3">
            <div className="skeleton h-24" />
            <div className="skeleton h-24" />
          </div>
        ) : reports.length === 0 ? (
          <EmptyState
            icon={FlaskConical}
            title={t("soil.noReportsTitle")}
            message={t("soil.noReportsMessage")}
          />
        ) : (
          <div className="space-y-3.5">
            {reports.map((report) => (
              <div
                key={report.id}
                className="card p-4 sm:p-5 hover:border-forest-200 transition-colors"
              >
                <div className="flex items-start justify-between gap-3 flex-wrap">
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-display font-semibold text-base text-forest-800">
                        {report.farmName || t("nav.farm")}
                      </p>
                      {report.soilType && <span className="chip text-xs">{report.soilType}</span>}
                    </div>
                    <p className="text-xs text-ink-light flex items-center gap-1.5 mt-1">
                      <Calendar size={13} /> {t("soil.testedOn")}: {report.sampleDate || report.createdAt?.slice(0, 10)}
                    </p>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      onClick={() => setExportingReport(report)}
                      className="p-1.5 text-forest-700 hover:bg-forest-50 rounded-lg transition-colors"
                      title="Print / Save PDF"
                      aria-label="Print / Save PDF"
                    >
                      <Printer size={15} />
                    </button>
                    <button
                      onClick={() => handleEdit(report)}
                      className="p-1.5 text-forest-700 hover:bg-forest-50 rounded-lg transition-colors"
                      title={t("soil.edit")}
                      aria-label={t("soil.edit")}
                    >
                      <Edit2 size={15} />
                    </button>
                    <button
                      onClick={() => handleDelete(report.id)}
                      className="p-1.5 text-rust-500 hover:bg-rust-50 rounded-lg transition-colors"
                      title={t("soil.delete")}
                      aria-label={t("soil.delete")}
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>

                {/* Parameter Pills Grid */}
                <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 mt-3.5 pt-3 border-t border-forest-100 text-center">
                  <div className="bg-cream-100/70 p-2 rounded-lg border border-forest-50">
                    <p className="text-[10px] uppercase font-semibold text-ink-light">pH</p>
                    <p className="font-semibold text-sm mt-0.5">{report.ph ?? "—"}</p>
                  </div>
                  <div className="bg-cream-100/70 p-2 rounded-lg border border-forest-50">
                    <p className="text-[10px] uppercase font-semibold text-ink-light">N (kg/ha)</p>
                    <p className="font-semibold text-sm mt-0.5">{report.nitrogen ?? "—"}</p>
                  </div>
                  <div className="bg-cream-100/70 p-2 rounded-lg border border-forest-50">
                    <p className="text-[10px] uppercase font-semibold text-ink-light">P (kg/ha)</p>
                    <p className="font-semibold text-sm mt-0.5">{report.phosphorus ?? "—"}</p>
                  </div>
                  <div className="bg-cream-100/70 p-2 rounded-lg border border-forest-50">
                    <p className="text-[10px] uppercase font-semibold text-ink-light">K (kg/ha)</p>
                    <p className="font-semibold text-sm mt-0.5">{report.potassium ?? "—"}</p>
                  </div>
                  <div className="bg-cream-100/70 p-2 rounded-lg border border-forest-50">
                    <p className="text-[10px] uppercase font-semibold text-ink-light">EC (dS/m)</p>
                    <p className="font-semibold text-sm mt-0.5">{report.ec ?? "—"}</p>
                  </div>
                  <div className="bg-cream-100/70 p-2 rounded-lg border border-forest-50">
                    <p className="text-[10px] uppercase font-semibold text-ink-light">OC (%)</p>
                    <p className="font-semibold text-sm mt-0.5">{report.organicCarbon ?? "—"}</p>
                  </div>
                </div>

                {/* Notes & Summary */}
                {report.notes && (
                  <p className="text-xs text-ink-light mt-2.5 italic">
                    {report.notes}
                  </p>
                )}

                {report.recommendationSummary && report.recommendationSummary.length > 0 && (
                  <div className="mt-2.5 pt-2 border-t border-dashed border-forest-100 flex flex-wrap gap-2">
                    {report.recommendationSummary.map((sum, idx) => (
                      <span key={idx} className="text-xs bg-forest-50 text-forest-700 px-2 py-1 rounded-md">
                        • {sum}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {exportingReport && (
        <SoilReportExportModal
          report={exportingReport}
          profile={profile}
          isOpen={Boolean(exportingReport)}
          onClose={() => setExportingReport(null)}
        />
      )}
    </div>
  );
}
