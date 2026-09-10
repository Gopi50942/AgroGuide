"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Sun,
  Calendar,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Sparkles,
  Droplets,
  TrendingUp,
  Award,
} from "lucide-react";
import { useLanguage } from "@/hooks/useLanguage";
import { aggregateTodayActions, type TodayActionCard } from "@/lib/services/todayActionService";

export default function TodayPage() {
  const { language } = useLanguage();
  const isTa = language === "ta";

  // Demo fallback today actions
  const demoActions: TodayActionCard[] = [
    {
      id: "demo_1",
      type: "task",
      titleEn: "DAP Fertigation & Micro-Nutrient Spray",
      titleTa: "DAP உரமிடுதல் & நுண்ணூட்டச் சத்து தெளித்தல்",
      subtitleEn: "Hybrid Tomato • Day 45 (Vegetative Stage)",
      subtitleTa: "தக்காளி • நாள் 45 (வளர்ச்சிப் பருவம்)",
      priority: "urgent",
      actionLabelEn: "Mark Done",
      actionLabelTa: "முடிந்தது என குறி",
      actionRoute: "/calendar",
    },
    {
      id: "demo_2",
      type: "weather",
      titleEn: "Moderate Afternoon Thunderstorm Expected",
      titleTa: "பிற்பகலில் மிதமான இடி மின்னலுடன் கூடிய மழை",
      subtitleEn: "Coimbatore District • 65% Probability",
      subtitleTa: "கோயம்புத்தூர் மாவட்டம் • 65% வாய்ப்பு",
      priority: "high",
      actionLabelEn: "View Weather",
      actionLabelTa: "வானிலை காண்க",
      actionRoute: "/weather",
    },
    {
      id: "demo_3",
      type: "disease",
      titleEn: "Follow-up: Early Blight Leaf Treatment",
      titleTa: "கள ஆய்வு: தக்காளி இலைக்கருகல் நோய் தடுப்பு",
      subtitleEn: "Fungicide sprayed 3 days ago • Check new foliage",
      subtitleTa: "3 நாட்களுக்கு முன் மருந்து தெளிக்கப்பட்டது • புதிய இலைகளை சோதிக்கவும்",
      priority: "normal",
      actionLabelEn: "Open Crop Doctor",
      actionLabelTa: "பயிர் மருத்துவர்",
      actionRoute: "/crop-doctor",
    },
  ];

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header Banner */}
      <div className="card p-6 bg-gradient-to-r from-forest-800 to-forest-900 text-cream-50 rounded-2xl shadow-lg border border-forest-700 space-y-2">
        <div className="flex items-center gap-2 text-forest-300 text-xs font-semibold uppercase tracking-wider">
          <Sun size={15} className="text-amber-400" />
          {isTa ? "இன்றைய பண்ணை கள மையம்" : "Today's Field Action Center"}
        </div>
        <h1 className="text-2xl font-bold font-display text-white">
          {isTa ? "இன்று செய்ய வேண்டியவை" : "Today's Farm Priorities"}
        </h1>
        <p className="text-xs text-forest-200">
          {isTa
            ? "வானிலை, பாசனம், பயிர் பணிகள் மற்றும் சந்தை எச்சரிக்கைகளை ஒரே இடத்தில் காண்க."
            : "Centralized action cockpit uniting crop tasks, severe weather alerts, irrigation schedules, and market notices."}
        </p>
      </div>

      {/* Action Cards List */}
      <div className="space-y-3">
        {demoActions.map((action) => (
          <div
            key={action.id}
            className="card p-4 bg-white border border-forest-100 hover:border-forest-300 transition-all rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3"
          >
            <div className="flex items-start gap-3">
              <div
                className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 ${
                  action.priority === "urgent"
                    ? "bg-amber-100 text-amber-800"
                    : action.priority === "high"
                    ? "bg-blue-100 text-blue-800"
                    : "bg-forest-100 text-forest-800"
                }`}
              >
                {action.type === "weather" ? (
                  <Sun size={18} />
                ) : action.type === "task" ? (
                  <Calendar size={18} />
                ) : (
                  <CheckCircle2 size={18} />
                )}
              </div>

              <div>
                <div className="font-bold text-ink text-sm">
                  {isTa ? action.titleTa : action.titleEn}
                </div>
                <div className="text-xs text-ink-light mt-0.5">
                  {isTa ? action.subtitleTa : action.subtitleEn}
                </div>
              </div>
            </div>

            <Link
              href={action.actionRoute}
              className="px-4 py-2 rounded-xl bg-forest-700 hover:bg-forest-800 text-white text-xs font-semibold flex items-center gap-1.5 self-start sm:self-auto shrink-0 transition-colors shadow-sm"
            >
              {isTa ? action.actionLabelTa : action.actionLabelEn} <ArrowRight size={13} />
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}
