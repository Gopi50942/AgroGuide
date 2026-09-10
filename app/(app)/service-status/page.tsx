"use client";

import { useState } from "react";
import { Search, CheckCircle, Clock, ShieldCheck } from "lucide-react";
import { useLanguage } from "@/hooks/useLanguage";
import { lookupPublicServiceStatus } from "@/lib/services/publicServiceStatusService";
import type { PublicServiceLookupResult } from "@/types";

export default function PublicServiceStatusPage() {
  const { language } = useLanguage();
  const [refInput, setRefInput] = useState("");
  const [result, setResult] = useState<PublicServiceLookupResult | null>(null);
  const [searched, setSearched] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleLookup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!refInput) return;
    setLoading(true);
    setSearched(true);
    try {
      const res = await lookupPublicServiceStatus(refInput);
      setResult(res);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="space-y-6 max-w-3xl mx-auto pb-12">
      <div className="card p-6 bg-gradient-to-r from-forest-800 to-forest-950 text-cream-50 text-center space-y-2 border border-forest-700 shadow-md">
        <h1 className="text-2xl font-bold tracking-tight">
          {language === "ta" ? "விவசாயி சேவை நிலை அறிதல்" : "Public Farmer Service Status Portal"}
        </h1>
        <p className="text-xs text-cream-200/80 max-w-xl mx-auto">
          {language === "ta"
            ? "உங்கள் குறைதீர்ப்பு (Grievance), அவசர SOS அல்லது ஆய்வு மனுவின் நடப்பு நிலையை அறிய குறிப்பு எண்ணை உள்ளிடவும்."
            : "Track current processing status of your grievance redressal, inspection dossier, or Agri SOS request without revealing personal information."}
        </p>
      </div>

      <div className="card p-6 border border-forest-100 bg-white space-y-4">
        <form onSubmit={handleLookup} className="flex gap-2">
          <input
            type="text"
            placeholder="Enter reference number (e.g. AG-GRV-CBE-2026-000123, SOS-CBE-001)..."
            value={refInput}
            onChange={(e) => setRefInput(e.target.value)}
            className="flex-1 text-xs p-3 rounded-xl border border-forest-200 focus:outline-none focus:ring-1 focus:ring-forest-500 uppercase font-mono"
          />
          <button
            type="submit"
            disabled={loading}
            className="px-5 py-3 bg-forest-700 hover:bg-forest-800 text-cream-50 rounded-xl text-xs font-semibold transition-colors flex items-center gap-1.5"
          >
            <Search size={14} />
            {loading ? "Searching..." : "Track Status"}
          </button>
        </form>

        {searched && (
          <div className="pt-3 border-t border-forest-100">
            {result ? (
              <div className="p-4 rounded-xl bg-forest-50/70 border border-forest-200 text-xs space-y-2">
                <div className="flex items-center justify-between font-bold text-ink">
                  <span className="font-mono text-forest-800">{result.referenceNumber}</span>
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px]">
                    {result.status}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-[11px] text-ink-light">
                  <div>Service Category: <strong className="text-ink">{result.serviceType}</strong></div>
                  <div>Last Updated: <strong className="text-ink">{new Date(result.lastUpdated).toLocaleDateString()}</strong></div>
                </div>
                <div className="p-2.5 bg-white rounded-lg border border-forest-100 text-ink">
                  <p className="font-semibold text-[11px] text-forest-900">
                    Next Processing Milestone:
                  </p>
                  <p className="text-xs mt-0.5">
                    {language === "ta" ? result.nextStepTa : result.nextStepEn}
                  </p>
                </div>
                <p className="text-[10px] text-ink-light italic flex items-center gap-1 pt-1">
                  <ShieldCheck size={12} className="text-forest-600" />
                  Privacy Protected: Personal farmer identity & bank details are never exposed on public tracking portals.
                </p>
              </div>
            ) : (
              <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900 text-center">
                No matching service record found for reference <strong>{refInput}</strong>. Please verify the code on your receipt.
              </div>
            )}
          </div>
        )}
      </div>
    </main>
  );
}
