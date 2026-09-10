"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import {
  ShieldCheck,
  Sprout,
  MapPin,
  Calendar,
  CheckCircle2,
  Award,
  Sparkles,
  ExternalLink,
  Lock,
} from "lucide-react";
import { getPublicTraceBatch } from "@/lib/services/traceabilityService";
import type { PublicTraceBatchPayload } from "@/types";

export default function PublicTraceabilityCertificatePage() {
  const params = useParams();
  const batchCode = typeof params.batchCode === "string" ? params.batchCode : "";

  const [traceData, setTraceData] = useState<PublicTraceBatchPayload | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      if (!batchCode) return;
      setLoading(true);
      const data = await getPublicTraceBatch(batchCode, true);
      setTraceData(data);
      setLoading(false);
    }
    load();
  }, [batchCode]);

  if (loading) {
    return (
      <div className="min-h-screen bg-forest-950 text-cream-50 flex items-center justify-center p-4">
        <div className="text-center space-y-2">
          <div className="w-8 h-8 border-2 border-forest-400 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs text-forest-300">Verifying batch provenance certificate…</p>
        </div>
      </div>
    );
  }

  if (!traceData) {
    return (
      <div className="min-h-screen bg-forest-950 text-cream-50 flex items-center justify-center p-4">
        <div className="card max-w-md w-full bg-forest-900 border-forest-800 p-8 text-center space-y-4 rounded-2xl">
          <Lock size={36} className="mx-auto text-rust-400" />
          <h1 className="text-lg font-bold">Trace Batch Not Found or Private</h1>
          <p className="text-xs text-forest-200">
            This produce batch identifier does not exist or public sharing has been revoked by the farmer.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-forest-950 via-forest-900 to-forest-950 text-cream-50 flex flex-col items-center justify-center p-4 sm:p-6">
      <div className="max-w-lg w-full bg-white text-ink rounded-3xl shadow-2xl overflow-hidden border border-forest-200/40">
        {/* Certificate Top Banner */}
        <div className="bg-gradient-to-r from-forest-800 to-forest-700 p-6 text-cream-50 text-center space-y-2 relative">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-forest-900/60 border border-forest-600 text-forest-200 shadow-sm">
            <ShieldCheck size={14} className="text-forest-400" />
            Verified Harvest Provenance
          </div>
          <h1 className="text-2xl font-bold font-display tracking-tight text-white">
            {traceData.crop}
          </h1>
          <div className="text-xs text-forest-200 font-mono tracking-wide">
            Batch Code: {traceData.batchCode}
          </div>
        </div>

        {/* Certificate Content Body */}
        <div className="p-6 sm:p-8 space-y-6">
          {/* Variety & Grade Highlight */}
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3.5 rounded-2xl bg-forest-50/70 border border-forest-100">
              <span className="text-[10px] uppercase font-bold text-forest-700 flex items-center gap-1">
                <Sprout size={12} /> Seed / Variety
              </span>
              <div className="text-sm font-bold text-ink mt-0.5">{traceData.variety}</div>
            </div>

            <div className="p-3.5 rounded-2xl bg-forest-50/70 border border-forest-100">
              <span className="text-[10px] uppercase font-bold text-forest-700 flex items-center gap-1">
                <Award size={12} /> Quality Grade
              </span>
              <div className="text-sm font-bold text-ink mt-0.5">{traceData.qualityGrade}</div>
            </div>
          </div>

          {/* Location & Harvest Date */}
          <div className="space-y-3 border-y border-forest-100 py-4 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-ink-light flex items-center gap-1.5">
                <MapPin size={14} className="text-forest-600" /> Geographic Origin:
              </span>
              <span className="font-semibold text-ink">
                {traceData.district}, {traceData.state}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-ink-light flex items-center gap-1.5">
                <Calendar size={14} className="text-forest-600" /> Harvest Date:
              </span>
              <span className="font-semibold text-ink">{traceData.harvestDate}</span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-ink-light flex items-center gap-1.5">
                <CheckCircle2 size={14} className="text-forest-600" /> Farmer Partner:
              </span>
              <span className="font-semibold text-forest-800">{traceData.farmerDisplayName}</span>
            </div>
          </div>

          {/* Trust Seal Footer */}
          <div className="p-4 rounded-2xl bg-cream-50 border border-forest-100 text-center space-y-1">
            <div className="text-[11px] font-semibold text-forest-900 flex items-center justify-center gap-1.5">
              <Sparkles size={14} className="text-amber-500" />
              {traceData.verifiedBy}
            </div>
            <p className="text-[10px] text-ink-light">
              Cryptographically timestamped on {traceData.traceTimestamp.slice(0, 10)}. Direct from farm to fork.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
