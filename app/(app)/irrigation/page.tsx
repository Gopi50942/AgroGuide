"use client";

import { useEffect, useState } from "react";
import {
  Droplets,
  Calendar,
  Plus,
  Trash2,
  Clock,
  Gauge,
  Info,
  CheckCircle2,
  AlertTriangle,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useLanguage } from "@/hooks/useLanguage";
import { useToast } from "@/components/ui/Toast";
import { useSharedWeather } from "@/hooks/useSharedWeather";
import { listCrops } from "@/lib/services/farmService";
import {
  calculateWaterBudget,
  listIrrigationLogs,
  addIrrigationLog,
  removeIrrigationLog,
  type IrrigationLog,
  type WaterBudgetResult,
} from "@/lib/services/irrigationService";
import { computeCropProgress } from "@/lib/utils/cropLifecycle";
import { DEMO_CROPS } from "@/data/demoData";
import { SectionHeading } from "@/components/ui/Primitives";
import { LocationNotice } from "@/components/ui/LocationNotice";
import type { Crop } from "@/types";

export default function IrrigationPage() {
  const { profile, isDemoMode } = useAuth();
  const { t, language } = useLanguage();
  const { showToast } = useToast();
  const { weather, loading: weatherLoading } = useSharedWeather();

  const [crops, setCrops] = useState<Crop[]>([]);
  const [selectedCropId, setSelectedCropId] = useState<string>("");
  const [areaInput, setAreaInput] = useState<string>("1");
  const [logs, setLogs] = useState<IrrigationLog[]>([]);
  const [loadingLogs, setLoadingLogs] = useState(true);

  const [showAddLog, setShowAddLog] = useState(false);
  const [logDate, setLogDate] = useState(new Date().toISOString().slice(0, 10));
  const [logMethod, setLogMethod] = useState(profile?.irrigationType || "Drip Irrigation");
  const [logDuration, setLogDuration] = useState("60");
  const [logVolume, setLogVolume] = useState("");
  const [logNotes, setLogNotes] = useState("");

  useEffect(() => {
    if (!profile) return;
    if (isDemoMode) {
      setCrops(DEMO_CROPS);
      setSelectedCropId(DEMO_CROPS[0]?.id || "");
      setAreaInput(String(DEMO_CROPS[0]?.areaAcres || 1));
      setLogs([
        {
          id: "demo-log-1",
          ownerId: profile.uid,
          cropName: "Tomato",
          date: new Date().toISOString().slice(0, 10),
          method: "Drip Irrigation",
          durationMinutes: 45,
          estimatedVolumeLitres: 3500,
          notes: "Morning fertigation cycle completed.",
          createdAt: new Date().toISOString(),
        },
      ]);
      setLoadingLogs(false);
      return;
    }

    listCrops(profile.uid)
      .then((res) => {
        setCrops(res);
        if (res.length > 0) {
          setSelectedCropId(res[0].id);
          setAreaInput(String(res[0].areaAcres || 1));
        }
      })
      .catch(() => {});

    listIrrigationLogs(profile.uid)
      .then(setLogs)
      .catch(() => {})
      .finally(() => setLoadingLogs(false));
  }, [profile, isDemoMode]);

  const selectedCrop = crops.find((c) => c.id === selectedCropId) || crops[0];
  const progress = selectedCrop ? computeCropProgress(selectedCrop) : null;

  const budget: WaterBudgetResult | null = selectedCrop
    ? calculateWaterBudget({
        cropName: selectedCrop.name,
        stage: progress?.stage,
        areaAcres: Number(areaInput) || selectedCrop.areaAcres || 1,
        soilType: selectedCrop.soilType || profile?.soilType,
        irrigationMethod: selectedCrop.irrigationMethod || profile?.irrigationType,
        temperatureC: weather?.current.temperatureC ?? 30,
        humidity: weather?.current.humidity ?? 60,
        rainProbability: weather?.current.rainProbability ?? 20,
      })
    : null;

  async function handleAddLog(e: React.FormEvent) {
    e.preventDefault();
    if (!profile) return;

    const payload: Omit<IrrigationLog, "id" | "ownerId"> = {
      cropId: selectedCrop?.id,
      cropName: selectedCrop?.name || "General",
      date: logDate,
      method: logMethod,
      durationMinutes: Number(logDuration) || undefined,
      estimatedVolumeLitres: Number(logVolume) || undefined,
      notes: logNotes.trim() || undefined,
      createdAt: new Date().toISOString(),
    };

    if (isDemoMode) {
      setLogs((prev) => [
        { id: `demo-${Date.now()}`, ownerId: profile.uid, ...payload },
        ...prev,
      ]);
      showToast(t("irrigation.logSaved"));
      setShowAddLog(false);
      return;
    }

    try {
      const id = await addIrrigationLog(profile.uid, payload);
      setLogs((prev) => [{ id, ownerId: profile.uid, ...payload }, ...prev]);
      showToast(t("irrigation.logSaved"));
      setShowAddLog(false);
      setLogNotes("");
    } catch {
      showToast(t("common.error"));
    }
  }

  async function handleDeleteLog(id: string) {
    if (isDemoMode) {
      setLogs((prev) => prev.filter((l) => l.id !== id));
      showToast(t("irrigation.logDeleted"));
      return;
    }
    try {
      await removeIrrigationLog(id);
      setLogs((prev) => prev.filter((l) => l.id !== id));
      showToast(t("irrigation.logDeleted"));
    } catch {
      showToast(t("common.error"));
    }
  }

  if (weatherLoading || !weather) {
    return (
      <div className="space-y-4">
        <LocationNotice />
        <div className="skeleton h-48" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-up">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <SectionHeading eyebrow={t("irrigation.eyebrow")} title={t("irrigation.title")} />
        <button
          onClick={() => setShowAddLog((v) => !v)}
          className="btn-primary text-xs flex items-center gap-1.5"
        >
          <Plus size={14} /> {t("irrigation.logIrrigation")}
        </button>
      </div>

      <LocationNotice />

      {/* ── Crop Selector & Parameters Bar ── */}
      {crops.length > 0 && (
        <div className="card p-4 bg-cream-50/70 border-forest-200 flex flex-wrap items-center gap-4 text-xs">
          <div className="flex-1 min-w-[180px]">
            <label className="label-field">{t("harvest.selectCrop")}</label>
            <select
              value={selectedCropId}
              onChange={(e) => {
                setSelectedCropId(e.target.value);
                const c = crops.find((x) => x.id === e.target.value);
                if (c?.areaAcres) setAreaInput(String(c.areaAcres));
              }}
              className="input-field py-1.5"
            >
              {crops.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} ({c.stage.replace(/_/g, " ")})
                </option>
              ))}
            </select>
          </div>

          <div className="w-28">
            <label className="label-field">{t("farm.acres")}</label>
            <input
              type="number"
              step="0.1"
              min="0.1"
              value={areaInput}
              onChange={(e) => setAreaInput(e.target.value)}
              className="input-field py-1.5"
            />
          </div>
        </div>
      )}

      {/* ── Water Budget Output Card ── */}
      {budget && (
        <div className="card p-6 border-forest-200 space-y-5">
          <div className="flex items-start gap-4">
            <div
              className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${
                budget.status === "not_needed"
                  ? "bg-wheat-100 text-clay-700"
                  : "bg-forest-100 text-forest-700"
              }`}
            >
              <Droplets size={24} />
            </div>

            <div className="flex-1">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h3 className="font-serif font-bold text-lg text-forest-950">
                  {budget.status === "not_needed"
                    ? t("irrigation.notNecessary")
                    : t("irrigation.likelyNeeded")}
                </h3>
                <span className="chip bg-forest-100 text-forest-900 text-xs">
                  Kc: {budget.kc} · ET₀: {budget.et0MmPerDay} mm/d
                </span>
              </div>

              <p className="text-sm text-forest-900 mt-2 font-medium">
                {language === "ta" ? budget.recommendationTa : budget.recommendationEn}
              </p>
            </div>
          </div>

          {/* Metric Badges */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
            <div className="card p-3 bg-cream-100/60 border-forest-100">
              <p className="text-[11px] text-ink-light">{t("irrigation.dailyVolume")}</p>
              <p className="text-lg font-display font-bold text-forest-950 mt-0.5">
                {budget.dailyVolumeLitres.toLocaleString("en-IN")} L
              </p>
            </div>

            <div className="card p-3 bg-cream-100/60 border-forest-100">
              <p className="text-[11px] text-ink-light">{t("irrigation.volumePerAcre")}</p>
              <p className="text-lg font-display font-bold text-forest-950 mt-0.5">
                {budget.litresPerAcre.toLocaleString("en-IN")} L/ac
              </p>
            </div>

            <div className="card p-3 bg-cream-100/60 border-forest-100">
              <p className="text-[11px] text-ink-light">{t("irrigation.netDemand")}</p>
              <p className="text-lg font-display font-bold text-forest-950 mt-0.5">
                {budget.netDemandMm} mm
              </p>
            </div>

            <div className="card p-3 bg-cream-100/60 border-forest-100">
              <p className="text-[11px] text-ink-light">{t("irrigation.systemEfficiency")}</p>
              <p className="text-lg font-display font-bold text-forest-950 mt-0.5">
                {budget.irrigationEfficiencyPercent}%
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ── Log Irrigation Form Modal / Drawer ── */}
      {showAddLog && (
        <form onSubmit={handleAddLog} className="card p-5 bg-forest-50/60 border-forest-300 space-y-4">
          <div className="flex items-center justify-between border-b border-forest-200 pb-2">
            <h4 className="font-bold text-sm text-forest-950">{t("irrigation.logIrrigationTitle")}</h4>
            <button
              type="button"
              onClick={() => setShowAddLog(false)}
              className="text-xs text-ink-light hover:underline"
            >
              {t("common.cancel")}
            </button>
          </div>

          <div className="grid sm:grid-cols-3 gap-3">
            <div>
              <label className="label-field">{t("harvest.date")}</label>
              <input
                type="date"
                required
                value={logDate}
                onChange={(e) => setLogDate(e.target.value)}
                className="input-field"
              />
            </div>

            <div>
              <label className="label-field">{t("settings.irrigationType")}</label>
              <input
                type="text"
                value={logMethod}
                onChange={(e) => setLogMethod(e.target.value)}
                placeholder="e.g. Drip / Sprinkler"
                className="input-field"
                required
              />
            </div>

            <div>
              <label className="label-field">{t("irrigation.duration")} (mins)</label>
              <input
                type="number"
                value={logDuration}
                onChange={(e) => setLogDuration(e.target.value)}
                placeholder="e.g. 60"
                className="input-field"
              />
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-3">
            <div>
              <label className="label-field">{t("irrigation.estimatedVolume")} (Litres)</label>
              <input
                type="number"
                value={logVolume}
                onChange={(e) => setLogVolume(e.target.value)}
                placeholder="e.g. 4000"
                className="input-field"
              />
            </div>

            <div>
              <label className="label-field">{t("diary.fieldNotes")}</label>
              <input
                type="text"
                value={logNotes}
                onChange={(e) => setLogNotes(e.target.value)}
                placeholder="Fertigation, motor pressure..."
                className="input-field"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-1">
            <button
              type="button"
              onClick={() => setShowAddLog(false)}
              className="btn-secondary text-xs"
            >
              {t("common.cancel")}
            </button>
            <button type="submit" className="btn-primary text-xs">
              {t("common.save")}
            </button>
          </div>
        </form>
      )}

      {/* ── Irrigation History Logs ── */}
      <div>
        <SectionHeading title={`${t("irrigation.historyTitle")} (${logs.length})`} />

        {loadingLogs ? (
          <div className="skeleton h-24" />
        ) : logs.length === 0 ? (
          <div className="card p-6 text-sm text-ink-light text-center">
            {t("irrigation.noLogsMessage")}
          </div>
        ) : (
          <div className="space-y-2.5">
            {logs.map((log) => (
              <div
                key={log.id}
                className="card p-4 flex items-center justify-between gap-3 text-xs bg-cream-50"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-forest-100 text-forest-700 flex items-center justify-center shrink-0">
                    <Droplets size={15} />
                  </div>
                  <div>
                    <p className="font-semibold text-forest-950 text-sm">
                      {log.cropName || "Crop"} · {log.method}
                    </p>
                    <p className="text-ink-light mt-0.5">
                      📅 {log.date}
                      {log.durationMinutes ? ` · ⏱️ ${log.durationMinutes} mins` : ""}
                      {log.estimatedVolumeLitres
                        ? ` · 💧 ${log.estimatedVolumeLitres.toLocaleString("en-IN")} L`
                        : ""}
                    </p>
                    {log.notes && <p className="text-ink-light/80 italic mt-1">{log.notes}</p>}
                  </div>
                </div>

                <button
                  onClick={() => handleDeleteLog(log.id)}
                  className="p-1.5 rounded-lg text-ink-light hover:text-rust-500"
                  title={t("common.cancel")}
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Conservative Agricultural Safety Disclaimer */}
      <div className="card p-4 text-xs text-ink-light bg-cream-100/70 border-forest-100 flex items-start gap-2.5">
        <Info size={16} className="text-forest-700 shrink-0 mt-0.5" />
        <p>{t("irrigation.disclaimer")}</p>
      </div>
    </div>
  );
}
