"use client";

import { useState } from "react";
import {
  Sprout,
  CheckCircle2,
  Clock,
  Droplets,
  FlaskConical,
  Stethoscope,
  Receipt,
  Wheat,
  TrendingUp,
  BookOpen,
  CloudRain,
  Filter,
} from "lucide-react";
import { useLanguage } from "@/hooks/useLanguage";
import type { TimelineEvent } from "@/types";

export function FarmActivityTimeline({
  events,
  crops = [],
}: {
  events: TimelineEvent[];
  crops?: Array<{ id: string; name: string }>;
}) {
  const { language, t } = useLanguage();
  const [selectedCrop, setSelectedCrop] = useState<string>("all");
  const [selectedType, setSelectedType] = useState<string>("all");

  const filteredEvents = events.filter((e) => {
    if (selectedCrop !== "all" && e.cropId && e.cropId !== selectedCrop) return false;
    if (selectedType !== "all" && e.type !== selectedType) return false;
    return true;
  });

  const getEventIcon = (type: string) => {
    switch (type) {
      case "crop_sowing":
        return <Sprout size={16} className="text-forest-700" />;
      case "task_completed":
        return <CheckCircle2 size={16} className="text-forest-600" />;
      case "task_scheduled":
        return <Clock size={16} className="text-clay-600" />;
      case "irrigation_recorded":
        return <Droplets size={16} className="text-forest-600" />;
      case "soil_test":
        return <FlaskConical size={16} className="text-forest-800" />;
      case "disease_scan":
        return <Stethoscope size={16} className="text-rust-600" />;
      case "expense_logged":
        return <Receipt size={16} className="text-rust-700" />;
      case "harvest_recorded":
        return <Wheat size={16} className="text-wheat-700" />;
      case "sale_recorded":
        return <TrendingUp size={16} className="text-forest-700" />;
      case "diary_note":
        return <BookOpen size={16} className="text-forest-600" />;
      case "weather_alert":
        return <CloudRain size={16} className="text-rust-600" />;
      default:
        return <Sprout size={16} className="text-forest-700" />;
    }
  };

  const getEventBg = (type: string) => {
    switch (type) {
      case "crop_sowing":
        return "bg-forest-100 border-forest-300";
      case "task_completed":
        return "bg-forest-50 border-forest-200";
      case "task_scheduled":
        return "bg-cream-100 border-cream-300";
      case "irrigation_recorded":
        return "bg-forest-50 border-forest-200";
      case "soil_test":
        return "bg-wheat-100 border-wheat-300";
      case "disease_scan":
        return "bg-rust-50 border-rust-200";
      case "expense_logged":
        return "bg-cream-100 border-cream-200";
      case "harvest_recorded":
        return "bg-wheat-100 border-wheat-400";
      case "sale_recorded":
        return "bg-forest-100 border-forest-300";
      case "weather_alert":
        return "bg-rust-100 border-rust-300";
      default:
        return "bg-cream-50 border-cream-200";
    }
  };

  return (
    <div className="space-y-4">
      {/* Filters Header */}
      <div className="card p-3.5 bg-cream-50/70 border-forest-100 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Filter size={15} className="text-forest-700" />
          <span className="text-xs font-bold text-forest-950 font-serif">
            {t("timeline.filterTitle")} ({filteredEvents.length})
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {crops.length > 0 && (
            <select
              value={selectedCrop}
              onChange={(e) => setSelectedCrop(e.target.value)}
              className="input-field text-xs py-1 px-2 max-w-[140px]"
            >
              <option value="all">{t("timeline.allCrops")}</option>
              {crops.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          )}

          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="input-field text-xs py-1 px-2 max-w-[150px]"
          >
            <option value="all">{t("timeline.allEvents")}</option>
            <option value="crop_sowing">{t("timeline.typeSowing")}</option>
            <option value="task_completed">{t("timeline.typeTask")}</option>
            <option value="irrigation_recorded">{t("timeline.typeIrrigation")}</option>
            <option value="soil_test">{t("timeline.typeSoil")}</option>
            <option value="disease_scan">{t("timeline.typeDisease")}</option>
            <option value="expense_logged">{t("timeline.typeExpense")}</option>
            <option value="harvest_recorded">{t("timeline.typeHarvest")}</option>
            <option value="sale_recorded">{t("timeline.typeSale")}</option>
            <option value="diary_note">{t("timeline.typeDiary")}</option>
          </select>
        </div>
      </div>

      {/* Timeline Stream */}
      <div className="relative pl-6 space-y-4 before:content-[''] before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-forest-200">
        {filteredEvents.map((event) => {
          const title = language === "ta" ? event.titleTa : event.titleEn;
          const desc = language === "ta" ? event.descriptionTa : event.descriptionEn;

          return (
            <div key={event.id} className="relative group">
              {/* Event Dot */}
              <div
                className={`absolute -left-6 top-2 w-5 h-5 rounded-full border flex items-center justify-center bg-white shadow-sm shrink-0 z-10`}
              >
                {getEventIcon(event.type)}
              </div>

              {/* Event Content Card */}
              <div
                className={`card p-3.5 space-y-1.5 transition-all hover:shadow-md border ${getEventBg(
                  event.type
                )}`}
              >
                <div className="flex flex-wrap items-center justify-between gap-1 text-xs">
                  <div className="flex items-center gap-1.5 font-bold text-forest-950">
                    <span>{title}</span>
                    {event.cropName && (
                      <span className="chip bg-forest-100/80 text-forest-900 text-[10px] py-0 px-1.5">
                        {event.cropName}
                      </span>
                    )}
                  </div>
                  <span className="text-[11px] text-ink-light font-mono font-medium">
                    {event.date}
                  </span>
                </div>

                {desc && (
                  <p className="text-xs text-forest-900 leading-relaxed font-sans opacity-90">
                    {desc}
                  </p>
                )}

                {/* Additional metrics */}
                {(event.amount || event.quantity) && (
                  <div className="flex items-center gap-3 pt-1 text-[11px] font-semibold text-forest-950">
                    {event.amount && (
                      <span className={event.type === "expense_logged" ? "text-rust-700" : "text-forest-700"}>
                        ₹{event.amount.toLocaleString("en-IN")}
                      </span>
                    )}
                    {event.quantity && (
                      <span className="text-ink-light">
                        {event.quantity} {event.unit || ""}
                      </span>
                    )}
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {filteredEvents.length === 0 && (
          <div className="card p-8 text-center bg-cream-50/50 border-dashed border-forest-200">
            <p className="text-sm text-ink-light font-medium">{t("timeline.noEvents")}</p>
            <p className="text-xs text-ink-light/75 mt-1">{t("timeline.noEventsHelp")}</p>
          </div>
        )}
      </div>
    </div>
  );
}
