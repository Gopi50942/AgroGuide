"use client";

import { useState } from "react";
import {
  Phone,
  MapPin,
  ExternalLink,
  ShieldCheck,
  Building2,
  Filter,
  CheckCircle2,
} from "lucide-react";
import { EXTENSION_DIRECTORIES } from "@/lib/data/extensionDirectory";
import { useLanguage } from "@/hooks/useLanguage";
import type { ExtensionOfficeType } from "@/types";

export function ExtensionDirectory({ defaultDistrict }: { defaultDistrict?: string }) {
  const { language, t } = useLanguage();
  const [selectedDistrict, setSelectedDistrict] = useState<string>(defaultDistrict || "all");
  const [selectedType, setSelectedType] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");

  const districts = Array.from(
    new Set(EXTENSION_DIRECTORIES.map((e) => e.district).filter((d) => d !== "All Districts"))
  ).sort();

  const filtered = EXTENSION_DIRECTORIES.filter((office) => {
    if (selectedDistrict !== "all" && office.district !== selectedDistrict && office.district !== "All Districts") {
      return false;
    }
    if (selectedType !== "all" && office.type !== selectedType) {
      return false;
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchEn = office.nameEn.toLowerCase().includes(q) || office.addressEn.toLowerCase().includes(q);
      const matchTa = office.nameTa.toLowerCase().includes(q) || office.addressTa.toLowerCase().includes(q);
      return matchEn || matchTa;
    }
    return true;
  });

  return (
    <div className="space-y-4">
      {/* Search & Filter Header */}
      <div className="card p-4 bg-cream-50/70 space-y-3 border-forest-100">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Filter size={16} className="text-forest-700" />
            <span className="text-sm font-bold text-forest-950 font-serif">
              {t("directory.filterTitle")}
            </span>
          </div>

          <input
            type="text"
            placeholder={t("directory.searchPlaceholder")}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="input-field text-xs max-w-xs"
          />
        </div>

        <div className="grid sm:grid-cols-2 gap-3 pt-1">
          <div>
            <label className="label-field">{t("settings.district")}</label>
            <select
              value={selectedDistrict}
              onChange={(e) => setSelectedDistrict(e.target.value)}
              className="input-field text-xs"
            >
              <option value="all">{t("directory.allDistricts")}</option>
              {districts.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="label-field">{t("directory.officeType")}</label>
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="input-field text-xs"
            >
              <option value="all">{t("directory.allTypes")}</option>
              <option value="kvk">{t("directory.typeKvk")}</option>
              <option value="district_agriculture_office">{t("directory.typeDao")}</option>
              <option value="soil_testing_lab">{t("directory.typeSoilLab")}</option>
              <option value="kisan_call_center">{t("directory.typeCallCenter")}</option>
            </select>
          </div>
        </div>
      </div>

      {/* Directory Cards */}
      <div className="grid gap-3 sm:grid-cols-2">
        {filtered.map((office) => {
          const name = language === "ta" ? office.nameTa : office.nameEn;
          const address = language === "ta" ? office.addressTa : office.addressEn;
          const services = language === "ta" ? office.servicesOfferedTa : office.servicesOfferedEn;

          return (
            <div
              key={office.id}
              className="card p-4 flex flex-col justify-between space-y-3 bg-white border-forest-100 hover:border-forest-300 transition-all shadow-sm"
            >
              <div className="space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-start gap-2">
                    <Building2 size={18} className="text-forest-700 mt-0.5 shrink-0" />
                    <div>
                      <h4 className="font-serif font-bold text-sm text-forest-950 leading-snug">
                        {name}
                      </h4>
                      <span className="chip bg-forest-50 text-forest-800 text-[10px] mt-1 inline-block">
                        {office.district} · {office.state}
                      </span>
                    </div>
                  </div>

                  <span className="flex items-center gap-1 text-[10px] text-forest-700 bg-forest-50 px-2 py-0.5 rounded-full border border-forest-200 shrink-0 font-medium">
                    <ShieldCheck size={11} className="text-forest-600" />
                    {t("directory.verified")}
                  </span>
                </div>

                <p className="text-xs text-ink-light flex items-start gap-1.5 pt-1">
                  <MapPin size={13} className="shrink-0 text-clay-600 mt-0.5" />
                  <span>
                    {address}, PIN: {office.pincode}
                  </span>
                </p>

                {/* Services list */}
                <div className="pt-2 border-t border-forest-50 space-y-1">
                  <p className="text-[11px] font-semibold text-forest-900">
                    {t("directory.servicesLabel")}:
                  </p>
                  <ul className="space-y-1">
                    {services.map((svc, idx) => (
                      <li key={idx} className="text-[11px] text-ink-light flex items-start gap-1.5">
                        <CheckCircle2 size={11} className="text-forest-600 shrink-0 mt-0.5" />
                        <span>{svc}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Actions */}
              <div className="pt-2 border-t border-forest-100 flex flex-wrap items-center justify-between gap-2 text-xs">
                {office.tollFree ? (
                  <a
                    href={`tel:${office.tollFree.replace(/-/g, "")}`}
                    className="btn-primary text-xs flex items-center gap-1.5 py-1.5 px-3"
                  >
                    <Phone size={13} /> {t("directory.callTollFree")} ({office.tollFree})
                  </a>
                ) : office.phone ? (
                  <a
                    href={`tel:${office.phone.replace(/-/g, "")}`}
                    className="btn-secondary text-xs flex items-center gap-1.5 py-1.5 px-3 text-forest-900"
                  >
                    <Phone size={13} /> {office.phone}
                  </a>
                ) : null}

                {office.officialWebsite && (
                  <a
                    href={office.officialWebsite}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-forest-700 hover:underline flex items-center gap-1 font-medium ml-auto"
                  >
                    {t("directory.visitPortal")} <ExternalLink size={12} />
                  </a>
                )}
              </div>
            </div>
          );
        })}

        {filtered.length === 0 && (
          <div className="sm:col-span-2 card p-8 text-center bg-cream-50/50 border-dashed border-forest-200">
            <p className="text-sm font-medium text-ink-light">{t("directory.noOfficesFound")}</p>
            <p className="text-xs text-ink-light/75 mt-1">{t("directory.noOfficesHelp")}</p>
          </div>
        )}
      </div>
    </div>
  );
}
