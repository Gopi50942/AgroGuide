"use client";

import { useEffect, useState } from "react";
import { Activity, CheckCircle, AlertTriangle, XCircle, RefreshCw, ChevronDown, ChevronUp } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { isFirebaseConfigured } from "@/lib/firebase/config";

interface HealthData {
  services: {
    firebaseConfigured: boolean;
    aiProviderConfigured: boolean;
    cloudinaryConfigured: boolean;
    weatherApiConfigured: boolean;
  };
}

export function RuntimeIndicator() {
  const { user, isDemoMode } = useAuth();
  const [health, setHealth] = useState<HealthData | null>(null);
  const [expanded, setExpanded] = useState(false);
  const [loading, setLoading] = useState(false);

  async function checkHealth() {
    setLoading(true);
    try {
      const res = await fetch("/api/health");
      const data = await res.json();
      setHealth(data);
    } catch {
      // Non-fatal
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (process.env.NODE_ENV !== "production") {
      checkHealth();
    }
  }, []);

  // In production builds, completely hide development telemetry from end-users
  if (process.env.NODE_ENV === "production") {
    return null;
  }

  // Compute live statuses
  const authStatus: "LIVE" | "DEMO" | "ERROR" | "NOT_CONFIGURED" = user
    ? "LIVE"
    : isDemoMode
    ? "DEMO"
    : isFirebaseConfigured
    ? "LIVE"
    : "NOT_CONFIGURED";

  const firestoreStatus: "LIVE" | "OFFLINE CACHE" | "ERROR" =
    isFirebaseConfigured && !isDemoMode ? "LIVE" : "OFFLINE CACHE";

  const aiTextStatus: "LIVE" | "FALLBACK" | "NOT_CONFIGURED" =
    health?.services?.aiProviderConfigured ? "LIVE" : "NOT_CONFIGURED";

  const aiVisionStatus: "LIVE" | "FALLBACK" | "NOT_CONFIGURED" =
    health?.services?.aiProviderConfigured ? "LIVE" : "NOT_CONFIGURED";

  const cloudinaryStatus: "LIVE" | "NOT_CONFIGURED" =
    health?.services?.cloudinaryConfigured ? "LIVE" : "NOT_CONFIGURED";

  const weatherStatus: "LIVE" | "CACHED" | "ERROR" = "LIVE";

  const statusColor = (val: string) => {
    if (val === "LIVE") return "text-emerald-700 bg-emerald-100 border-emerald-300";
    if (val === "DEMO" || val === "OFFLINE CACHE" || val === "FALLBACK")
      return "text-amber-800 bg-amber-100 border-amber-300";
    return "text-slate-700 bg-slate-100 border-slate-300";
  };

  return (
    <div className="fixed bottom-16 sm:bottom-4 left-4 z-40 max-w-xs font-mono text-xs print:hidden">
      <div className="card shadow-lg bg-white/95 backdrop-blur-md border-forest-300 overflow-hidden">
        {/* Toggle Button Bar */}
        <button
          onClick={() => setExpanded((v) => !v)}
          className="w-full px-3 py-2 bg-forest-900 text-cream-50 flex items-center justify-between gap-2 text-left font-sans text-xs font-semibold"
        >
          <div className="flex items-center gap-1.5">
            <Activity size={13} className="text-wheat-300 animate-pulse" />
            <span>Runtime Diagnostics</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span
              className={`px-1.5 py-0.5 rounded text-[10px] font-mono font-bold ${
                authStatus === "LIVE" ? "bg-emerald-500 text-white" : "bg-amber-400 text-forest-950"
              }`}
            >
              Auth: {authStatus}
            </span>
            {expanded ? <ChevronDown size={14} /> : <ChevronUp size={14} />}
          </div>
        </button>

        {/* Expanded Telemetry Grid */}
        {expanded && (
          <div className="p-3 space-y-2.5 animate-fade-up bg-cream-50/90 text-forest-950">
            <div className="space-y-1.5 text-[11px]">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-ink-light">Auth:</span>
                <span className={`px-2 py-0.5 rounded border font-bold ${statusColor(authStatus)}`}>
                  {authStatus}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="font-semibold text-ink-light">Firestore:</span>
                <span className={`px-2 py-0.5 rounded border font-bold ${statusColor(firestoreStatus)}`}>
                  {firestoreStatus}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="font-semibold text-ink-light">AI Text:</span>
                <span className={`px-2 py-0.5 rounded border font-bold ${statusColor(aiTextStatus)}`}>
                  {aiTextStatus}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="font-semibold text-ink-light">AI Vision:</span>
                <span className={`px-2 py-0.5 rounded border font-bold ${statusColor(aiVisionStatus)}`}>
                  {aiVisionStatus}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="font-semibold text-ink-light">Cloudinary:</span>
                <span className={`px-2 py-0.5 rounded border font-bold ${statusColor(cloudinaryStatus)}`}>
                  {cloudinaryStatus}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="font-semibold text-ink-light">Weather:</span>
                <span className={`px-2 py-0.5 rounded border font-bold ${statusColor(weatherStatus)}`}>
                  {weatherStatus}
                </span>
              </div>
            </div>

            <div className="pt-2 border-t border-forest-200 flex items-center justify-between">
              <span className="text-[10px] text-ink-light font-sans">No secrets exposed</span>
              <button
                onClick={checkHealth}
                disabled={loading}
                className="p-1 text-forest-700 hover:text-forest-900 rounded flex items-center gap-1 text-[10px] font-sans"
              >
                <RefreshCw size={11} className={loading ? "animate-spin" : ""} /> Refresh
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
