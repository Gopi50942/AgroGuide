"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  MapPin,
  Sprout,
  Plus,
  Stethoscope,
  Loader2,
  Trash2,
  Edit2,
  Droplets,
  Calendar,
  Layers,
  ChevronRight,
  Package,
  Sparkles,
  Printer,
} from "lucide-react";
import { CropTaskGeneratorModal } from "@/components/farm/CropTaskGeneratorModal";
import { CropSeasonPlannerModal } from "@/components/farm/CropSeasonPlannerModal";
import { FarmActivityTimeline } from "@/components/timeline/FarmActivityTimeline";
import { FarmSummaryReportModal } from "@/components/reports/FarmSummaryReportModal";
import { buildFarmSummaryData, type FarmSummaryReportData } from "@/lib/utils/reportGenerator";
import { aggregateFarmTimeline } from "@/lib/services/timelineService";
import { listSoilReports } from "@/lib/services/soilService";
import { listProduceSales } from "@/lib/services/produceSalesService";
import { listExpenses } from "@/lib/services/financeService";
import { listTasks } from "@/lib/services/taskService";
import { listIrrigationLogs } from "@/lib/services/irrigationService";
import { DEMO_FARMS, DEMO_CROPS } from "@/data/demoData";
import { useAuth } from "@/hooks/useAuth";
import { useLanguage } from "@/hooks/useLanguage";
import { useToast } from "@/components/ui/Toast";
import {
  listFarms,
  listCrops,
  addFarm,
  updateFarm,
  removeFarm,
  addCrop,
  updateCrop,
  removeCrop,
} from "@/lib/services/farmService";
import {
  listHarvestRecords,
  addHarvestRecord,
  updateHarvestRecord,
  removeHarvestRecord,
} from "@/lib/services/harvestService";
import { computeCropProgress, STAGE_ORDER } from "@/lib/utils/cropLifecycle";
import { findCropGuidance } from "@/data/cropGuidance";
import { SectionHeading, ProgressBar, EmptyState } from "@/components/ui/Primitives";
import type { Farm, Crop, CropStage, HarvestRecord, QuantityUnit } from "@/types";

export default function FarmPage() {
  const { profile, isDemoMode } = useAuth();
  const { t } = useLanguage();
  const { showToast } = useToast();

  const [farms, setFarms] = useState<Farm[]>([]);
  const [crops, setCrops] = useState<Crop[]>([]);
  const [harvests, setHarvests] = useState<HarvestRecord[]>([]);
  const [loading, setLoading] = useState(true);

  const [showAddFarm, setShowAddFarm] = useState(false);
  const [editingFarm, setEditingFarm] = useState<Farm | null>(null);

  const [showAddCrop, setShowAddCrop] = useState(false);
  const [editingCrop, setEditingCrop] = useState<Crop | null>(null);

  const [showAddHarvest, setShowAddHarvest] = useState(false);
  const [editingHarvest, setEditingHarvest] = useState<HarvestRecord | null>(null);
  const [preselectedCropId, setPreselectedCropId] = useState<string | undefined>(undefined);
  const [schedulingCrop, setSchedulingCrop] = useState<Crop | null>(null);
  const [farmSummaryData, setFarmSummaryData] = useState<FarmSummaryReportData | null>(null);
  const [showSeasonPlanner, setShowSeasonPlanner] = useState(false);
  const [timelineEvents, setTimelineEvents] = useState<any[]>([]);

  async function handleOpenFarmSummary(farm: Farm) {
    if (!profile) return;
    if (isDemoMode) {
      const summary = buildFarmSummaryData({
        profile,
        farm,
        crops: DEMO_CROPS,
      });
      setFarmSummaryData(summary);
      return;
    }

    try {
      const [soilReports, sales, expenses] = await Promise.all([
        listSoilReports(profile.uid).catch(() => []),
        listProduceSales(profile.uid).catch(() => []),
        listExpenses(profile.uid).catch(() => []),
      ]);

      const summary = buildFarmSummaryData({
        profile,
        farm,
        crops,
        soilReports,
        harvests,
        sales,
        expenses,
      });
      setFarmSummaryData(summary);
    } catch {
      showToast(t("common.error"));
    }
  }

  async function refresh() {
    if (!profile) return;
    if (isDemoMode) {
      setFarms(DEMO_FARMS);
      setCrops(DEMO_CROPS);
      setHarvests([]);
      const events = aggregateFarmTimeline({
        crops: DEMO_CROPS,
      });
      setTimelineEvents(events);
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const [f, c, h, tasks, irrs, soils, exp, sales] = await Promise.all([
        listFarms(profile.uid),
        listCrops(profile.uid),
        listHarvestRecords(profile.uid),
        listTasks(profile.uid).catch(() => []),
        listIrrigationLogs(profile.uid).catch(() => []),
        listSoilReports(profile.uid).catch(() => []),
        listExpenses(profile.uid).catch(() => []),
        listProduceSales(profile.uid).catch(() => []),
      ]);
      setFarms(f);
      setCrops(c);
      setHarvests(h);
      const events = aggregateFarmTimeline({
        crops: c,
        tasks,
        irrigationLogs: irrs,
        soilReports: soils,
        expenses: exp,
        harvests: h,
        sales,
      });
      setTimelineEvents(events);
    } catch {
      showToast(t("common.error"), "warning");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profile?.uid, isDemoMode]);

  async function handleDeleteFarm(farmId: string) {
    if (!confirm(t("farm.confirmDelete"))) return;
    if (isDemoMode) {
      setFarms((prev) => prev.filter((f) => f.id !== farmId));
      return;
    }
    try {
      await removeFarm(farmId);
      refresh();
    } catch {
      showToast(t("common.error"), "warning");
    }
  }

  async function handleDeleteCrop(cropId: string) {
    if (isDemoMode) {
      setCrops((prev) => prev.filter((c) => c.id !== cropId));
      return;
    }
    try {
      await removeCrop(cropId);
      refresh();
    } catch {
      showToast(t("common.error"), "warning");
    }
  }

  async function handleDeleteHarvest(harvestId: string) {
    if (!confirm(t("harvest.deleteConfirm"))) return;
    if (isDemoMode) {
      setHarvests((prev) => prev.filter((h) => h.id !== harvestId));
      showToast(t("harvest.deleted"), "success");
      return;
    }
    try {
      await removeHarvestRecord(harvestId);
      showToast(t("harvest.deleted"), "success");
      refresh();
    } catch {
      showToast(t("common.error"), "warning");
    }
  }

  const totalAcres = farms.reduce((sum, f) => sum + (f.areaAcres || 0), 0);

  return (
    <div className="space-y-8 animate-fade-up">
      <SectionHeading eyebrow={t("nav.farm")} title={t("farm.title")} />

      {/* Top Overview Cards */}
      {farms.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="card p-4 border-l-4 border-l-forest-500">
            <p className="text-xs text-ink-light uppercase font-semibold">{t("dashboard.totalFarms")}</p>
            <p className="font-display text-2xl font-semibold text-forest-700 mt-1">{farms.length}</p>
          </div>
          <div className="card p-4 border-l-4 border-l-clay-400">
            <p className="text-xs text-ink-light uppercase font-semibold">{t("dashboard.cultivatedArea")}</p>
            <p className="font-display text-2xl font-semibold text-clay-600 mt-1">
              {totalAcres} {t("farm.acres")}
            </p>
          </div>
          <div className="card p-4 border-l-4 border-l-forest-600">
            <p className="text-xs text-ink-light uppercase font-semibold">{t("dashboard.activeCrops")}</p>
            <p className="font-display text-2xl font-semibold text-forest-700 mt-1">{crops.length}</p>
          </div>
          <div className="card p-4 border-l-4 border-l-wheat-500">
            <p className="text-xs text-ink-light uppercase font-semibold">{t("harvest.title")}</p>
            <p className="font-display text-2xl font-semibold text-wheat-700 mt-1">{harvests.length}</p>
          </div>
        </div>
      )}

      {/* ── My Farms Section ── */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <p className="text-sm font-semibold text-ink-light">{t("farm.myFarms")}</p>
          <button
            onClick={() => {
              setEditingFarm(null);
              setShowAddFarm((v) => !v);
            }}
            className="btn-ghost text-sm px-0 text-forest-700"
          >
            <Plus size={15} /> {t("farm.addFarm")}
          </button>
        </div>

        {(showAddFarm || editingFarm) && (
          <FarmForm
            farm={editingFarm}
            onCancel={() => {
              setShowAddFarm(false);
              setEditingFarm(null);
            }}
            onSaved={() => {
              setShowAddFarm(false);
              setEditingFarm(null);
              refresh();
            }}
          />
        )}

        {loading ? (
          <div className="skeleton h-28" />
        ) : farms.length === 0 && !showAddFarm ? (
          <EmptyState
            icon={Sprout}
            title={t("farm.noFarmsTitle")}
            message={t("farm.noFarmsMessage")}
            action={
              <button onClick={() => setShowAddFarm(true)} className="btn-primary text-sm">
                <Plus size={15} /> {t("farm.addFarm")}
              </button>
            }
          />
        ) : (
          <div className="grid sm:grid-cols-2 gap-4">
            {farms.map((farm) => (
              <div key={farm.id} className="card p-5">
                <div className="flex items-start justify-between">
                  <p className="font-display font-semibold text-lg">{farm.name}</p>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleOpenFarmSummary(farm)}
                      className="p-1.5 rounded-lg text-ink-light hover:text-forest-700"
                      title="Farm Summary Report"
                    >
                      <Printer size={14} />
                    </button>
                    <button
                      onClick={() => setEditingFarm(farm)}
                      className="p-1.5 rounded-lg text-ink-light hover:text-forest-700"
                      title={t("farm.editFarm")}
                    >
                      <Edit2 size={14} />
                    </button>
                    <button
                      onClick={() => handleDeleteFarm(farm.id)}
                      className="p-1.5 rounded-lg text-ink-light hover:text-rust-500"
                      title={t("farm.deleteFarm")}
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
                <p className="text-xs text-ink-light mt-1 flex items-center gap-1">
                  <MapPin size={13} /> {farm.location}
                </p>
                <div className="flex flex-wrap gap-2 mt-3 text-xs text-ink-light">
                  <span className="chip">
                    {farm.areaAcres} {t("farm.acres")}
                  </span>
                  {farm.soilType && <span className="chip">{farm.soilType}</span>}
                  {farm.irrigationType && <span className="chip">{farm.irrigationType}</span>}
                  {farm.waterSource && <span className="chip">{farm.waterSource}</span>}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── Crop Lifecycle & Management ── */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <p className="text-sm font-semibold text-ink-light">{t("farm.cropLifecycle")}</p>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowSeasonPlanner(true)}
              className="text-xs text-forest-800 font-semibold flex items-center gap-1 hover:underline"
            >
              <Sparkles size={14} className="text-wheat-600" />
              {t("cropPlanner.plannerBtn")}
            </button>
            {farms.length > 0 && (
              <button
                onClick={() => {
                  setEditingCrop(null);
                  setShowAddCrop((v) => !v);
                }}
                className="btn-ghost text-sm px-0 text-forest-700"
              >
                <Plus size={15} /> {t("farm.addCrop")}
              </button>
            )}
          </div>
        </div>

        {(showAddCrop || editingCrop) && (
          <CropForm
            farms={farms}
            crop={editingCrop}
            onCancel={() => {
              setShowAddCrop(false);
              setEditingCrop(null);
            }}
            onSaved={() => {
              setShowAddCrop(false);
              setEditingCrop(null);
              refresh();
            }}
          />
        )}

        {!loading && crops.length === 0 && !showAddCrop && !editingCrop && (
          <EmptyState
            icon={Sprout}
            title={t("farm.noCropsTitle")}
            message={t("farm.noCropsMessage")}
            action={
              farms.length > 0 ? (
                <button onClick={() => setShowAddCrop(true)} className="btn-primary text-sm">
                  <Plus size={15} /> {t("farm.addCrop")}
                </button>
              ) : undefined
            }
          />
        )}

        {crops.map((crop) => {
          const progress = computeCropProgress(crop);
          const idx = STAGE_ORDER.indexOf(progress.stage);
          const farmObj = farms.find((f) => f.id === crop.farmId);
          const cropHarvests = harvests.filter((h) => h.cropId === crop.id);
          const totalCropHarvest = cropHarvests.reduce((sum, h) => sum + (h.quantity || 0), 0);

          return (
            <div key={crop.id} className="card p-5 mt-3 first:mt-0">
              <div className="flex items-baseline justify-between flex-wrap gap-2">
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-display text-lg font-semibold">{crop.name}</p>
                    {crop.variety && <span className="text-xs text-ink-light">({crop.variety})</span>}
                  </div>
                  <p className="text-sm text-ink-light mt-0.5">
                    {farmObj ? `${farmObj.name} · ` : ""}
                    {crop.areaAcres} {t("farm.acres")} · {t("farm.day")} {progress.dayNumber}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      setPreselectedCropId(crop.id);
                      setEditingHarvest(null);
                      setShowAddHarvest(true);
                    }}
                    className="btn-secondary text-xs"
                  >
                    <Package size={13} /> {t("harvest.addHarvest")}
                  </button>
                  <button
                    onClick={() => setSchedulingCrop(crop)}
                    className="btn-secondary text-xs px-2.5 py-1 text-forest-700 bg-forest-50/80 border-forest-200 hover:bg-forest-100 flex items-center gap-1"
                    title={t("taskScheduler.generateTasks")}
                  >
                    <Sparkles size={12} /> {t("taskScheduler.tasks")}
                  </button>
                  <span className="chip capitalize font-semibold">{progress.stage.replace(/_/g, " ")}</span>
                  <button
                    onClick={() => setEditingCrop(crop)}
                    className="p-1.5 rounded-lg text-ink-light hover:text-forest-700"
                    title={t("farm.editCrop")}
                  >
                    <Edit2 size={14} />
                  </button>
                  <button
                    onClick={() => handleDeleteCrop(crop.id)}
                    className="p-1.5 rounded-lg text-ink-light hover:text-rust-500"
                    title={t("farm.deleteCrop")}
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>

              {/* 10-Stage Horizontal Progression */}
              <div className="mt-4 flex gap-1.5 overflow-x-auto pb-1.5">
                {STAGE_ORDER.map((s, i) => (
                  <div
                    key={s}
                    className={`flex-1 min-w-[85px] text-center py-2 px-1 rounded-lg text-[11px] font-semibold capitalize transition-all ${
                      i < idx
                        ? "bg-forest-100 text-forest-700"
                        : i === idx
                        ? "bg-forest-600 text-cream-50 shadow-sm"
                        : "bg-cream-100 text-ink-light/60 border border-forest-100"
                    }`}
                  >
                    {s.replace(/_/g, " ")}
                  </div>
                ))}
              </div>
              <ProgressBar value={((idx + 1) / STAGE_ORDER.length) * 100} className="mt-2.5" />

              {/* Agricultural stage details */}
              <div className="grid sm:grid-cols-4 gap-3 mt-4 pt-3 border-t border-forest-100 text-xs">
                <div>
                  <span className="text-ink-light">{t("farm.sowingDate")}:</span>
                  <p className="font-semibold text-ink mt-0.5">{crop.sowingDate}</p>
                </div>
                <div>
                  <span className="text-ink-light">{t("farm.expectedHarvestDate")}:</span>
                  <p className="font-semibold text-ink mt-0.5">{crop.expectedHarvestDate || "—"}</p>
                </div>
                <div>
                  <span className="text-ink-light">{t("farm.seedSource")}:</span>
                  <p className="font-semibold text-ink mt-0.5">{crop.seedSource || "Certified Dealer"}</p>
                </div>
                <div>
                  <span className="text-ink-light">{t("harvest.totalYield")}:</span>
                  <p className="font-semibold text-forest-700 mt-0.5">
                    {totalCropHarvest > 0 ? `${totalCropHarvest} ${cropHarvests[0]?.quantityUnit || "kg"}` : "—"}
                  </p>
                </div>
              </div>

              {crop.notes && <p className="text-sm text-ink-light mt-3">{crop.notes}</p>}
              <CropStageGuidanceBox cropName={crop.name} stage={progress.stage} />
            </div>
          );
        })}
      </div>

      {/* ── Harvest Records Section (Phase 3) ── */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <SectionHeading title={`${t("harvest.title")} (${harvests.length})`} />
          {crops.length > 0 && (
            <button
              onClick={() => {
                setPreselectedCropId(undefined);
                setEditingHarvest(null);
                setShowAddHarvest((v) => !v);
              }}
              className="btn-secondary text-sm"
            >
              <Plus size={15} /> {t("harvest.addHarvest")}
            </button>
          )}
        </div>

        {(showAddHarvest || editingHarvest) && (
          <HarvestForm
            crops={crops}
            harvest={editingHarvest}
            preselectedCropId={preselectedCropId}
            onCancel={() => {
              setShowAddHarvest(false);
              setEditingHarvest(null);
            }}
            onSaved={() => {
              setShowAddHarvest(false);
              setEditingHarvest(null);
              refresh();
            }}
          />
        )}

        {harvests.length === 0 && !showAddHarvest && !editingHarvest ? (
          <EmptyState
            icon={Package}
            title={t("harvest.noHarvestsTitle")}
            message={t("harvest.noHarvestsMessage")}
          />
        ) : (
          <div className="space-y-3">
            {harvests.map((h) => (
              <div key={h.id} className="card p-4 flex items-center justify-between gap-3 flex-wrap">
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-display font-semibold text-base text-forest-900">{h.cropName}</p>
                    <span className="chip font-semibold text-xs">
                      {h.quantity} {h.quantityUnit}
                    </span>
                    {h.qualityGrade && <span className="chip text-xs">{h.qualityGrade}</span>}
                  </div>
                  <p className="text-xs text-ink-light flex items-center gap-2 mt-1 flex-wrap">
                    <span className="flex items-center gap-1">
                      <Calendar size={12} /> {h.harvestDate}
                    </span>
                    {h.storageLocation && <span>· {h.storageLocation}</span>}
                    {h.moisturePercent !== undefined && <span>· {h.moisturePercent}% moisture</span>}
                  </p>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => {
                      setEditingHarvest(h);
                      setShowAddHarvest(true);
                    }}
                    className="p-1.5 rounded-lg text-ink-light hover:text-forest-700"
                    title={t("harvest.editHarvest")}
                  >
                    <Edit2 size={14} />
                  </button>
                  <button
                    onClick={() => handleDeleteHarvest(h.id)}
                    className="p-1.5 rounded-lg text-ink-light hover:text-rust-500"
                    title={t("common.cancel")}
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Crop Doctor Callout */}
      <div className="card p-5 flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-forest-50 flex items-center justify-center text-forest-600 shrink-0">
            <Stethoscope size={18} />
          </div>
          <div>
            <p className="font-display font-semibold">{t("nav.cropDoctor")}</p>
            <p className="text-xs text-ink-light">{t("cropDoctor.subtitle")}</p>
          </div>
        </div>
        <Link href="/crop-doctor" className="btn-primary text-sm shrink-0">
          <Stethoscope size={15} /> {t("nav.cropDoctor")}
        </Link>
      </div>

      {/* Unified Farm Activity Timeline */}
      <div className="space-y-3">
        <SectionHeading
          title={t("timeline.title")}
          subtitle={t("timeline.subtitle")}
        />
        <FarmActivityTimeline events={timelineEvents} crops={crops} />
      </div>

      {schedulingCrop && (
        <CropTaskGeneratorModal
          crop={schedulingCrop}
          isOpen={Boolean(schedulingCrop)}
          onClose={() => setSchedulingCrop(null)}
          onTasksGenerated={refresh}
        />
      )}

      {farmSummaryData && (
        <FarmSummaryReportModal
          data={farmSummaryData}
          isOpen={Boolean(farmSummaryData)}
          onClose={() => setFarmSummaryData(null)}
        />
      )}

      {showSeasonPlanner && (
        <CropSeasonPlannerModal
          isOpen={showSeasonPlanner}
          onClose={() => setShowSeasonPlanner(false)}
          profile={profile}
          onSelectCrop={(cropName) => {
            setShowAddCrop(true);
          }}
        />
      )}
    </div>
  );
}

function FarmForm({
  farm,
  onCancel,
  onSaved,
}: {
  farm?: Farm | null;
  onCancel: () => void;
  onSaved: () => void;
}) {
  const { profile } = useAuth();
  const { t } = useLanguage();
  const { showToast } = useToast();
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    name: farm?.name ?? "",
    location: farm?.location ?? "",
    areaAcres: String(farm?.areaAcres ?? ""),
    soilType: farm?.soilType ?? "",
    irrigationType: farm?.irrigationType ?? "",
    waterSource: farm?.waterSource ?? "",
  });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!profile || !form.name.trim()) return;
    setSaving(true);
    try {
      if (farm) {
        await updateFarm(farm.id, {
          name: form.name.trim(),
          location: form.location.trim(),
          areaAcres: Number(form.areaAcres) || 0,
          soilType: form.soilType.trim(),
          irrigationType: form.irrigationType.trim(),
          waterSource: form.waterSource.trim(),
        });
      } else {
        await addFarm(profile.uid, {
          name: form.name.trim(),
          location: form.location.trim(),
          areaAcres: Number(form.areaAcres) || 0,
          soilType: form.soilType.trim(),
          irrigationType: form.irrigationType.trim(),
          waterSource: form.waterSource.trim(),
        });
      }
      showToast(t("farm.farmSaved"), "success");
      onSaved();
    } catch {
      showToast(t("common.error"), "warning");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="card p-5 mb-3 grid sm:grid-cols-2 gap-3">
      <input
        required
        placeholder={t("farm.name")}
        value={form.name}
        onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
        className="input-field"
      />
      <input
        placeholder={t("farm.location")}
        value={form.location}
        onChange={(e) => setForm((p) => ({ ...p, location: e.target.value }))}
        className="input-field"
      />
      <input
        type="number"
        min={0}
        step={0.1}
        placeholder={t("farm.acres")}
        value={form.areaAcres}
        onChange={(e) => setForm((p) => ({ ...p, areaAcres: e.target.value }))}
        className="input-field"
      />
      <input
        placeholder={t("settings.soilType")}
        value={form.soilType}
        onChange={(e) => setForm((p) => ({ ...p, soilType: e.target.value }))}
        className="input-field"
      />
      <input
        placeholder={t("settings.irrigationType")}
        value={form.irrigationType}
        onChange={(e) => setForm((p) => ({ ...p, irrigationType: e.target.value }))}
        className="input-field"
      />
      <input
        placeholder={t("settings.waterSource")}
        value={form.waterSource}
        onChange={(e) => setForm((p) => ({ ...p, waterSource: e.target.value }))}
        className="input-field"
      />
      <div className="sm:col-span-2 flex gap-2 pt-1">
        <button type="submit" disabled={saving} className="btn-primary text-sm">
          {saving ? <Loader2 size={15} className="animate-spin" /> : t("common.save")}
        </button>
        <button type="button" onClick={onCancel} className="btn-secondary text-sm">
          {t("common.cancel")}
        </button>
      </div>
    </form>
  );
}

function CropForm({
  farms,
  crop,
  onCancel,
  onSaved,
}: {
  farms: Farm[];
  crop?: Crop | null;
  onCancel: () => void;
  onSaved: () => void;
}) {
  const { profile } = useAuth();
  const { t } = useLanguage();
  const { showToast } = useToast();
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    farmId: crop?.farmId ?? farms[0]?.id ?? "",
    name: crop?.name ?? "",
    variety: crop?.variety ?? "",
    fieldOrPlot: crop?.fieldOrPlot ?? "",
    seedSource: crop?.seedSource ?? "",
    areaAcres: String(crop?.areaAcres ?? ""),
    sowingDate: crop?.sowingDate ?? new Date().toISOString().slice(0, 10),
    expectedHarvestDate: crop?.expectedHarvestDate ?? "",
    notes: crop?.notes ?? "",
  });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!profile || !form.name.trim()) return;
    setSaving(true);
    try {
      if (crop) {
        await updateCrop(crop.id, {
          farmId: form.farmId,
          name: form.name.trim(),
          variety: form.variety.trim(),
          fieldOrPlot: form.fieldOrPlot.trim(),
          seedSource: form.seedSource.trim(),
          areaAcres: Number(form.areaAcres) || 0,
          sowingDate: form.sowingDate,
          expectedHarvestDate: form.expectedHarvestDate,
          notes: form.notes.trim(),
        });
      } else {
        await addCrop(profile.uid, {
          farmId: form.farmId,
          name: form.name.trim(),
          variety: form.variety.trim(),
          fieldOrPlot: form.fieldOrPlot.trim(),
          seedSource: form.seedSource.trim(),
          areaAcres: Number(form.areaAcres) || 0,
          sowingDate: form.sowingDate,
          expectedHarvestDate: form.expectedHarvestDate,
          stage: "sowing",
          dayNumber: 1,
          notes: form.notes.trim(),
        });
      }
      showToast(t("farm.cropSaved"), "success");
      onSaved();
    } catch {
      showToast(t("common.error"), "warning");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="card p-5 mb-3 grid sm:grid-cols-2 gap-3">
      <select
        value={form.farmId}
        onChange={(e) => setForm((p) => ({ ...p, farmId: e.target.value }))}
        className="input-field"
      >
        {farms.map((f) => (
          <option key={f.id} value={f.id}>
            {f.name}
          </option>
        ))}
      </select>
      <input
        required
        placeholder={t("farm.cropName")}
        value={form.name}
        onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
        className="input-field"
      />
      <input
        placeholder={t("farm.variety")}
        value={form.variety}
        onChange={(e) => setForm((p) => ({ ...p, variety: e.target.value }))}
        className="input-field"
      />
      <input
        placeholder={t("farm.fieldPlot")}
        value={form.fieldOrPlot}
        onChange={(e) => setForm((p) => ({ ...p, fieldOrPlot: e.target.value }))}
        className="input-field"
      />
      <input
        placeholder={t("farm.seedSource")}
        value={form.seedSource}
        onChange={(e) => setForm((p) => ({ ...p, seedSource: e.target.value }))}
        className="input-field"
      />
      <input
        type="number"
        min={0}
        step={0.1}
        placeholder={t("farm.acres")}
        value={form.areaAcres}
        onChange={(e) => setForm((p) => ({ ...p, areaAcres: e.target.value }))}
        className="input-field"
      />
      <div>
        <label className="label-field">{t("farm.sowingDate")}</label>
        <input
          required
          type="date"
          value={form.sowingDate}
          onChange={(e) => setForm((p) => ({ ...p, sowingDate: e.target.value }))}
          className="input-field"
        />
      </div>
      <div>
        <label className="label-field">{t("farm.expectedHarvestDate")}</label>
        <input
          type="date"
          value={form.expectedHarvestDate}
          onChange={(e) => setForm((p) => ({ ...p, expectedHarvestDate: e.target.value }))}
          className="input-field"
        />
      </div>
      <input
        placeholder="Notes / Observations"
        value={form.notes}
        onChange={(e) => setForm((p) => ({ ...p, notes: e.target.value }))}
        className="input-field sm:col-span-2"
      />
      <div className="sm:col-span-2 flex gap-2 pt-1">
        <button type="submit" disabled={saving} className="btn-primary text-sm">
          {saving ? <Loader2 size={15} className="animate-spin" /> : t("common.save")}
        </button>
        <button type="button" onClick={onCancel} className="btn-secondary text-sm">
          {t("common.cancel")}
        </button>
      </div>
    </form>
  );
}

function HarvestForm({
  crops,
  harvest,
  preselectedCropId,
  onCancel,
  onSaved,
}: {
  crops: Crop[];
  harvest?: HarvestRecord | null;
  preselectedCropId?: string;
  onCancel: () => void;
  onSaved: () => void;
}) {
  const { profile } = useAuth();
  const { t } = useLanguage();
  const { showToast } = useToast();
  const [saving, setSaving] = useState(false);

  const initialCrop =
    crops.find((c) => c.id === (harvest?.cropId || preselectedCropId)) || crops[0];

  const [form, setForm] = useState({
    cropId: initialCrop?.id ?? "",
    harvestDate: harvest?.harvestDate ?? new Date().toISOString().slice(0, 10),
    quantity: String(harvest?.quantity ?? ""),
    quantityUnit: harvest?.quantityUnit ?? ("kg" as QuantityUnit),
    qualityGrade: harvest?.qualityGrade ?? "Grade A",
    moisturePercent: String(harvest?.moisturePercent ?? ""),
    storageLocation: harvest?.storageLocation ?? "",
    notes: harvest?.notes ?? "",
  });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!profile || !form.cropId || !form.quantity) return;

    const selectedCrop = crops.find((c) => c.id === form.cropId);
    if (!selectedCrop) return;

    setSaving(true);
    const payload: Omit<HarvestRecord, "id" | "ownerId"> = {
      cropId: form.cropId,
      cropName: selectedCrop.name,
      farmId: selectedCrop.farmId,
      harvestDate: form.harvestDate,
      quantity: Number(form.quantity) || 0,
      quantityUnit: form.quantityUnit,
      qualityGrade: form.qualityGrade.trim() || undefined,
      moisturePercent: form.moisturePercent ? Number(form.moisturePercent) : undefined,
      storageLocation: form.storageLocation.trim() || undefined,
      notes: form.notes.trim() || undefined,
    };

    try {
      if (harvest) {
        await updateHarvestRecord(harvest.id, payload);
        showToast(t("harvest.updated"), "success");
      } else {
        await addHarvestRecord(profile.uid, payload);
        showToast(t("harvest.saved"), "success");
      }
      onSaved();
    } catch {
      showToast(t("common.error"), "warning");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="card p-5 mb-4 grid sm:grid-cols-2 gap-3">
      <div>
        <label className="label-field">{t("harvest.selectCrop")}</label>
        <select
          value={form.cropId}
          onChange={(e) => setForm((p) => ({ ...p, cropId: e.target.value }))}
          className="input-field"
          required
        >
          {crops.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name} {c.variety ? `(${c.variety})` : ""}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="label-field">{t("harvest.date")}</label>
        <input
          required
          type="date"
          value={form.harvestDate}
          onChange={(e) => setForm((p) => ({ ...p, harvestDate: e.target.value }))}
          className="input-field"
        />
      </div>

      <div>
        <label className="label-field">{t("harvest.quantity")}</label>
        <input
          required
          type="number"
          min="0.1"
          step="0.1"
          placeholder="e.g. 500"
          value={form.quantity}
          onChange={(e) => setForm((p) => ({ ...p, quantity: e.target.value }))}
          className="input-field"
        />
      </div>

      <div>
        <label className="label-field">{t("harvest.unit")}</label>
        <select
          value={form.quantityUnit}
          onChange={(e) => setForm((p) => ({ ...p, quantityUnit: e.target.value as QuantityUnit }))}
          className="input-field"
        >
          <option value="kg">kg</option>
          <option value="quintal">quintal</option>
          <option value="tonne">tonne</option>
        </select>
      </div>

      <input
        placeholder={t("harvest.quality")}
        value={form.qualityGrade}
        onChange={(e) => setForm((p) => ({ ...p, qualityGrade: e.target.value }))}
        className="input-field"
      />

      <input
        placeholder={t("harvest.storage")}
        value={form.storageLocation}
        onChange={(e) => setForm((p) => ({ ...p, storageLocation: e.target.value }))}
        className="input-field"
      />

      <input
        type="number"
        step="0.1"
        placeholder={t("harvest.moisture")}
        value={form.moisturePercent}
        onChange={(e) => setForm((p) => ({ ...p, moisturePercent: e.target.value }))}
        className="input-field"
      />

      <input
        placeholder="Notes (Optional)"
        value={form.notes}
        onChange={(e) => setForm((p) => ({ ...p, notes: e.target.value }))}
        className="input-field"
      />

      <div className="sm:col-span-2 flex gap-2 pt-1">
        <button type="submit" disabled={saving} className="btn-primary text-sm">
          {saving ? <Loader2 size={15} className="animate-spin" /> : t("common.save")}
        </button>
        <button type="button" onClick={onCancel} className="btn-secondary text-sm">
          {t("common.cancel")}
        </button>
      </div>
    </form>
  );
}

function CropStageGuidanceBox({ cropName, stage }: { cropName: string; stage: CropStage }) {
  const { t } = useLanguage();
  const [open, setOpen] = useState(false);
  const guidance = findCropGuidance(cropName);
  const stageTips = guidance?.stages.find((s) => s.stage === stage)?.tips;

  if (!guidance || !stageTips || stageTips.length === 0) return null;

  return (
    <div className="mt-3 pt-3 border-t border-forest-100">
      <button
        onClick={() => setOpen((v) => !v)}
        className="text-xs font-semibold text-forest-700 flex items-center gap-1 hover:underline"
      >
        <Sprout size={13} /> {t("farm.growingGuidance")} ({guidance.displayName})
      </button>
      {open && (
        <div className="mt-2 space-y-1.5 bg-forest-50/70 p-3 rounded-xl">
          <ul className="space-y-1 text-sm text-ink">
            {stageTips.map((tip, i) => (
              <li key={i} className="flex gap-2">
                <span className="text-forest-600 font-bold">•</span> {tip}
              </li>
            ))}
          </ul>
          <p className="text-xs text-ink-light pt-1">{t("farm.guidanceDisclaimer")}</p>
        </div>
      )}
    </div>
  );
}
