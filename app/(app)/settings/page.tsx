"use client";

import { useEffect, useRef, useState } from "react";
import { MapPin, Bell, Globe, User, Loader2 } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/components/ui/Toast";
import { useSharedLocation } from "@/hooks/useLocationContext";
import { useLanguage } from "@/hooks/useLanguage";
import { SectionHeading, ProgressBar } from "@/components/ui/Primitives";
import { calculateProfileCompletion } from "@/lib/utils/profileCompletion";
import { PrivacyConsentCenter } from "@/components/privacy/PrivacyConsentCenter";
import type { Language } from "@/types";

export default function SettingsPage() {
  const { profile, updateProfile } = useAuth();
  const { showToast } = useToast();
  const { status: locationStatus, location, requestLocation } = useSharedLocation();
  const { setLanguage, t } = useLanguage();
  const locating = locationStatus === "requesting" || locationStatus === "granted";
  const userTriggeredLocation = useRef(false);
  const completion = profile ? calculateProfileCompletion(profile) : null;

  const [form, setForm] = useState({
    name: profile?.name ?? "",
    phone: profile?.phone ?? "",
    state: profile?.state ?? "",
    district: profile?.district ?? "",
    landAreaAcres: profile?.landAreaAcres ?? 0,
    landUnit: profile?.landUnit ?? "acres",
    landOwnershipType: profile?.landOwnershipType ?? "owned",
    soilType: profile?.soilType ?? "",
    irrigationType: profile?.irrigationType ?? "",
    waterSource: profile?.waterSource ?? "",
    farmingType: profile?.farmingType ?? "",
    experienceYears: profile?.experienceYears ?? 0,
    farmingGoals: profile?.farmingGoals ?? "",
    approxFarmingExpensesAnnual: profile?.approxFarmingExpensesAnnual ?? 0,
    hasAgriculturalLoans: profile?.hasAgriculturalLoans ?? false,
    preferredLanguage: profile?.preferredLanguage ?? ("en" as Language),
  });

  // Reflect a freshly resolved location into the form fields, and let the
  // farmer know how it went — but only for requests THEY triggered here
  // (the location may already have resolved automatically elsewhere).
  useEffect(() => {
    if (!userTriggeredLocation.current) return;

    if (location && locationStatus === "resolved") {
      setForm((prev) => ({
        ...prev,
        state: location.state ?? prev.state,
        district: location.district ?? prev.district,
      }));
      showToast(location.isDemo ? t("location.savedNoName") : t("location.updated"), "success");
      userTriggeredLocation.current = false;
    } else if (locationStatus === "denied") {
      showToast(t("location.permissionNeeded"), "warning");
      userTriggeredLocation.current = false;
    } else if (locationStatus === "unavailable" || locationStatus === "timeout" || locationStatus === "error") {
      showToast(t("location.unavailable"), "warning");
      userTriggeredLocation.current = false;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location, locationStatus]);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    await updateProfile(form);
    showToast(t("settings.profileUpdated"), "success");
  }

  async function handleUseLocation() {
    userTriggeredLocation.current = true;
    await requestLocation();
  }

  return (
    <div className="space-y-8 animate-fade-up max-w-3xl">
      <SectionHeading eyebrow={t("nav.settings")} title={t("settings.title")} />

      {completion && completion.percent < 100 && (
        <div className="card p-5 border-l-4 border-l-forest-500">
          <div className="flex items-center justify-between text-sm">
            <p className="font-semibold">{t("settings.profileCompletion").replace("{percent}", String(completion.percent))}</p>
            <span className="font-display font-semibold text-forest-700">{completion.percent}%</span>
          </div>
          <ProgressBar value={completion.percent} className="mt-2.5" />
          {completion.missingKeys.length > 0 && (
            <p className="text-xs text-ink-light mt-2">
              {t("settings.missingFields")}: {completion.missingKeys.map((k) => t(k)).join(", ")}
            </p>
          )}
        </div>
      )}

      {/* Personal Information */}
      <div className="card p-6">
        <div className="flex items-center gap-2 text-forest-700 mb-4">
          <User size={18} />
          <p className="font-display font-semibold">{t("settings.personalInfo")}</p>
        </div>
        <form onSubmit={handleSave} className="grid sm:grid-cols-2 gap-4">
          <Field label={t("settings.fullName")} value={form.name} onChange={(v) => setForm((p) => ({ ...p, name: v }))} />
          <Field label={t("settings.phone")} value={form.phone} onChange={(v) => setForm((p) => ({ ...p, phone: v }))} />
          <Field label={t("settings.state")} value={form.state} onChange={(v) => setForm((p) => ({ ...p, state: v }))} />
          <Field label={t("settings.district")} value={form.district} onChange={(v) => setForm((p) => ({ ...p, district: v }))} />
          
          <div className="sm:col-span-2 pt-2 border-t border-forest-100 flex items-center gap-2 text-forest-700 mt-2 mb-1">
            <p className="font-display font-semibold text-sm">{t("settings.farmInfo")}</p>
          </div>

          <Field
            label={t("settings.landArea")}
            type="number"
            value={String(form.landAreaAcres)}
            onChange={(v) => setForm((p) => ({ ...p, landAreaAcres: Number(v) || 0 }))}
          />
          <div>
            <label className="label-field">{t("settings.landOwnership")}</label>
            <select
              value={form.landOwnershipType}
              onChange={(e) => setForm((p) => ({ ...p, landOwnershipType: e.target.value as typeof form.landOwnershipType }))}
              className="input-field"
            >
              <option value="owned">Owned (சொந்த நிலம்)</option>
              <option value="leased">Leased / Tenant (குத்தகை)</option>
              <option value="joint">Joint Family (கூட்டுக் குடும்பம்)</option>
              <option value="ancestral">Ancestral (பரம்பரை)</option>
            </select>
          </div>

          <Field label={t("settings.soilType")} value={form.soilType} onChange={(v) => setForm((p) => ({ ...p, soilType: v }))} />
          <Field label={t("settings.irrigationType")} value={form.irrigationType} onChange={(v) => setForm((p) => ({ ...p, irrigationType: v }))} />
          <Field label={t("settings.waterSource")} value={form.waterSource} onChange={(v) => setForm((p) => ({ ...p, waterSource: v }))} />
          <Field label={t("settings.farmingType")} value={form.farmingType} onChange={(v) => setForm((p) => ({ ...p, farmingType: v }))} />

          <div className="sm:col-span-2 pt-2 border-t border-forest-100 flex items-center gap-2 text-forest-700 mt-2 mb-1">
            <p className="font-display font-semibold text-sm">{t("settings.financialPreferences")}</p>
          </div>

          <Field
            label={t("settings.experience")}
            type="number"
            value={String(form.experienceYears)}
            onChange={(v) => setForm((p) => ({ ...p, experienceYears: Number(v) || 0 }))}
          />
          <Field
            label={t("settings.annualExpenses")}
            type="number"
            value={String(form.approxFarmingExpensesAnnual)}
            onChange={(v) => setForm((p) => ({ ...p, approxFarmingExpensesAnnual: Number(v) || 0 }))}
          />
          <Field
            label={t("settings.farmingGoals")}
            value={form.farmingGoals}
            onChange={(v) => setForm((p) => ({ ...p, farmingGoals: v }))}
          />

          <button type="submit" className="btn-primary sm:col-span-2 mt-3">
            {t("settings.saveProfile")}
          </button>
        </form>
      </div>

      <div className="card p-6">
        <div className="flex items-center gap-2 text-forest-700 mb-4">
          <MapPin size={18} />
          <p className="font-display font-semibold">{t("settings.location")}</p>
        </div>
        <p className="text-sm text-ink-light mb-3">{t("settings.locationHelp")}</p>
        {(locationStatus === "denied" || locationStatus === "unavailable" || locationStatus === "timeout" || locationStatus === "error") && (
          <p className="text-sm text-clay-600 mb-3">{t("location.permissionNeeded")}</p>
        )}
        <button onClick={handleUseLocation} disabled={locating} className="btn-secondary text-sm">
          {locating ? <Loader2 size={15} className="animate-spin" /> : <MapPin size={15} />}
          {locating ? t("location.gettingLocation") : t("location.useMyLocation")}
        </button>

        {profile?.location && (
          <dl className="grid grid-cols-2 gap-x-4 gap-y-2 mt-4 pt-4 border-t border-forest-100 text-sm">
            {profile.location.village && (
              <>
                <dt className="text-ink-light">{t("settings.village")}</dt>
                <dd className="font-medium">{profile.location.village}</dd>
              </>
            )}
            {profile.location.taluk && (
              <>
                <dt className="text-ink-light">{t("settings.taluk")}</dt>
                <dd className="font-medium">{profile.location.taluk}</dd>
              </>
            )}
            <dt className="text-ink-light">{t("settings.districtState")}</dt>
            <dd className="font-medium">{profile.district || "—"}, {profile.state || "—"}</dd>
            {profile.location.pinCode && (
              <>
                <dt className="text-ink-light">{t("settings.pinCode")}</dt>
                <dd className="font-medium">{profile.location.pinCode}</dd>
              </>
            )}
            {profile.location.accuracy !== undefined && (
              <>
                <dt className="text-ink-light">{t("settings.accuracy")}</dt>
                <dd className="font-medium">±{Math.round(profile.location.accuracy)}m</dd>
              </>
            )}
          </dl>
        )}
      </div>

      <div className="card p-6">
        <div className="flex items-center gap-2 text-forest-700 mb-4">
          <Globe size={18} />
          <p className="font-display font-semibold">{t("settings.language")}</p>
        </div>
        <div className="flex gap-2">
          {(["en", "ta"] as Language[]).map((lang) => (
            <button
              key={lang}
              onClick={() => {
                setForm((p) => ({ ...p, preferredLanguage: lang }));
                // setLanguage() persists to localStorage and, for signed-in users, to Firestore.
                setLanguage(lang);
              }}
              className={`px-4 py-2 rounded-full text-sm font-semibold border ${
                form.preferredLanguage === lang
                  ? "bg-forest-600 text-cream-50 border-forest-600"
                  : "border-forest-100 text-ink-light"
              }`}
            >
              {lang === "en" ? "English" : "தமிழ்"}
            </button>
          ))}
        </div>
      </div>

      <div className="card p-6">
        <div className="flex items-center gap-2 text-forest-700 mb-4">
          <Bell size={18} />
          <p className="font-display font-semibold">{t("settings.notifications")}</p>
        </div>
        <div className="space-y-2">
          {["Weather alerts", "Crop task reminders", "Disease risk alerts", "Market price changes", "Government scheme updates"].map(
            (label) => (
              <label key={label} className="flex items-center justify-between text-sm py-1.5">
                {label}
                <input type="checkbox" defaultChecked className="w-4 h-4 accent-forest-600" />
              </label>
            )
          )}
        </div>
      </div>

      {/* Privacy, Consents, Data Export & Account Deletion */}
      <PrivacyConsentCenter />
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
}) {
  return (
    <div>
      <label className="label-field">{label}</label>
      <input type={type} value={value} onChange={(e) => onChange(e.target.value)} className="input-field" />
    </div>
  );
}
