"use client";

import { useState } from "react";
import { Sprout, MapPin, User, ArrowRight, CheckCircle2, Loader2 } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useLanguage } from "@/hooks/useLanguage";
import { useSharedLocation } from "@/hooks/useLocationContext";
import { useToast } from "@/components/ui/Toast";
import { addFarm, addCrop } from "@/lib/services/farmService";

export function FarmerOnboardingModal({ onCompleted }: { onCompleted: () => void }) {
  const { profile, updateProfile } = useAuth();
  const { t } = useLanguage();
  const { showToast } = useToast();
  const { requestLocation, location, status: locationStatus } = useSharedLocation();

  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [saving, setSaving] = useState(false);

  // Form state
  const [name, setName] = useState(profile?.name ?? "");
  const [phone, setPhone] = useState(profile?.phone ?? "");
  const [state, setState] = useState(profile?.state ?? "Tamil Nadu");
  const [district, setDistrict] = useState(profile?.district ?? "Coimbatore");

  // Farm state
  const [farmName, setFarmName] = useState(profile?.name ? `${profile.name}'s Farm` : "My Farm");
  const [landArea, setLandArea] = useState(String(profile?.landAreaAcres || 2));
  const [soilType, setSoilType] = useState(profile?.soilType ?? "Red loamy soil");
  const [irrigationType, setIrrigationType] = useState(profile?.irrigationType ?? "Drip irrigation");
  const [waterSource, setWaterSource] = useState(profile?.waterSource ?? "Borewell");

  // Crop state
  const [cropName, setCropName] = useState("Tomato");
  const [variety, setVariety] = useState("PKM-1 Hybrid");
  const [sowingDate, setSowingDate] = useState(new Date().toISOString().slice(0, 10));
  const [expectedHarvestDate, setExpectedHarvestDate] = useState(
    new Date(Date.now() + 85 * 86400000).toISOString().slice(0, 10)
  );

  async function handleFinish() {
    if (!profile) return;
    setSaving(true);
    try {
      // 1. Update farmer profile
      await updateProfile({
        name: name.trim() || profile.name,
        phone: phone.trim() || profile.phone,
        state: state.trim() || profile.state,
        district: district.trim() || profile.district,
        landAreaAcres: Number(landArea) || 2,
        soilType: soilType.trim(),
        irrigationType: irrigationType.trim(),
        waterSource: waterSource.trim(),
        onboardingCompleted: true,
      });

      // 2. Create the first farm if provided
      if (farmName.trim()) {
        const farmId = await addFarm(profile.uid, {
          name: farmName.trim(),
          location: `${district}, ${state}`,
          areaAcres: Number(landArea) || 2,
          soilType: soilType.trim(),
          irrigationType: irrigationType.trim(),
          waterSource: waterSource.trim(),
        });

        // 3. Create initial crop attached to this farm
        if (cropName.trim() && farmId) {
          await addCrop(profile.uid, {
            farmId,
            name: cropName.trim(),
            variety: variety.trim() || undefined,
            sowingDate,
            expectedHarvestDate,
            areaAcres: Number(landArea) || 2,
            stage: "sowing",
            dayNumber: 1,
            soilType: soilType.trim(),
            irrigationMethod: irrigationType.trim(),
          });
        }
      }

      showToast(t("settings.profileUpdated"), "success");
      onCompleted();
    } catch {
      showToast(t("common.error"), "warning");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 bg-ink/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="card max-w-xl w-full p-6 sm:p-8 bg-cream-50 my-8 animate-fade-up">
        {/* Header */}
        <div className="flex items-center justify-between gap-2 mb-6">
          <div>
            <span className="section-eyebrow text-forest-600">Farmer Setup</span>
            <h2 className="font-display text-2xl font-semibold mt-0.5">{t("settings.onboardingTitle")}</h2>
            <p className="text-xs text-ink-light mt-1">{t("settings.onboardingSubtitle")}</p>
          </div>
          <div className="w-10 h-10 rounded-full bg-forest-50 text-forest-600 flex items-center justify-center shrink-0">
            <Sprout size={22} />
          </div>
        </div>

        {/* Steps indicator */}
        <div className="grid grid-cols-3 gap-2 text-center text-xs font-semibold mb-6">
          <div className={`p-2 rounded-lg ${step === 1 ? "bg-forest-600 text-cream-50" : step > 1 ? "bg-forest-100 text-forest-700" : "bg-forest-50 text-ink-light"}`}>
            {t("settings.step1")}
          </div>
          <div className={`p-2 rounded-lg ${step === 2 ? "bg-forest-600 text-cream-50" : step > 2 ? "bg-forest-100 text-forest-700" : "bg-forest-50 text-ink-light"}`}>
            {t("settings.step2")}
          </div>
          <div className={`p-2 rounded-lg ${step === 3 ? "bg-forest-600 text-cream-50" : "bg-forest-50 text-ink-light"}`}>
            {t("settings.step3")}
          </div>
        </div>

        {/* Step 1: Personal & Location */}
        {step === 1 && (
          <div className="space-y-4">
            <div>
              <label className="label-field">{t("settings.fullName")}</label>
              <input required value={name} onChange={(e) => setName(e.target.value)} className="input-field" placeholder="Farmer Name" />
            </div>
            <div>
              <label className="label-field">{t("settings.phone")}</label>
              <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} className="input-field" placeholder="+91 90000 00000" />
            </div>
            <div className="grid sm:grid-cols-2 gap-3">
              <div>
                <label className="label-field">{t("settings.state")}</label>
                <input value={state} onChange={(e) => setState(e.target.value)} className="input-field" />
              </div>
              <div>
                <label className="label-field">{t("settings.district")}</label>
                <input value={district} onChange={(e) => setDistrict(e.target.value)} className="input-field" />
              </div>
            </div>

            <button
              type="button"
              onClick={requestLocation}
              disabled={locationStatus === "requesting" || locationStatus === "granted"}
              className="btn-ghost text-xs w-full justify-center border border-dashed border-forest-200 py-2.5 rounded-xl text-forest-700"
            >
              <MapPin size={14} /> {location ? `GPS Detected: ${location.district || "Lat " + location.lat.toFixed(2)}` : t("location.useMyLocation")}
            </button>

            <div className="flex justify-between items-center pt-4 border-t border-forest-100">
              <button type="button" onClick={onCompleted} className="text-xs text-ink-light hover:underline">
                {t("settings.completeLater")}
              </button>
              <button type="button" onClick={() => setStep(2)} className="btn-primary text-sm">
                Next <ArrowRight size={15} />
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Land & Farm */}
        {step === 2 && (
          <div className="space-y-4">
            <div>
              <label className="label-field">{t("farm.name")}</label>
              <input value={farmName} onChange={(e) => setFarmName(e.target.value)} className="input-field" placeholder="Green Valley Field" />
            </div>
            <div className="grid sm:grid-cols-2 gap-3">
              <div>
                <label className="label-field">{t("settings.landArea")} ({t("farm.acres")})</label>
                <input type="number" min={0.1} step={0.1} value={landArea} onChange={(e) => setLandArea(e.target.value)} className="input-field" />
              </div>
              <div>
                <label className="label-field">{t("settings.soilType")}</label>
                <input value={soilType} onChange={(e) => setSoilType(e.target.value)} className="input-field" placeholder="Red / Black / Loam" />
              </div>
            </div>
            <div className="grid sm:grid-cols-2 gap-3">
              <div>
                <label className="label-field">{t("settings.irrigationType")}</label>
                <input value={irrigationType} onChange={(e) => setIrrigationType(e.target.value)} className="input-field" placeholder="Drip / Flood / Sprinkler" />
              </div>
              <div>
                <label className="label-field">{t("settings.waterSource")}</label>
                <input value={waterSource} onChange={(e) => setWaterSource(e.target.value)} className="input-field" placeholder="Borewell / Canal / Well" />
              </div>
            </div>

            <div className="flex justify-between items-center pt-4 border-t border-forest-100">
              <button type="button" onClick={() => setStep(1)} className="btn-secondary text-sm">
                Back
              </button>
              <button type="button" onClick={() => setStep(3)} className="btn-primary text-sm">
                Next <ArrowRight size={15} />
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Current Crop */}
        {step === 3 && (
          <div className="space-y-4">
            <div className="grid sm:grid-cols-2 gap-3">
              <div>
                <label className="label-field">{t("farm.cropName")}</label>
                <input value={cropName} onChange={(e) => setCropName(e.target.value)} className="input-field" placeholder="Tomato, Paddy, Cotton..." />
              </div>
              <div>
                <label className="label-field">{t("farm.variety")}</label>
                <input value={variety} onChange={(e) => setVariety(e.target.value)} className="input-field" placeholder="Variety or Hybrid name" />
              </div>
            </div>
            <div className="grid sm:grid-cols-2 gap-3">
              <div>
                <label className="label-field">{t("farm.sowingDate")}</label>
                <input type="date" value={sowingDate} onChange={(e) => setSowingDate(e.target.value)} className="input-field" />
              </div>
              <div>
                <label className="label-field">{t("farm.expectedHarvestDate")}</label>
                <input type="date" value={expectedHarvestDate} onChange={(e) => setExpectedHarvestDate(e.target.value)} className="input-field" />
              </div>
            </div>

            <div className="p-3 bg-forest-50 rounded-xl text-xs text-forest-700 leading-relaxed">
              🌱 Adding your active crop immediately unlocks lifecycle tracking, daily tasks, rain-delay irrigation advisories, and pest risk alerts on your dashboard.
            </div>

            <div className="flex justify-between items-center pt-4 border-t border-forest-100">
              <button type="button" onClick={() => setStep(2)} className="btn-secondary text-sm">
                Back
              </button>
              <button type="button" onClick={handleFinish} disabled={saving} className="btn-primary text-sm">
                {saving ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle2 size={16} />}
                {t("settings.finishOnboarding")}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
