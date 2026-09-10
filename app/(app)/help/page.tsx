"use client";

import { useState } from "react";
import {
  Phone,
  HelpCircle,
  AlertTriangle,
  Building2,
  Stethoscope,
  Droplets,
  Sprout,
  Coins,
  FileCheck2,
  ExternalLink,
  LifeBuoy,
} from "lucide-react";
import { SectionHeading, Disclaimer } from "@/components/ui/Primitives";
import { ExtensionDirectory } from "@/components/directory/ExtensionDirectory";
import { useAuth } from "@/hooks/useAuth";
import { useLanguage } from "@/hooks/useLanguage";

export default function HelpCenterPage() {
  const { profile } = useAuth();
  const { language, t } = useLanguage();
  const [activeTab, setActiveTab] = useState<"hotlines" | "escalation" | "directory">("hotlines");

  const escalationCategories = [
    {
      icon: Stethoscope,
      titleEn: "Crop Disease & Pest Outbreaks",
      titleTa: "பயிர் நோய் & பூச்சி தாக்குதல்",
      whenEn: "When more than 15% of your plot shows sudden wilting, unfamiliar viral symptoms, or rapid pest infestation.",
      whenTa: "உங்கள் வயலில் 15% க்கும் மேற்பட்ட பயிர்கள் திடீரென வாடும்போதோ அல்லது புதிய வைரஸ் அறிகுறிகள் தென்படும்போதோ.",
      actionEn: "Contact your local KVK Agronomist immediately or call Kisan Call Center (1800-180-1551) with leaf samples.",
      actionTa: "உடனடியாக உள்ளூர் KVK வேளாண் விஞ்ஞானியை தொடர்பு கொள்ளவும் அல்லது கிசான் கால் சென்டரை (1800-180-1551) அழைக்கவும்.",
      urgency: "high",
    },
    {
      icon: Sprout,
      titleEn: "Soil Salinity & Fertilizer Recommendations",
      titleTa: "மண் உவர்த்தன்மை & உரப்பரிந்துரை",
      whenEn: "When soil test reports show extreme pH (< 5.5 or > 8.5) or Electrical Conductivity (EC > 2.0 dS/m).",
      whenTa: "மண் பரிசோதனை அறிக்கையில் pH (< 5.5 அல்லது > 8.5) அல்லது உப்புத்தன்மை (EC > 2.0) அதிகமாக இருக்கும்போது.",
      actionEn: "Visit the District Soil Testing Laboratory to prepare a gypsum or lime reclamation schedule.",
      actionTa: "மாவட்ட மண் பரிசோதனை நிலையத்தை அணுகி ஜிப்சம் அல்லது சுண்ணாம்பு இடும் முறையை அறியவும்.",
      urgency: "medium",
    },
    {
      icon: Droplets,
      titleEn: "Severe Water Stress & Borewell Failure",
      titleTa: "கடும் நீர் தட்டுப்பாடு & ஆழ்துளை கிணறு சிக்கல்",
      whenEn: "When irrigation water quality turns salty or groundwater depletion threatens an active crop stage.",
      whenTa: "பாசன நீர் உப்பு நீராக மாறும்போதோ அல்லது நிலத்தடி நீர் குறைந்து பயிர் வாடும் தருணத்திலோ.",
      actionEn: "Consult the Assistant Director of Agricultural Engineering for solar pump or micro-irrigation subsidies.",
      actionTa: "வேளாண் பொறியியல் துறை உதவி இயக்குநரை அணுகி சூரியசக்தி பம்புசெட் அல்லது சொட்டுநீர் மானியம் பெறவும்.",
      urgency: "high",
    },
    {
      icon: FileCheck2,
      titleEn: "Government Scheme Physical Verification",
      titleTa: "அரசு மானிய கள ஆய்வு & ஆவண சரிபார்ப்பு",
      whenEn: "When your subsidy application is flagged for Village Administrative Officer (VAO) or Block Officer field inspection.",
      whenTa: "உங்கள் மானிய விண்ணப்பம் கிராம நிர்வாக அலுவலர் (VAO) அல்லது வட்டார அலுவலரின் கள ஆய்விற்கு வரும்போது.",
      actionEn: "Visit the Block Assistant Director of Agriculture (ADA) office with Patta/Chitta and Adangal originals.",
      actionTa: "பட்டா/சிட்டா மற்றும் அடங்கல் அசல் ஆவணங்களுடன் வட்டார வேளாண் உதவி இயக்குநர் (ADA) அலுவலகத்தை அணுகவும்.",
      urgency: "medium",
    },
    {
      icon: Coins,
      titleEn: "KCC Loan Dispute & Crop Insurance Claims",
      titleTa: "கிசான் கடன் & பயிர் காப்பீடு இழப்பீட்டு கோரிக்கை",
      whenEn: "When facing natural disaster loss (flood/cyclone) or delay in insurance settlement under PMFBY.",
      whenTa: "இயற்கை பேரிடர் (வெள்ளம்/புயல்) பாதிப்பு அல்லது பயிர் காப்பீட்டு இழப்பீடு தாமதமாகும் தருணத்தில்.",
      actionEn: "File formal claim within 72 hours via the National Crop Insurance Portal (pmfby.gov.in) and notify your bank.",
      actionTa: "72 மணி நேரத்திற்குள் PMFBY இணையதளத்தில் பதிவு செய்து உங்கள் வங்கியிடம் விண்ணப்ப நகலை சமர்ப்பிக்கவும்.",
      urgency: "high",
    },
  ];

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-12">
      {/* Hero Card */}
      <div className="card p-6 bg-gradient-to-r from-forest-900 to-forest-800 text-cream-50 space-y-3">
        <div className="flex items-center gap-2.5">
          <LifeBuoy size={24} className="text-wheat-400" />
          <h1 className="font-serif font-bold text-xl sm:text-2xl text-cream-50">
            {t("help.title")}
          </h1>
        </div>
        <p className="text-sm text-cream-200 leading-relaxed max-w-2xl">
          {t("help.subtitle")}
        </p>

        {/* Toll-free Kisan Call Center Banner */}
        <div className="pt-2">
          <div className="bg-white/10 p-4 rounded-xl backdrop-blur-sm border border-white/15 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-wheat-400 text-forest-950 flex items-center justify-center font-bold shrink-0">
                <Phone size={20} />
              </div>
              <div>
                <p className="text-xs font-medium text-cream-200">{t("help.kisanCallCenterTitle")}</p>
                <p className="text-lg font-bold font-mono tracking-wide text-wheat-300">
                  1800-180-1551
                </p>
                <p className="text-[11px] text-cream-300">{t("help.kccHours")}</p>
              </div>
            </div>

            <a
              href="tel:18001801551"
              className="btn-primary bg-wheat-400 text-forest-950 hover:bg-wheat-300 font-bold text-xs py-2 px-4 shadow-md"
            >
              <Phone size={14} className="mr-1 inline" /> {t("help.callNow")}
            </a>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-forest-200 gap-2">
        <button
          onClick={() => setActiveTab("hotlines")}
          className={`pb-2.5 px-4 text-sm font-serif font-bold border-b-2 transition-all ${
            activeTab === "hotlines"
              ? "border-forest-800 text-forest-900"
              : "border-transparent text-ink-light hover:text-forest-700"
          }`}
        >
          {t("help.tabHotlines")}
        </button>

        <button
          onClick={() => setActiveTab("escalation")}
          className={`pb-2.5 px-4 text-sm font-serif font-bold border-b-2 transition-all ${
            activeTab === "escalation"
              ? "border-forest-800 text-forest-900"
              : "border-transparent text-ink-light hover:text-forest-700"
          }`}
        >
          {t("help.tabEscalation")}
        </button>

        <button
          onClick={() => setActiveTab("directory")}
          className={`pb-2.5 px-4 text-sm font-serif font-bold border-b-2 transition-all ${
            activeTab === "directory"
              ? "border-forest-800 text-forest-900"
              : "border-transparent text-ink-light hover:text-forest-700"
          }`}
        >
          {t("help.tabDirectory")}
        </button>
      </div>

      {/* Tab 1: Emergency & Essential Hotlines */}
      {activeTab === "hotlines" && (
        <div className="space-y-4">
          <SectionHeading
            title={t("help.essentialContacts")}
            subtitle={t("help.essentialContactsDesc")}
          />

          <div className="grid sm:grid-cols-2 gap-4">
            <div className="card p-4 space-y-2 border-forest-100 bg-cream-50/50">
              <div className="flex items-center justify-between">
                <h4 className="font-serif font-bold text-sm text-forest-950">
                  {t("help.kisanHelpline")}
                </h4>
                <span className="chip bg-forest-100 text-forest-800 text-[10px]">Toll-Free</span>
              </div>
              <p className="text-xs text-ink-light leading-relaxed">
                {t("help.kisanHelplineDesc")}
              </p>
              <a
                href="tel:18001801551"
                className="text-xs text-forest-800 font-bold flex items-center gap-1 hover:underline pt-1"
              >
                <Phone size={12} /> 1800-180-1551
              </a>
            </div>

            <div className="card p-4 space-y-2 border-forest-100 bg-cream-50/50">
              <div className="flex items-center justify-between">
                <h4 className="font-serif font-bold text-sm text-forest-950">
                  {t("help.disasterHelpline")}
                </h4>
                <span className="chip bg-rust-100 text-rust-800 text-[10px]">National Disaster</span>
              </div>
              <p className="text-xs text-ink-light leading-relaxed">
                {t("help.disasterHelplineDesc")}
              </p>
              <a
                href="tel:1077"
                className="text-xs text-rust-700 font-bold flex items-center gap-1 hover:underline pt-1"
              >
                <Phone size={12} /> 1077 (District Disaster Helpline)
              </a>
            </div>

            <div className="card p-4 space-y-2 border-forest-100 bg-cream-50/50">
              <div className="flex items-center justify-between">
                <h4 className="font-serif font-bold text-sm text-forest-950">
                  {t("help.tnAgrinetPortal")}
                </h4>
                <span className="chip bg-wheat-100 text-forest-900 text-[10px]">Official Portal</span>
              </div>
              <p className="text-xs text-ink-light leading-relaxed">
                {t("help.tnAgrinetDesc")}
              </p>
              <a
                href="https://www.tnagrisnet.tn.gov.in"
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-forest-800 font-bold flex items-center gap-1 hover:underline pt-1"
              >
                tnagrisnet.tn.gov.in <ExternalLink size={12} />
              </a>
            </div>

            <div className="card p-4 space-y-2 border-forest-100 bg-cream-50/50">
              <div className="flex items-center justify-between">
                <h4 className="font-serif font-bold text-sm text-forest-950">
                  {t("help.cropInsurancePortal")}
                </h4>
                <span className="chip bg-forest-100 text-forest-800 text-[10px]">PMFBY Grievance</span>
              </div>
              <p className="text-xs text-ink-light leading-relaxed">
                {t("help.pmfbyDesc")}
              </p>
              <a
                href="https://pmfby.gov.in"
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-forest-800 font-bold flex items-center gap-1 hover:underline pt-1"
              >
                pmfby.gov.in <ExternalLink size={12} />
              </a>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Human Expert Escalation Matrix */}
      {activeTab === "escalation" && (
        <div className="space-y-4">
          <SectionHeading
            title={t("help.escalationTitle")}
            subtitle={t("help.escalationSubtitle")}
          />

          <div className="space-y-3">
            {escalationCategories.map((item, idx) => {
              const Icon = item.icon;
              const title = language === "ta" ? item.titleTa : item.titleEn;
              const when = language === "ta" ? item.whenTa : item.whenEn;
              const action = language === "ta" ? item.actionTa : item.actionEn;

              return (
                <div
                  key={idx}
                  className="card p-4 space-y-2.5 bg-white border-forest-100 shadow-sm"
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-forest-100 text-forest-800 flex items-center justify-center shrink-0">
                        <Icon size={16} />
                      </div>
                      <h4 className="font-serif font-bold text-sm text-forest-950">
                        {title}
                      </h4>
                    </div>

                    <span
                      className={`chip text-[10px] uppercase font-bold ${
                        item.urgency === "high"
                          ? "bg-rust-100 text-rust-800"
                          : "bg-wheat-100 text-clay-800"
                      }`}
                    >
                      {item.urgency === "high" ? t("help.highUrgency") : t("help.mediumUrgency")}
                    </span>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-3 text-xs pt-1">
                    <div className="bg-cream-50/60 p-3 rounded-lg border border-cream-200">
                      <p className="font-semibold text-forest-950 mb-1 flex items-center gap-1">
                        <AlertTriangle size={12} className="text-clay-600" />
                        {t("help.whenToTalk")}:
                      </p>
                      <p className="text-ink-light leading-relaxed">{when}</p>
                    </div>

                    <div className="bg-forest-50/60 p-3 rounded-lg border border-forest-100">
                      <p className="font-semibold text-forest-900 mb-1 flex items-center gap-1">
                        <Building2 size={12} className="text-forest-700" />
                        {t("help.recommendedStep")}:
                      </p>
                      <p className="text-forest-950 leading-relaxed">{action}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Tab 3: Directory */}
      {activeTab === "directory" && (
        <div className="space-y-4">
          <SectionHeading
            title={t("directory.title")}
            subtitle={t("directory.subtitle")}
          />
          <ExtensionDirectory defaultDistrict={profile?.district} />
        </div>
      )}

      {/* Official Agronomic Disclaimer */}
      <Disclaimer text={t("help.disclaimerNotice")} />
    </div>
  );
}
