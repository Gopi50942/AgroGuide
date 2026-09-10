"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { CloudSun, Bot, TrendingUp, Landmark, ArrowRight, Droplets, Bug, Sprout, Stethoscope, Mic } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useLanguage } from "@/hooks/useLanguage";
import { useSharedWeather } from "@/hooks/useSharedWeather";
import { useSharedMarketPrices } from "@/hooks/useSharedMarketPrices";
import { buildWeatherAdvisories } from "@/lib/services/weatherService";
import { matchGovernmentSchemes, matchCategory } from "@/lib/services/governmentService";
import { listCrops, listFarms } from "@/lib/services/farmService";
import { listTasks } from "@/lib/services/taskService";
import { computeCropProgress, STAGE_ORDER } from "@/lib/utils/cropLifecycle";
import { DEMO_CROPS, DEMO_FARMS, DEMO_TASKS } from "@/data/demoData";
import { ProgressBar, SectionHeading, SeverityBadge, SampleBadge, StatCard } from "@/components/ui/Primitives";
import { LocationNotice } from "@/components/ui/LocationNotice";
import { FarmerQuoteTicker } from "@/components/ui/FarmerQuoteTicker";
import { FarmerOnboardingModal } from "@/components/ui/FarmerOnboardingModal";
import { useSampleDataVisible } from "@/hooks/useSampleDataVisible";
import type { Crop, CropTask, Farm } from "@/types";

function greetingKey(): "dashboard.goodMorning" | "dashboard.goodAfternoon" | "dashboard.goodEvening" {
  const h = new Date().getHours();
  if (h < 12) return "dashboard.goodMorning";
  if (h < 17) return "dashboard.goodAfternoon";
  return "dashboard.goodEvening";
}

export default function DashboardPage() {
  const { profile, isDemoMode } = useAuth();
  const { t } = useLanguage();
  const { visible: sampleVisible, dismiss: dismissSample } = useSampleDataVisible();
  const sampleCrop = DEMO_CROPS[0];
  const { weather } = useSharedWeather();

  const [crop, setCrop] = useState<Crop | null | undefined>(undefined); // undefined = loading
  const [tasks, setTasks] = useState<CropTask[]>([]);
  const [allFarms, setAllFarms] = useState<Farm[]>([]);
  const [allCrops, setAllCrops] = useState<Crop[]>([]);
  const [showOnboarding, setShowOnboarding] = useState(false);

  const pendingTasks = tasks.filter((task) => !task.completed).sort((a, b) => a.dueDate.localeCompare(b.dueDate));
  const alerts = weather ? buildWeatherAdvisories(weather) : [];
  const schemes = profile ? matchGovernmentSchemes(profile).slice(0, 3) : [];
  const totalCultivatedAcres = allFarms.reduce((sum, f) => sum + (f.areaAcres || 0), 0);
  const overdueTasks = pendingTasks.filter((task) => task.dueDate < new Date().toISOString().slice(0, 10)).length;

  useEffect(() => {
    if (!profile) return;
    // If real user without farms and hasn't explicitly dismissed onboarding, show onboarding
    if (!isDemoMode && !profile.onboardingCompleted && allFarms.length === 0 && crop === null) {
      setShowOnboarding(true);
    }
  }, [profile, isDemoMode, allFarms.length, crop]);

  async function loadDashboardData() {
    if (!profile) return;
    if (isDemoMode) {
      setCrop(DEMO_CROPS[0] ?? null);
      setTasks(DEMO_TASKS);
      setAllFarms(DEMO_FARMS);
      setAllCrops(DEMO_CROPS);
      return;
    }
    const [c, tList, fList] = await Promise.all([
      listCrops(profile.uid),
      listTasks(profile.uid),
      listFarms(profile.uid),
    ]);
    setCrop(c[0] ?? null);
    setAllCrops(c);
    setTasks(tList);
    setAllFarms(fList);
  }

  useEffect(() => {
    loadDashboardData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profile, isDemoMode]);

  const { response: marketResponse, loading: marketLoading } = useSharedMarketPrices({
    state: profile?.state,
    district: profile?.district,
    commodity: crop?.name,
  });
  const marketRecords = marketResponse?.records ?? [];
  const marketLive = marketResponse?.isLive ?? true;

  const progress = crop ? computeCropProgress(crop) : null;
  const stageProgress = progress ? ((STAGE_ORDER.indexOf(progress.stage) + 1) / STAGE_ORDER.length) * 100 : 0;
  const topMarket = marketRecords[0];

  return (
    <div className="space-y-6 animate-fade-up">
      {/* Greeting */}
      <div>
        <h1 className="font-display text-2xl sm:text-3xl font-semibold">
          {t(greetingKey())}, {profile?.name ?? "Farmer"} 🌾
        </h1>
        <p className="text-ink-light text-sm mt-1">
          {profile?.district ? `${profile.district}, ${profile.state}` : t("nav.setLocation")}
        </p>
      </div>

      <LocationNotice />
      <FarmerQuoteTicker />

      {allFarms.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <StatCard icon={Sprout} label={t("dashboard.totalFarms")} value={String(allFarms.length)} />
          <StatCard icon={Sprout} label={t("dashboard.cultivatedArea")} value={`${totalCultivatedAcres} ${t("farm.acres")}`} tone="clay" />
          <StatCard icon={Sprout} label={t("dashboard.activeCrops")} value={String(allCrops.length)} />
          <StatCard icon={Bug} label={t("dashboard.overdueTasks")} value={String(overdueTasks)} tone={overdueTasks > 0 ? "rust" : "forest"} />
        </div>
      )}

      <div className="grid lg:grid-cols-3 gap-5">
        {/* Weather */}
        <Link href="/weather" className="card p-5 hover:shadow-none transition-shadow group">
          <div className="flex items-center justify-between">
            <span className="section-eyebrow">{t("nav.weather")}</span>
            <CloudSun className="text-clay-400" size={20} />
          </div>
          {weather ? (
            <>
              <p className="mt-3 text-4xl font-display font-semibold">{weather.current.temperatureC}°C</p>
              <p className="text-sm text-ink-light mt-1">{weather.current.condition}</p>
              <div className="mt-3 flex gap-4 text-xs text-ink-light">
                <span>{t("weather.humidity")} {weather.current.humidity}%</span>
                <span>{t("weather.rainChance")} {weather.current.rainProbability}%</span>
              </div>
              {weather.current.isDemo && <span className="chip mt-3">{t("weather.demoNotice")}</span>}
            </>
          ) : (
            <div className="skeleton h-20 mt-3" />
          )}
        </Link>

        {/* Active Crop */}
        <div className="card p-5 lg:col-span-2">
          <Link href="/farm" className="block group">
            <div className="flex items-center justify-between">
              <span className="section-eyebrow">{t("dashboard.activeCrop")}</span>
              {crop && <span className="chip">{t("farm.day")} {progress?.dayNumber ?? "–"}</span>}
            </div>
            {crop === undefined ? (
              <div className="skeleton h-20 mt-3" />
            ) : crop ? (
              <>
                <div className="flex items-baseline gap-2 mt-3">
                  <p className="text-2xl font-display font-semibold">{crop.name}</p>
                  <span className="text-sm text-ink-light">{crop.areaAcres} {t("farm.acres")}</span>
                </div>
                <p className="text-sm text-forest-700 font-semibold mt-1 capitalize">
                  {progress?.stage.replace("_", " ")}
                </p>
                <ProgressBar value={stageProgress} className="mt-3" />
                <p className="text-xs text-ink-light mt-2">
                  {t("dashboard.nextTask")}: {pendingTasks[0]?.title ?? t("dashboard.noPendingTasks")}
                </p>
              </>
            ) : (
              <div className="mt-3">
                <p className="text-sm text-ink-light">{t("farm.noCropsTitle")}</p>
                <span className="btn-secondary text-sm mt-3 inline-flex">
                  <Sprout size={15} /> {t("farm.addCrop")}
                </span>
              </div>
            )}
          </Link>

          {!isDemoMode && crop === null && sampleVisible && sampleCrop && (
            <div className="mt-4 pt-4 border-t border-dashed border-forest-100">
              <div className="flex items-center justify-between">
                <p className="text-xs font-semibold text-ink-light uppercase tracking-wide">{t("dashboard.sampleCropPreview")}</p>
                <SampleBadge />
              </div>
              <div className="flex items-baseline gap-2 mt-2">
                <p className="text-lg font-display font-semibold">{sampleCrop.name}</p>
                <span className="text-sm text-ink-light">{sampleCrop.areaAcres} {t("farm.acres")}</span>
              </div>
              <p className="text-sm text-forest-700 font-semibold mt-1 capitalize">
                {computeCropProgress(sampleCrop).stage.replace("_", " ")}
              </p>
              <ProgressBar value={((STAGE_ORDER.indexOf(computeCropProgress(sampleCrop).stage) + 1) / STAGE_ORDER.length) * 100} className="mt-3" />
              <p className="text-xs text-ink-light mt-3">{t("farm.sampleExplainer")}</p>
              <button onClick={dismissSample} className="text-xs font-semibold text-forest-700 mt-2">
                {t("farm.dismissSample")}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 sm:gap-3">
        <QuickAction href="/farm" icon={Sprout} label={t("nav.farm")} />
        <QuickAction href="/weather" icon={CloudSun} label={t("nav.weather")} />
        <QuickAction href="/market" icon={TrendingUp} label={t("nav.market")} />
        <QuickAction href="/crop-doctor" icon={Stethoscope} label={t("nav.cropDoctor")} />
        <QuickAction href="/irrigation" icon={Droplets} label={t("nav.irrigation")} />
        <QuickAction href="/ai" icon={Bot} label={t("nav.ai")} />
        <QuickAction href="/ai" icon={Mic} label={t("ai.tapToSpeak")} />
      </div>

      {/* Smart Farm Alerts */}
      <div>
        <SectionHeading eyebrow={t("dashboard.alerts")} title={t("dashboard.smartAlerts")} />
        {alerts.length === 0 ? (
          <div className="card p-5 text-sm text-ink-light">{t("dashboard.noAlerts")}</div>
        ) : (
          <div className="grid sm:grid-cols-2 gap-3">
            {alerts.map((a) => (
              <div key={a.id} className="card p-4">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    {a.type === "disease" ? (
                      <Bug size={16} className="text-clay-500" />
                    ) : a.type === "irrigation" ? (
                      <Droplets size={16} className="text-clay-500" />
                    ) : (
                      <CloudSun size={16} className="text-clay-500" />
                    )}
                    <p className="font-semibold text-sm">{a.title}</p>
                  </div>
                  <SeverityBadge severity={a.severity} />
                </div>
                <p className="text-sm text-ink-light mt-2">{a.message}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="grid lg:grid-cols-2 gap-5">
        {/* Market */}
        <div className="card p-5">
          <div className="flex items-center justify-between">
            <span className="section-eyebrow">{t("nav.market")}</span>
            <TrendingUp className="text-clay-400" size={20} />
          </div>
          {marketLoading ? (
            <div className="skeleton h-20 mt-3" />
          ) : marketLive && topMarket ? (
            <>
              <p className="mt-3 font-display text-lg font-semibold">{topMarket.commodity}</p>
              <p className="text-2xl font-semibold text-forest-700 mt-1">
                ₹{topMarket.modalPrice.toLocaleString("en-IN")}
                <span className="text-sm text-ink-light font-normal"> /quintal</span>
              </p>
              <p className="text-xs text-ink-light mt-1">{topMarket.market}</p>
            </>
          ) : (
            <p className="text-sm text-ink-light mt-3">{t("market.unavailable")}</p>
          )}
          <Link href="/market" className="btn-ghost mt-3 px-0 text-forest-700">
            {t("market.title")} <ArrowRight size={14} />
          </Link>
        </div>

        {/* Government */}
        <div className="card p-5">
          <div className="flex items-center justify-between">
            <span className="section-eyebrow">{t("nav.government")}</span>
            <Landmark className="text-clay-400" size={20} />
          </div>
          <p className="mt-3 text-sm text-ink-light">
            <strong className="text-ink">{schemes.length}</strong> {t("dashboard.relevantSchemes")}
          </p>
          <div className="mt-3 space-y-2">
            {schemes.map((s) => (
              <div key={s.id} className="flex items-center justify-between text-sm gap-2">
                <span className="truncate">{s.name}</span>
                <span className="chip shrink-0">
                  {t(matchCategory(s.matchPercent) === "likely" ? "government.likelyRelevant" : "government.mayBeRelevant")}
                </span>
              </div>
            ))}
          </div>
          <Link href="/government" className="btn-ghost mt-3 px-0 text-forest-700">
            {t("dashboard.browseAllServices")} <ArrowRight size={14} />
          </Link>
        </div>
      </div>

      {/* Ask AgroGuide */}
      <Link href="/ai" className="card p-5 flex items-center gap-4 bg-forest-800 text-cream-50 border-forest-700">
        <div className="w-11 h-11 rounded-full bg-forest-600 flex items-center justify-center shrink-0">
          <Bot size={22} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-display font-semibold">{t("nav.ai")}</p>
          <p className="text-sm text-cream-100/70 truncate">{t("ai.inputPlaceholder")}</p>
        </div>
        <ArrowRight size={18} />
      </Link>

      {/* Lifecycle strip */}
      {crop && progress && (
        <div>
          <SectionHeading eyebrow={t("farm.cropLifecycle")} title={t("dashboard.whereCropStands")} />
          <div className="flex gap-2 overflow-x-auto pb-2">
            {STAGE_ORDER.map((s, i) => {
              const idx = STAGE_ORDER.indexOf(progress.stage);
              const isCurrent = idx === i;
              const isPast = idx > i;
              return (
                <div
                  key={s}
                  className={`shrink-0 px-3.5 py-2 rounded-full text-xs font-semibold border capitalize ${
                    isCurrent
                      ? "bg-forest-600 text-cream-50 border-forest-600"
                      : isPast
                      ? "bg-forest-50 text-forest-700 border-forest-100"
                      : "bg-cream-50 text-ink-light border-forest-100"
                  }`}
                >
                  {s.replace("_", " ")}
                </div>
              );
            })}
          </div>
        </div>
      )}
      {/* Onboarding Modal for first-time farmer */}
      {showOnboarding && (
        <FarmerOnboardingModal
          onCompleted={() => {
            setShowOnboarding(false);
            loadDashboardData();
          }}
        />
      )}
    </div>
  );
}

function QuickAction({ href, icon: Icon, label }: { href: string; icon: typeof Sprout; label: string }) {
  return (
    <Link
      href={href}
      className="card p-2 sm:p-4 min-w-0 overflow-hidden flex flex-col items-center justify-center gap-1 sm:gap-2 text-center hover:shadow-none transition-shadow"
    >
      <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-forest-50 flex items-center justify-center text-forest-600 shrink-0">
        <Icon size={17} />
      </div>
      <span className="text-[10px] sm:text-xs font-semibold leading-tight line-clamp-2">{label}</span>
    </Link>
  );
}
