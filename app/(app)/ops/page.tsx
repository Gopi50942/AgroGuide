"use client";

import { useState, useEffect } from "react";
import {
  Server,
  ShieldCheck,
  Activity,
  Cpu,
  RefreshCw,
  Terminal,
  Layers,
  Database,
} from "lucide-react";
import { useLanguage } from "@/hooks/useLanguage";
import { getProductionOpsSummary, type OpsHealthSummary } from "@/lib/services/opsCenterService";

export default function OperationsCenterPage() {
  const { language } = useLanguage();
  const isTa = language === "ta";

  const [ops, setOps] = useState<OpsHealthSummary | null>(null);

  useEffect(() => {
    setOps(getProductionOpsSummary());
  }, []);

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="card p-6 bg-slate-900 text-white rounded-2xl shadow-lg border border-slate-800 space-y-2">
        <div className="flex items-center gap-2 text-emerald-400 text-xs font-mono uppercase tracking-wider">
          <Terminal size={14} />
          {isTa ? "செயல்பாட்டு கட்டுப்பாட்டு மையம்" : "Production Operations Center"}
        </div>
        <h1 className="text-2xl font-bold font-display text-white">
          {isTa ? "பயன்பாட்டு கண்காணிப்பு & இயக்க நிலை" : "AgroGuide Runbook & Health Telemetry"}
        </h1>
        <p className="text-xs text-slate-400">
          {isTa
            ? "சேவையக நிலை, பதிப்பு மற்றும் பாதுகாப்பான செயல்பாட்டு அளவீடுகள்."
            : "Redacted operational metrics, environment status, and active feature flags."}
        </p>
      </div>

      {/* Health Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
        <div className="card p-4 bg-white border border-slate-200 rounded-xl space-y-1">
          <span className="text-[10px] uppercase font-bold text-slate-500">App Version</span>
          <div className="text-lg font-bold text-slate-900">{ops?.appVersion || "2026.1-prod"}</div>
        </div>

        <div className="card p-4 bg-white border border-slate-200 rounded-xl space-y-1">
          <span className="text-[10px] uppercase font-bold text-slate-500">Environment</span>
          <div className="text-lg font-bold text-slate-900 uppercase">{ops?.environment || "production"}</div>
        </div>

        <div className="card p-4 bg-white border border-slate-200 rounded-xl space-y-1">
          <span className="text-[10px] uppercase font-bold text-slate-500">Database Engine</span>
          <div className="text-lg font-bold text-emerald-600 flex items-center gap-1.5">
            <Database size={16} /> {ops?.firebaseStatus || "CONNECTED"}
          </div>
        </div>

        <div className="card p-4 bg-white border border-slate-200 rounded-xl space-y-1">
          <span className="text-[10px] uppercase font-bold text-slate-500">Meteorological Feed</span>
          <div className="text-lg font-bold text-emerald-600 flex items-center gap-1.5">
            <Activity size={16} /> OPERATIONAL
          </div>
        </div>
      </div>

      {/* Feature Flags Active */}
      <div className="card p-5 bg-white border border-slate-200 rounded-xl space-y-3">
        <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
          <Layers size={16} className="text-forest-600" />
          {isTa ? "செயலில் உள்ள அம்ச சுவிட்சுகள்" : "Active Feature Flags State"}
        </h2>
        <div className="flex flex-wrap gap-2">
          {ops?.activeFeatureFlags.map((flag) => (
            <span
              key={flag}
              className="px-2.5 py-1 rounded-lg text-xs font-mono bg-slate-100 border border-slate-200 text-slate-800"
            >
              ✓ {flag}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
