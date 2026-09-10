"use client";

import { useState, useEffect } from "react";
import {
  ShieldCheck,
  UserCheck,
  Building2,
  Calendar,
  Check,
  X,
  Lock,
  AlertCircle,
  Clock,
  Eye,
  Trash2,
} from "lucide-react";
import {
  listVerifiedOfficers,
  grantOfficerAccess,
  revokeOfficerAccess,
  listFarmerOfficerAccess,
  DEMO_OFFICERS,
} from "@/lib/services/officerService";
import { useAuth } from "@/hooks/useAuth";
import { useLanguage } from "@/hooks/useLanguage";
import { useToast } from "@/components/ui/Toast";
import type { OfficerProfile, FarmerOfficerAccess, OfficerAccessScope } from "@/types";

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

const ALL_SCOPES: { scope: OfficerAccessScope; labelEn: string; labelTa: string; descEn: string; descTa: string }[] = [
  {
    scope: "farm_summary",
    labelEn: "Farm Land & Location Summary",
    labelTa: "பண்ணை நிலம் & இருப்பிட சுருக்கம்",
    descEn: "Acreage, soil type, and general water source details.",
    descTa: "நில அளவு, மண் வகை மற்றும் நீர் ஆதாரம் பற்றிய தகவல்கள்.",
  },
  {
    scope: "crop_status",
    labelEn: "Active Crops & Sowing Stages",
    labelTa: "செயலில் உள்ள பயிர்கள் & வளர்ச்சி நிலைகள்",
    descEn: "Current crops, sowing dates, and lifecycle tasks.",
    descTa: "தற்போதைய பயிர்கள், விதைத்த தேதி மற்றும் வளர்ச்சிப் பணிகள்.",
  },
  {
    scope: "soil_reports",
    labelEn: "Soil Health Test Reports",
    labelTa: "மண் வள பரிசோதனை அறிக்கைகள்",
    descEn: "NPK, pH, EC, and organic carbon test values.",
    descTa: "NPK சத்துக்கள், pH, EC மற்றும் கரிம கரிமச்சத்து முடிவுகள்.",
  },
  {
    scope: "disease_reports",
    labelEn: "Crop Doctor Diagnostic Scans",
    labelTa: "பயிர் நோய் கண்டறிதல் பரிசோதனைகள்",
    descEn: "Identified crop symptoms and pest diagnoses.",
    descTa: "கண்டறியப்பட்ட பயிர் நோய் அறிகுறிகள் மற்றும் பூச்சித் தாக்குதல்கள்.",
  },
  {
    scope: "irrigation",
    labelEn: "Irrigation Logs & Water Budgets",
    labelTa: "நீர்ப்பாசன பதிவுகள் & நீர் வரவு செலவு",
    descEn: "Water schedule and daily calculated requirement.",
    descTa: "நீர்ப்பாசன அட்டவணை மற்றும் கணக்கிடப்பட்ட தினசரி நீர் தேவை.",
  },
  {
    scope: "scheme_support",
    labelEn: "Government Scheme Assistance",
    labelTa: "அரசு திட்ட உதவி & ஆலோசனைகள்",
    descEn: "Matched subsidies and application status assistance.",
    descTa: "பொருந்தக்கூடிய மானியங்கள் மற்றும் விண்ணப்ப நிலை உதவி.",
  },
];

export function FarmerOfficerConsentModal({ isOpen, onClose }: Props) {
  const { user, profile, isDemoMode } = useAuth();
  const { language, t } = useLanguage();
  const { showToast } = useToast();

  const isTa = language === "ta";
  const [officers, setOfficers] = useState<OfficerProfile[]>(DEMO_OFFICERS);
  const [activeGrants, setActiveGrants] = useState<FarmerOfficerAccess[]>([]);
  const [selectedOfficerId, setSelectedOfficerId] = useState<string>(DEMO_OFFICERS[0].uid);
  const [selectedScopes, setSelectedScopes] = useState<OfficerAccessScope[]>([
    "farm_summary",
    "crop_status",
    "soil_reports",
    "disease_reports",
  ]);
  const [durationDays, setDurationDays] = useState<number>(30);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!isOpen || !user) return;
    async function load() {
      const offList = await listVerifiedOfficers(profile?.district);
      setOfficers(offList);
      if (offList.length > 0) setSelectedOfficerId(offList[0].uid);

      if (user) {
        const grants = await listFarmerOfficerAccess(user.uid, isDemoMode);
        setActiveGrants(grants);
      }
    }
    load();
  }, [isOpen, user, profile, isDemoMode]);

  if (!isOpen) return null;

  function toggleScope(scope: OfficerAccessScope) {
    if (selectedScopes.includes(scope)) {
      setSelectedScopes(selectedScopes.filter((s) => s !== scope));
    } else {
      setSelectedScopes([...selectedScopes, scope]);
    }
  }

  async function handleGrant() {
    if (!user) return;
    const officer = officers.find((o) => o.uid === selectedOfficerId);
    if (!officer) return;
    if (selectedScopes.length === 0) {
      showToast(isTa ? "குறைந்தது ஒரு அனுமதியையாவது தேர்வு செய்யவும்." : "Please select at least one permission scope.", "warning");
      return;
    }

    setSaving(true);
    try {
      const grant = await grantOfficerAccess(
        user.uid,
        profile?.name || "Farmer",
        profile?.district || "Tamil Nadu",
        officer,
        selectedScopes,
        durationDays,
        isDemoMode
      );
      setActiveGrants((prev) => [...prev.filter((g) => g.id !== grant.id), grant]);
      showToast(isTa ? "அதிகாரிக்கு அணுகல் அனுமதி வெற்றிகரமாக வழங்கப்பட்டது." : "Access granted successfully to extension officer.", "success");
    } catch {
      showToast(t("common.error"), "error");
    }
    setSaving(false);
  }

  async function handleRevoke(accessId: string) {
    if (!user) return;
    try {
      await revokeOfficerAccess(user.uid, accessId, isDemoMode);
      setActiveGrants((prev) =>
        prev.map((g) => (g.id === accessId ? { ...g, granted: false, revokedAt: new Date().toISOString() } : g))
      );
      showToast(isTa ? "அணுகல் அனுமதி உடனடியாக ரத்து செய்யப்பட்டது." : "Access revoked immediately.", "info");
    } catch {
      showToast(t("common.error"), "error");
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/60 backdrop-blur-sm overflow-y-auto">
      <div className="card max-w-2xl w-full bg-white p-6 shadow-2xl rounded-2xl border border-forest-100 my-8 space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-forest-100 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-forest-50 flex items-center justify-center text-forest-600">
              <ShieldCheck size={24} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-ink">
                {isTa ? "வேளாண் அதிகாரி & KVK அணுகல் கட்டுப்பாடு" : "Extension Officer & KVK Access Control"}
              </h2>
              <p className="text-xs text-ink-light">
                {isTa
                  ? "உங்கள் அனுமதியின்றி எந்த அதிகாரியும் உங்கள் பண்ணைத் தரவை அணுக முடியாது."
                  : "No official can view your private farm records without your explicit, revocable consent."}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="text-ink-lighter hover:text-ink p-1">
            <X size={20} />
          </button>
        </div>

        {/* Existing Active Grants */}
        {activeGrants.filter((g) => g.granted && !g.revokedAt).length > 0 && (
          <div className="space-y-3 bg-forest-50/50 p-4 rounded-xl border border-forest-100">
            <h3 className="text-xs font-semibold text-forest-800 uppercase tracking-wider flex items-center gap-1.5">
              <UserCheck size={14} /> {isTa ? "தற்போது அனுமதிக்கப்பட்ட அதிகாரிகள்" : "Active Authorized Officers"}
            </h3>
            <div className="space-y-2">
              {activeGrants
                .filter((g) => g.granted && !g.revokedAt)
                .map((g) => (
                  <div
                    key={g.id}
                    className="flex items-center justify-between p-3 bg-white rounded-lg border border-forest-100 text-xs"
                  >
                    <div>
                      <div className="font-semibold text-ink">{g.officerName}</div>
                      <div className="text-ink-lighter">{g.officerDesignation}</div>
                      <div className="text-[10px] text-forest-600 mt-0.5">
                        {isTa ? "காலாவதி:" : "Expires:"} {g.expiresAt.slice(0, 10)} · {g.scopes.length} {isTa ? "அனுமதிகள்" : "scopes"}
                      </div>
                    </div>
                    <button
                      onClick={() => handleRevoke(g.id)}
                      className="px-2.5 py-1 text-xs text-rust-700 bg-rust-50 hover:bg-rust-100 border border-rust-200 rounded-lg flex items-center gap-1"
                    >
                      <Trash2 size={12} /> {isTa ? "ரத்து செய்" : "Revoke Access"}
                    </button>
                  </div>
                ))}
            </div>
          </div>
        )}

        {/* Grant New Officer Form */}
        <div className="space-y-4">
          <h3 className="text-sm font-semibold text-ink flex items-center gap-2">
            <Building2 size={16} className="text-forest-600" />
            {isTa ? "புதிய அதிகாரிக்கு அனுமதி வழங்கு" : "Authorize a Verified Officer"}
          </h3>

          <div>
            <label className="block text-xs font-medium text-ink-light mb-1">
              {isTa ? "சரிபார்க்கப்பட்ட KVK / வேளாண் துறை அதிகாரி" : "Select Verified KVK / Department Officer"}
            </label>
            <select
              value={selectedOfficerId}
              onChange={(e) => setSelectedOfficerId(e.target.value)}
              className="w-full text-xs p-2.5 rounded-lg border border-forest-200 bg-forest-50/20 text-ink focus:ring-1 focus:ring-forest-500"
            >
              {officers.map((off) => (
                <option key={off.uid} value={off.uid}>
                  {off.name} — {off.designation} ({off.officeName}, {off.district})
                </option>
              ))}
            </select>
          </div>

          {/* Scope selection */}
          <div>
            <label className="block text-xs font-medium text-ink-light mb-2">
              {isTa ? "பகிர்ந்துகொள்ள அனுமதிக்கப்படும் தகவல்கள் (Scopes):" : "Permitted Information Scopes:"}
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {ALL_SCOPES.map((item) => {
                const checked = selectedScopes.includes(item.scope);
                return (
                  <button
                    key={item.scope}
                    type="button"
                    onClick={() => toggleScope(item.scope)}
                    className={`text-left p-3 rounded-xl border text-xs transition-all flex items-start gap-2.5 ${
                      checked
                        ? "bg-forest-50/80 border-forest-500 text-forest-900 shadow-sm"
                        : "bg-white border-forest-100 text-ink-light hover:border-forest-200"
                    }`}
                  >
                    <div
                      className={`w-4 h-4 rounded mt-0.5 flex items-center justify-center border shrink-0 ${
                        checked ? "bg-forest-600 border-forest-600 text-white" : "border-ink-lighter bg-white"
                      }`}
                    >
                      {checked && <Check size={12} />}
                    </div>
                    <div>
                      <div className="font-semibold text-ink">{isTa ? item.labelTa : item.labelEn}</div>
                      <div className="text-[11px] text-ink-lighter mt-0.5">{isTa ? item.descTa : item.descEn}</div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Duration */}
          <div>
            <label className="block text-xs font-medium text-ink-light mb-1">
              {isTa ? "அனுமதி செல்லுபடியாகும் காலம் (நாட்கள்):" : "Access Validity Duration:"}
            </label>
            <div className="flex gap-2">
              {[7, 30, 90, 180].map((days) => (
                <button
                  key={days}
                  type="button"
                  onClick={() => setDurationDays(days)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium border ${
                    durationDays === days
                      ? "bg-forest-600 text-white border-forest-600"
                      : "bg-white text-ink-light border-forest-200 hover:bg-forest-50"
                  }`}
                >
                  {days} {isTa ? "நாட்கள்" : "Days"}
                </button>
              ))}
            </div>
          </div>

          <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-[11px] text-amber-900 flex items-start gap-2">
            <Lock size={14} className="shrink-0 mt-0.5 text-amber-700" />
            <p>
              {isTa
                ? "குறிப்பு: நிதி செலவுகள், கடன் விவரங்கள் மற்றும் தனிப்பட்ட AI உரையாடல்கள் அதிகாரிகளுக்கு எப்போதும் காட்டப்படாது."
                : "Security Note: Private financial records, loan entries, and confidential AI chats are never shared with officers."}
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-3 border-t border-forest-100">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs text-ink-light hover:bg-forest-50 border border-forest-200"
          >
            {t("common.cancel")}
          </button>
          <button
            onClick={handleGrant}
            disabled={saving}
            className="px-5 py-2 rounded-xl text-xs font-semibold bg-forest-600 hover:bg-forest-700 text-white shadow-sm transition-all"
          >
            {saving ? t("common.loading") : isTa ? "அணுகல் அனுமதி வழங்கு" : "Grant Controlled Access"}
          </button>
        </div>
      </div>
    </div>
  );
}
