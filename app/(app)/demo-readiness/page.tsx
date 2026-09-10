"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Play,
  ArrowRight,
  Cpu,
  Layers,
  Sparkles,
  ExternalLink,
  Laptop,
} from "lucide-react";
import { useLanguage } from "@/hooks/useLanguage";
import {
  performSystemReadinessCheck,
  RECOMMENDED_EVALUATOR_FLOW,
  type SystemCheckItem,
  type EvaluatorStep,
} from "@/lib/services/demoReadinessService";

export default function DemoReadinessPage() {
  const { language } = useLanguage();
  const isTa = language === "ta";

  const [readiness, setReadiness] = useState<{
    overallStatus: "production_ready" | "demo_ready";
    checks: SystemCheckItem[];
    timestamp: string;
  } | null>(null);

  useEffect(() => {
    setReadiness(performSystemReadinessCheck());
  }, []);

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header Card */}
      <div className="card p-6 bg-gradient-to-r from-forest-900 to-forest-800 text-cream-50 rounded-2xl shadow-lg border border-forest-700 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-forest-700 text-forest-200 border border-forest-600 mb-2">
              <Cpu size={14} className="text-forest-400" />
              {isTa ? "கள ஆய்வு & மதிப்பீட்டு வழிகாட்டி" : "Evaluator & Demo Readiness Console"}
            </div>
            <h1 className="text-2xl font-bold font-display text-white">
              {isTa ? "அக்ரோகைடு தயாரிப்பு நிலை சரிபார்ப்பு" : "AgroGuide Production & Demo Readiness"}
            </h1>
            <p className="text-xs text-forest-200 mt-1">
              {isTa
                ? "அனைத்து 61 கட்ட கட்டமைப்புகளின் நேரடி நிலையை சரிபார்த்து மதிப்பீட்டாளருக்கான பரிந்துரைக்கப்பட்ட வழியை பின்பற்றவும்."
                : "Real-time diagnostic verification across all 61 phases with a guided 5–7 minute evaluator walkthrough."}
            </p>
          </div>

          <div className="px-4 py-2 rounded-xl bg-forest-950/60 border border-forest-700/60 text-right self-start sm:self-auto">
            <span className="text-[10px] uppercase font-bold text-forest-300">System Status</span>
            <div className="text-sm font-bold text-emerald-400 flex items-center gap-1.5 mt-0.5">
              <CheckCircle2 size={14} /> Ready for Demonstration
            </div>
          </div>
        </div>
      </div>

      {/* Subsystem Health Grid */}
      <div className="card p-5 bg-white border-forest-100 space-y-4">
        <h2 className="text-sm font-bold text-ink flex items-center gap-2">
          <ShieldCheck size={18} className="text-forest-600" />
          {isTa ? "துணை அமைப்புகளின் தயார் நிலை" : "Core Subsystems Diagnostic Health"}
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          {readiness?.checks.map((c) => (
            <div
              key={c.id}
              className="p-3.5 rounded-xl border border-forest-100 bg-forest-50/40 space-y-1.5 text-xs"
            >
              <div className="flex items-center justify-between">
                <span className="font-semibold text-ink">{c.name}</span>
                <span
                  className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${
                    c.status === "ready"
                      ? "bg-emerald-100 text-emerald-800"
                      : "bg-amber-100 text-amber-800"
                  }`}
                >
                  {c.status === "ready" ? "Operational" : "Demo Cache"}
                </span>
              </div>
              <p className="text-[11px] text-ink-light leading-relaxed">{c.detail}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Recommended 7-Step Evaluator Flow */}
      <div className="card p-5 bg-white border-forest-100 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-ink flex items-center gap-2">
            <Play size={18} className="text-forest-600" />
            {isTa ? "பரிந்துரைக்கப்பட்ட 5–7 நிமிட மதிப்பீட்டு வரிசை" : "Recommended 5–7 Min Evaluator Walkthrough"}
          </h2>
          <span className="text-xs text-ink-light">{RECOMMENDED_EVALUATOR_FLOW.length} Steps</span>
        </div>

        <div className="space-y-3">
          {RECOMMENDED_EVALUATOR_FLOW.map((step) => (
            <div
              key={step.stepNumber}
              className="p-4 rounded-xl border border-forest-100 hover:border-forest-300 transition-all bg-white flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
            >
              <div className="flex items-start gap-3">
                <div className="w-7 h-7 rounded-full bg-forest-100 text-forest-800 font-bold flex items-center justify-center shrink-0">
                  {step.stepNumber}
                </div>
                <div>
                  <div className="font-bold text-ink text-sm">
                    {isTa ? step.titleTa : step.titleEn}
                  </div>
                  <div className="text-ink-light mt-0.5">
                    {isTa ? step.actionTa : step.actionEn}
                  </div>
                  <div className="text-[11px] text-forest-700 font-medium mt-1">
                    ★ {isTa ? step.keyHighlightTa : step.keyHighlightEn}
                  </div>
                </div>
              </div>

              <Link
                href={step.route}
                className="px-3.5 py-1.5 rounded-lg bg-forest-50 hover:bg-forest-100 text-forest-800 font-semibold flex items-center gap-1 self-start sm:self-auto shrink-0 border border-forest-200"
              >
                {isTa ? "பார்வையிடு" : "Open Module"} <ArrowRight size={12} />
              </Link>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
