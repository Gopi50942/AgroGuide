"use client";

import { useEffect, useState, useMemo } from "react";
import { Droplets, Wind, Sun, Sunrise, Sunset, AlertCircle, ShieldAlert, Sparkles } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useSharedWeather } from "@/hooks/useSharedWeather";
import { buildWeatherAdvisories } from "@/lib/services/weatherService";
import {
  evaluateWeatherAlerts,
  syncWeatherAlertNotifications,
  type WeatherAlertItem,
} from "@/lib/services/weatherAlertService";
import { listCrops } from "@/lib/services/farmService";
import { DEMO_CROPS } from "@/data/demoData";
import { SectionHeading, WhyDisclosure, SeverityBadge } from "@/components/ui/Primitives";
import { LocationNotice } from "@/components/ui/LocationNotice";
import { formatDataFreshness } from "@/hooks/useNetworkStatus";
import { useLanguage } from "@/hooks/useLanguage";
import type { Crop } from "@/types";

export default function WeatherPage() {
  const { profile, isDemoMode } = useAuth();
  const { t, language } = useLanguage();
  const { weather, loading, isCached, cachedAt } = useSharedWeather();
  const [crops, setCrops] = useState<Crop[]>([]);

  useEffect(() => {
    if (!profile) return;
    if (isDemoMode) {
      setCrops(DEMO_CROPS);
      return;
    }
    listCrops(profile.uid).then(setCrops).catch(() => {});
  }, [profile, isDemoMode]);

  const dynamicAlerts: WeatherAlertItem[] = useMemo(() => {
    return weather ? evaluateWeatherAlerts(weather, crops, language) : [];
  }, [weather, crops, language]);

  useEffect(() => {
    if (profile && dynamicAlerts.length > 0) {
      syncWeatherAlertNotifications(profile.uid, dynamicAlerts, isDemoMode);
    }
  }, [profile, dynamicAlerts, isDemoMode]);

  if (loading || !weather) {
    return (
      <div className="space-y-4">
        <LocationNotice />
        <div className="skeleton h-32" />
        <div className="skeleton h-40" />
      </div>
    );
  }

  const { current, hourly, daily } = weather;
  const advisories = buildWeatherAdvisories(weather);
  const freshness = cachedAt ? formatDataFreshness(cachedAt, language) : null;

  return (
    <div className="space-y-6 animate-fade-up">
      <SectionHeading
        eyebrow={t("nav.weather")}
        title={profile?.district ? `${profile.district}, ${profile.state}` : t("location.yourLocation")}
      />

      <LocationNotice />

      {isCached && freshness && (
        <div className="card p-3 bg-wheat-100/70 border-wheat-300 text-xs text-forest-900 flex items-center justify-between">
          <span className="font-medium">💾 {t("weather.cachedNotice")} ({freshness.label})</span>
          <span className="text-[11px] opacity-75">{t("weather.offlineNote")}</span>
        </div>
      )}

      {current.isDemo && !isCached && <span className="chip">{t("weather.demoNotice")}</span>}

      {/* ── Active Weather Alerts & Crop Advisories (Phase 15) ── */}
      {dynamicAlerts.length > 0 && (
        <div className="space-y-3">
          <SectionHeading title={t("weather.activeAlerts")} />
          {dynamicAlerts.map((alert) => (
            <div
              key={alert.id}
              className={`card p-4.5 border-l-4 ${
                alert.severity === "high"
                  ? "border-l-rust-500 bg-rust-50/40 border-rust-200"
                  : "border-l-wheat-500 bg-wheat-50/40 border-wheat-200"
              }`}
            >
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <ShieldAlert
                    size={18}
                    className={alert.severity === "high" ? "text-rust-600" : "text-wheat-700"}
                  />
                  <h4 className="font-bold text-sm text-forest-950">
                    {language === "ta" ? alert.titleTa : alert.title}
                  </h4>
                </div>
                <SeverityBadge severity={alert.severity} />
              </div>

              <p className="text-xs text-ink-light mt-1.5">
                {language === "ta" ? alert.messageTa : alert.message}
              </p>

              {/* Crop-aware impact */}
              {alert.cropContext && (
                <div className="mt-2 text-xs bg-cream-100/80 p-2.5 rounded-xl border border-forest-100 flex items-start gap-2">
                  <Sparkles size={14} className="text-wheat-600 shrink-0 mt-0.5" />
                  <p className="text-forest-900 font-medium">
                    {language === "ta" ? alert.cropContextTa : alert.cropContext}
                  </p>
                </div>
              )}

              {/* Action advice */}
              <div className="mt-2.5 flex items-start gap-1.5 text-xs text-forest-800 font-medium">
                <span className="font-bold">👉</span>
                <span>{language === "ta" ? alert.actionAdviceTa : alert.actionAdvice}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Current */}
      <div className="card p-6 flex flex-wrap items-center gap-8">
        <div>
          <p className="text-6xl font-display font-semibold">{current.temperatureC}°C</p>
          <p className="text-ink-light mt-1">{current.condition} · Feels like {current.feelsLikeC}°C</p>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-x-8 gap-y-3 text-sm">
          <Metric icon={Droplets} label={t("weather.humidity")} value={`${current.humidity}%`} />
          <Metric icon={Wind} label={t("weather.wind")} value={`${current.windKph} km/h`} />
          <Metric icon={Droplets} label={t("weather.rainChance")} value={`${current.rainProbability}%`} />
          <Metric icon={Sun} label={t("weather.uvIndex")} value={String(current.uvIndex)} />
          <Metric icon={Sunrise} label={t("weather.sunrise")} value={current.sunrise?.slice(-5) || "–"} />
          <Metric icon={Sunset} label={t("weather.sunset")} value={current.sunset?.slice(-5) || "–"} />
        </div>
      </div>

      {/* General Advisories */}
      <div>
        <SectionHeading title={t("weather.advisory")} />
        {advisories.length === 0 ? (
          <div className="card p-5 text-sm text-ink-light">{t("weather.noAdvisories")}</div>
        ) : (
          <div className="space-y-3">
            {advisories.map((a) => (
              <div key={a.id} className="card p-4">
                <div className="flex items-center justify-between">
                  <p className="font-semibold text-sm">{a.title}</p>
                  <SeverityBadge severity={a.severity} />
                </div>
                <p className="text-sm text-ink-light mt-1.5">{a.message}</p>
                <WhyDisclosure why={a.why} />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Hourly */}
      <div>
        <SectionHeading title={t("weather.hourlyForecast")} />
        <div className="flex gap-3 overflow-x-auto pb-2">
          {hourly.slice(0, 12).map((h, i) => (
            <div key={i} className="card p-3 min-w-[84px] text-center shrink-0">
              <p className="text-xs text-ink-light">{h.time.slice(-5)}</p>
              <p className="font-display font-semibold text-lg mt-1">{h.temperatureC}°</p>
              <p className="text-xs text-forest-600 mt-1 flex items-center justify-center gap-1">
                <Droplets size={11} /> {h.rainProbability}%
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* 7-day */}
      <div>
        <SectionHeading title={t("weather.sevenDayForecast")} />
        <div className="space-y-2">
          {daily.map((d) => (
            <div key={d.date} className="card p-4 flex items-center justify-between text-sm">
              <span className="font-medium w-28">{d.date}</span>
              <span className="text-ink-light flex-1">{d.condition}</span>
              <span className="text-xs text-forest-600 flex items-center gap-1 w-20">
                <Droplets size={12} /> {d.rainProbability}%
              </span>
              <span className="font-semibold">
                {d.maxC}° / {d.minC}°
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function Metric({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
}) {
  return (
    <div>
      <p className="text-xs text-ink-light flex items-center gap-1">
        <Icon size={12} className="text-forest-600" />
        {label}
      </p>
      <p className="font-semibold text-ink mt-0.5">{value}</p>
    </div>
  );
}
