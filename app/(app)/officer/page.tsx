"use client";

import { useState, useEffect } from "react";
import {
  ShieldCheck,
  Building2,
  Users,
  Search,
  Sprout,
  Activity,
  FileText,
  Droplet,
  CheckCircle2,
  AlertTriangle,
  Lock,
  ExternalLink,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useLanguage } from "@/hooks/useLanguage";
import {
  listConsentingFarmersForOfficer,
  DEMO_OFFICERS,
} from "@/lib/services/officerService";
import type { FarmerOfficerAccess, OfficerProfile } from "@/types";

export default function ExtensionOfficerPortalPage() {
  const { user, profile, isDemoMode } = useAuth();
  const { language, t } = useLanguage();
  const isTa = language === "ta";

  // Officer identity (defaults to sample verified officer for demonstration)
  const [currentOfficer, setCurrentOfficer] = useState<OfficerProfile>(DEMO_OFFICERS[0]);
  const [consentingFarmers, setConsentingFarmers] = useState<FarmerOfficerAccess[]>([]);
  const [selectedAccess, setSelectedAccess] = useState<FarmerOfficerAccess | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);
      const list = await listConsentingFarmersForOfficer(currentOfficer.uid, isDemoMode);
      setConsentingFarmers(list);
      if (list.length > 0) setSelectedAccess(list[0]);
      setLoading(false);
    }
    load();
  }, [currentOfficer, isDemoMode]);

  const filteredFarmers = consentingFarmers.filter(
    (f) =>
      f.farmerName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      f.farmerDistrict?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Officer Header Card */}
      <div className="card p-6 bg-gradient-to-r from-forest-900 to-forest-800 text-cream-50 rounded-2xl shadow-lg border border-forest-700">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-forest-700 text-forest-100 border border-forest-600 flex items-center gap-1">
                <ShieldCheck size={12} />
                {isTa ? "சரிபார்க்கப்பட்ட வேளாண் அலுவலர் முகப்பு" : "Verified Extension Officer Portal"}
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] bg-amber-500/20 text-amber-300 border border-amber-500/30">
                {isTa ? "அனுமதி அடிப்படையிலானது" : "Consent-Gated"}
              </span>
            </div>
            <h1 className="text-2xl font-bold font-display">{currentOfficer.name}</h1>
            <p className="text-xs text-forest-200">
              {currentOfficer.designation} · {currentOfficer.officeName} ({currentOfficer.district})
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs bg-forest-950/40 p-2.5 rounded-xl border border-forest-700/50">
            <Lock size={14} className="text-forest-300" />
            <span>
              {isTa
                ? "விவசாயிகளின் வெளிப்படையான அனுமதியுடன் மட்டுமே தரவுகள் காண்பிக்கப்படுகின்றன."
                : "Displaying only farmers with active, verified consent."}
            </span>
          </div>
        </div>
      </div>

      {/* Main Split Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left: Consenting Farmers Directory */}
        <div className="card p-5 space-y-4 border-forest-100 bg-white">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-ink flex items-center gap-2">
              <Users size={16} className="text-forest-600" />
              {isTa ? "அனுமதியளித்த விவசாயிகள்" : "Consenting Farmers"}
              <span className="text-xs bg-forest-100 text-forest-800 px-2 py-0.5 rounded-full">
                {filteredFarmers.length}
              </span>
            </h2>
          </div>

          {/* Search */}
          <div className="relative">
            <Search size={14} className="absolute left-3 top-2.5 text-ink-lighter" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={isTa ? "விவசாயி / மாவட்டம் தேடுக..." : "Search farmer or district..."}
              className="w-full text-xs pl-9 pr-3 py-2 rounded-xl border border-forest-200 bg-cream-50/50 focus:outline-none focus:ring-1 focus:ring-forest-500"
            />
          </div>

          {/* List */}
          <div className="space-y-2">
            {filteredFarmers.length === 0 ? (
              <div className="text-center py-8 text-xs text-ink-lighter">
                {isTa ? "அனுமதி அளித்த விவசாயிகள் எவரும் இல்லை." : "No active consenting farmers found."}
              </div>
            ) : (
              filteredFarmers.map((access) => {
                const isSelected = selectedAccess?.id === access.id;
                return (
                  <button
                    key={access.id}
                    onClick={() => setSelectedAccess(access)}
                    className={`w-full text-left p-3 rounded-xl border text-xs transition-all ${
                      isSelected
                        ? "bg-forest-50 border-forest-500 shadow-sm"
                        : "bg-white border-forest-100 hover:border-forest-200"
                    }`}
                  >
                    <div className="font-semibold text-ink">{access.farmerName}</div>
                    <div className="text-[11px] text-ink-light flex items-center justify-between mt-1">
                      <span>{access.farmerDistrict}</span>
                      <span className="text-forest-700 font-medium">
                        {access.scopes.length} {isTa ? "அனுமதிகள்" : "scopes"}
                      </span>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* Right: Farmer Scoped Intelligence Dashboard */}
        <div className="md:col-span-2 space-y-4">
          {selectedAccess ? (
            <div className="card p-6 bg-white border-forest-100 space-y-6">
              {/* Farmer Info Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-forest-100 pb-4 gap-2">
                <div>
                  <h3 className="text-lg font-bold text-ink">{selectedAccess.farmerName}</h3>
                  <p className="text-xs text-ink-light">
                    {selectedAccess.farmerDistrict} · {isTa ? "அனுமதி வழங்கப்பட்டது:" : "Consent Granted:"}{" "}
                    {selectedAccess.grantedAt.slice(0, 10)} · {isTa ? "காலாவதி:" : "Expires:"}{" "}
                    {selectedAccess.expiresAt.slice(0, 10)}
                  </p>
                </div>
                <span className="inline-flex items-center gap-1 text-[11px] px-2.5 py-1 rounded-full bg-forest-100 text-forest-800 font-medium self-start">
                  <CheckCircle2 size={12} /> {isTa ? "செயலில் உள்ள அனுமதி" : "Active Consent"}
                </span>
              </div>

              {/* Scopes Badges */}
              <div>
                <h4 className="text-xs font-semibold text-ink-light uppercase tracking-wider mb-2">
                  {isTa ? "அனுமதிக்கப்பட்ட தகவல் எல்லைகள் (Granted Scopes)" : "Granted Data Scopes"}
                </h4>
                <div className="flex flex-wrap gap-1.5">
                  {selectedAccess.scopes.map((sc) => (
                    <span
                      key={sc}
                      className="px-2.5 py-1 rounded-lg text-xs bg-forest-50 text-forest-800 border border-forest-200"
                    >
                      {sc.replace("_", " ")}
                    </span>
                  ))}
                </div>
              </div>

              {/* Scoped Data Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Crop Status */}
                {selectedAccess.scopes.includes("crop_status") && (
                  <div className="p-4 rounded-xl border border-forest-100 bg-forest-50/30 space-y-2">
                    <div className="flex items-center gap-2 text-forest-800 font-semibold text-xs">
                      <Sprout size={16} />
                      {isTa ? "செயலில் உள்ள பயிர்கள்" : "Active Crops Status"}
                    </div>
                    <div className="text-xs text-ink">
                      <div className="font-medium">Hybrid Tomato F1 (2.5 Acres)</div>
                      <div className="text-ink-lighter text-[11px]">Sowing: Flowering Stage (Day 48)</div>
                    </div>
                  </div>
                )}

                {/* Soil Health */}
                {selectedAccess.scopes.includes("soil_reports") && (
                  <div className="p-4 rounded-xl border border-forest-100 bg-forest-50/30 space-y-2">
                    <div className="flex items-center gap-2 text-forest-800 font-semibold text-xs">
                      <Activity size={16} />
                      {isTa ? "சமீபத்திய மண் வள நிலை" : "Latest Soil Health"}
                    </div>
                    <div className="text-xs text-ink">
                      <div className="font-medium">pH: 6.8 · OC: 0.62%</div>
                      <div className="text-ink-lighter text-[11px]">N: Medium (280 ppm) · P: 18 ppm · K: 195 ppm</div>
                    </div>
                  </div>
                )}

                {/* Disease Diagnosis */}
                {selectedAccess.scopes.includes("disease_reports") && (
                  <div className="p-4 rounded-xl border border-forest-100 bg-forest-50/30 space-y-2">
                    <div className="flex items-center gap-2 text-forest-800 font-semibold text-xs">
                      <AlertTriangle size={16} className="text-amber-600" />
                      {isTa ? "கண்டறியப்பட்ட நோய் பதிவுகள்" : "Recent Diagnostic Scans"}
                    </div>
                    <div className="text-xs text-ink">
                      <div className="font-medium">Early Blight (Alternaria solani)</div>
                      <div className="text-ink-lighter text-[11px]">Severity: Moderate · Scanned 3 days ago</div>
                    </div>
                  </div>
                )}

                {/* Irrigation Water Budget */}
                {selectedAccess.scopes.includes("irrigation") && (
                  <div className="p-4 rounded-xl border border-forest-100 bg-forest-50/30 space-y-2">
                    <div className="flex items-center gap-2 text-forest-800 font-semibold text-xs">
                      <Droplet size={16} className="text-blue-600" />
                      {isTa ? "நீர்ப்பாசன நீர் தேவை" : "Irrigation Budget"}
                    </div>
                    <div className="text-xs text-ink">
                      <div className="font-medium">Drip Irrigation: 12,500 L/Day</div>
                      <div className="text-ink-lighter text-[11px]">Next watering recommended in 24 hrs</div>
                    </div>
                  </div>
                )}
              </div>

              {/* Officer Recommendation / Advisory Note Box */}
              <div className="p-4 rounded-xl bg-forest-50 border border-forest-200 space-y-3">
                <h4 className="text-xs font-semibold text-forest-900 flex items-center gap-1.5">
                  <FileText size={14} />
                  {isTa ? "அலுவலர் கள ஆய்வு ஆலோசனை குறிப்பு" : "Extension Advisory Note (Logged to Farmer Diary)"}
                </h4>
                <textarea
                  rows={3}
                  placeholder={
                    isTa
                      ? "விவசாயிக்கான கள வழிகாட்டல் குறிப்பை எழுதவும் (எ.கா. தாமிர அடிப்படையிலான பூஞ்சாணக்கொல்லி தெளிப்பு)..."
                      : "Enter agronomic recommendation note to push to farmer's advisory feed..."
                  }
                  className="w-full text-xs p-3 rounded-xl border border-forest-200 bg-white focus:outline-none focus:ring-1 focus:ring-forest-500"
                />
                <div className="flex justify-end">
                  <button
                    type="button"
                    className="px-4 py-1.5 text-xs font-semibold bg-forest-600 hover:bg-forest-700 text-white rounded-lg transition-all"
                  >
                    {isTa ? "ஆலோசனையை அனுப்பு" : "Send Official Advisory"}
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="card p-12 text-center text-ink-light bg-white border-forest-100">
              <Users size={32} className="mx-auto text-forest-400 mb-2" />
              <p className="text-sm font-medium">
                {isTa ? "விவரங்களைக் காண ஒரு விவசாயியைத் தேர்ந்தெடுக்கவும்." : "Select a farmer from the list to view granted records."}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
