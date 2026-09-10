"use client";

import { useEffect, useMemo, useState } from "react";
import {
  ExternalLink,
  Search,
  Landmark,
  FileCheck2,
  Plus,
  Trash2,
  Edit2,
  Calendar,
  AlertCircle,
  Sparkles,
} from "lucide-react";
import { SchemePreScreeningWizard } from "@/components/government/SchemePreScreeningWizard";
import { useAuth } from "@/hooks/useAuth";
import { GOVERNMENT_SERVICES, searchGovernmentServices } from "@/data/governmentServices";
import { matchGovernmentSchemes, matchCategory } from "@/lib/services/governmentService";
import {
  listSchemeApplications,
  addSchemeApplication,
  updateSchemeApplication,
  removeSchemeApplication,
} from "@/lib/services/schemeApplicationService";
import { SectionHeading, EmptyState } from "@/components/ui/Primitives";
import { useLanguage } from "@/hooks/useLanguage";
import { useToast } from "@/components/ui/Toast";
import type { GovernmentService, SchemeApplication, SchemeApplicationStatus } from "@/types";

export default function GovernmentPage() {
  const { profile, isDemoMode } = useAuth();
  const { t } = useLanguage();
  const { showToast } = useToast();

  const [query, setQuery] = useState("");
  const [tab, setTab] = useState<"matches" | "central" | "state" | "applications" | "search">("matches");

  const [applications, setApplications] = useState<SchemeApplication[]>([]);
  const [loadingApps, setLoadingApps] = useState(true);
  const [showAddApp, setShowAddApp] = useState(false);
  const [editingApp, setEditingApp] = useState<SchemeApplication | null>(null);
  const [selectedService, setSelectedService] = useState<GovernmentService | null>(null);
  const [showWizard, setShowWizard] = useState(false);

  const matches = useMemo(() => (profile ? matchGovernmentSchemes(profile) : []), [profile]);
  const central = GOVERNMENT_SERVICES.filter((s) => s.governmentLevel === "central" && s.active);
  const state = GOVERNMENT_SERVICES.filter((s) => s.governmentLevel === "state" && s.active);
  const searchResults = useMemo(() => searchGovernmentServices(query), [query]);

  async function loadApplications() {
    if (!profile) return;
    if (isDemoMode) {
      setApplications([]);
      setLoadingApps(false);
      return;
    }
    setLoadingApps(true);
    try {
      const list = await listSchemeApplications(profile.uid);
      setApplications(list);
    } catch {
      // Non-fatal
    } finally {
      setLoadingApps(false);
    }
  }

  useEffect(() => {
    loadApplications();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profile?.uid, isDemoMode]);

  async function handleDeleteApp(id: string) {
    if (!confirm(t("scheme.deleteConfirm"))) return;
    if (isDemoMode) {
      setApplications((prev) => prev.filter((a) => a.id !== id));
      showToast(t("scheme.deleted"), "success");
      return;
    }
    try {
      await removeSchemeApplication(id);
      showToast(t("scheme.deleted"), "success");
      loadApplications();
    } catch {
      showToast(t("common.error"), "warning");
    }
  }

  function handleStartTracking(service: GovernmentService) {
    setSelectedService(service);
    setEditingApp(null);
    setShowAddApp(true);
    setTab("applications");
  }

  return (
    <div className="space-y-6 animate-fade-up">
      <SectionHeading
        eyebrow={t("nav.government")}
        title={t("government.title")}
        action={
          <div className="flex items-center gap-2">
            <a
              href="/government-console"
              className="px-3 py-1.5 bg-forest-800 text-cream-50 hover:bg-forest-900 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-sm"
            >
              🏛️ Command Console
            </a>
            <button
              onClick={() => setShowWizard(true)}
              className="btn-primary text-xs py-1.5 px-3 flex items-center gap-1.5"
            >
              <Sparkles size={14} /> {t("schemes.preScreeningWizard")}
            </button>
          </div>
        }
      />

      {/* ── Tabs Navigation ── */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {[
          { key: "matches", label: t("government.tabMatches") },
          { key: "applications", label: `📋 ${t("scheme.myApplications")} (${applications.length})` },
          { key: "central", label: `🇮🇳 ${t("government.tabCentral")}` },
          { key: "state", label: `🌾 ${t("government.tabState")}` },
          { key: "search", label: t("government.tabSearch") },
        ].map((tabItem) => (
          <button
            key={tabItem.key}
            onClick={() => setTab(tabItem.key as typeof tab)}
            className={`shrink-0 px-4 py-2 rounded-full text-sm font-semibold border ${
              tab === tabItem.key
                ? "bg-forest-600 text-cream-50 border-forest-600 shadow-sm"
                : "border-forest-100 text-ink-light bg-cream-50"
            }`}
          >
            {tabItem.label}
          </button>
        ))}
      </div>

      {/* ── TAB: MY APPLICATIONS (Phase 7) ── */}
      {tab === "applications" && (
        <div className="space-y-6 animate-fade-up">
          {/* Important Official Status Disclaimer */}
          <div className="card p-4 bg-wheat-50 border border-wheat-200 flex items-start gap-3">
            <AlertCircle size={18} className="text-wheat-700 shrink-0 mt-0.5" />
            <p className="text-xs text-ink-light leading-relaxed">
              {t("scheme.manualDisclaimer")}
            </p>
          </div>

          <div className="flex justify-between items-center -mt-2">
            <SectionHeading title={`${t("scheme.myApplications")} (${applications.length})`} />
            <button
              onClick={() => {
                setSelectedService(null);
                setEditingApp(null);
                setShowAddApp((v) => !v);
              }}
              className="btn-secondary text-sm"
            >
              <Plus size={15} /> {t("scheme.trackApplication")}
            </button>
          </div>

          {(showAddApp || editingApp) && (
            <ApplicationForm
              service={selectedService}
              app={editingApp}
              onCancel={() => {
                setShowAddApp(false);
                setEditingApp(null);
                setSelectedService(null);
              }}
              onSaved={() => {
                setShowAddApp(false);
                setEditingApp(null);
                setSelectedService(null);
                loadApplications();
              }}
            />
          )}

          {loadingApps ? (
            <div className="skeleton h-32" />
          ) : applications.length === 0 && !showAddApp ? (
            <EmptyState
              icon={FileCheck2}
              title={t("scheme.noApplications")}
              message={t("scheme.manualDisclaimer")}
            />
          ) : (
            <div className="space-y-3">
              {applications.map((app) => (
                <div key={app.id} className="card p-5">
                  <div className="flex items-start justify-between gap-3 flex-wrap">
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-display font-semibold text-base text-forest-900">
                          {app.schemeName}
                        </p>
                        <span className="chip text-xs font-semibold bg-forest-100 text-forest-800">
                          {(t as any)(`scheme.status.${app.status}`) || app.status.replace(/_/g, " ")}
                        </span>
                      </div>
                      <p className="text-xs text-ink-light flex items-center gap-2 mt-1.5 flex-wrap">
                        <span className="flex items-center gap-1">
                          <Calendar size={12} /> {t("scheme.appliedDate")}: {app.appliedDate}
                        </span>
                        {app.applicationReference && (
                          <span>· Ref: <strong>{app.applicationReference}</strong></span>
                        )}
                        {app.lastUpdatedDate && (
                          <span>· Updated: {app.lastUpdatedDate}</span>
                        )}
                      </p>
                      {app.notes && (
                        <p className="text-xs text-ink-light mt-2 bg-forest-50/50 p-2 rounded-lg">
                          {app.notes}
                        </p>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      {app.officialUrl && (
                        <a
                          href={app.officialUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="btn-ghost text-xs text-forest-700 flex items-center gap-1"
                        >
                          <ExternalLink size={13} /> Official Portal
                        </a>
                      )}
                      <button
                        onClick={() => {
                          setEditingApp(app);
                          setShowAddApp(true);
                        }}
                        className="p-1.5 rounded-lg text-ink-light hover:text-forest-700"
                        title={t("scheme.updated")}
                      >
                        <Edit2 size={14} />
                      </button>
                      <button
                        onClick={() => handleDeleteApp(app.id)}
                        className="p-1.5 rounded-lg text-ink-light hover:text-rust-500"
                        title={t("scheme.deleted")}
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── TAB: SEARCH ── */}
      {tab === "search" && (
        <>
          <div className="relative max-w-md">
            <Search size={17} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-light/50" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={t("government.searchPlaceholder")}
              className="input-field pl-10"
            />
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            {searchResults.length === 0 ? (
              <p className="text-sm text-ink-light col-span-2">{t("government.noMatches")}</p>
            ) : (
              searchResults.map((s) => (
                <ServiceCard key={s.id} service={s} onTrack={() => handleStartTracking(s)} />
              ))
            )}
          </div>
        </>
      )}

      {/* ── TAB: MATCHES ── */}
      {tab === "matches" && (
        <>
          <p className="text-sm text-ink-light bg-wheat-100 border border-wheat-200 rounded-lg px-4 py-2.5">
            {t("government.disclaimer")}
          </p>
          <div className="grid sm:grid-cols-2 gap-4">
            {matches.map((s) => (
              <ServiceCard
                key={s.id}
                service={s}
                matchPercent={s.matchPercent}
                reasons={s.matchReasons}
                onTrack={() => handleStartTracking(s)}
              />
            ))}
          </div>
        </>
      )}

      {/* ── TAB: CENTRAL ── */}
      {tab === "central" && (
        <div className="grid sm:grid-cols-2 gap-4">
          {central.map((s) => (
            <ServiceCard key={s.id} service={s} onTrack={() => handleStartTracking(s)} />
          ))}
        </div>
      )}

      {/* ── TAB: STATE ── */}
      {tab === "state" && (
        <div className="grid sm:grid-cols-2 gap-4">
          {state.map((s) => (
            <ServiceCard key={s.id} service={s} onTrack={() => handleStartTracking(s)} />
          ))}
        </div>
      )}

      {/* Pre-Screening Wizard Modal (Phase 21) */}
      <SchemePreScreeningWizard
        isOpen={showWizard}
        onClose={() => setShowWizard(false)}
        onApplicationCreated={loadApplications}
      />
    </div>
  );
}

function ServiceCard({
  service,
  matchPercent,
  reasons,
  onTrack,
}: {
  service: GovernmentService;
  matchPercent?: number;
  reasons?: string[];
  onTrack: () => void;
}) {
  const { language, t } = useLanguage();
  const isTa = language === "ta";
  const categoryKey = `government.category.${service.category}` as const;
  const categoryLabel = (t as any)(categoryKey) || service.category;
  const name = isTa && service.nameTa ? service.nameTa : service.name;
  const description = isTa && service.descriptionTa ? service.descriptionTa : service.description;

  return (
    <div className="card p-5 flex flex-col justify-between">
      <div>
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2">
            <Landmark size={16} className="text-forest-600 shrink-0" />
            <p className="font-display font-semibold text-sm">{name}</p>
          </div>
          {matchPercent !== undefined && (
            <span className="chip shrink-0">
              {t(matchCategory(matchPercent) === "likely" ? "government.likelyRelevant" : "government.mayBeRelevant")}
            </span>
          )}
        </div>
        <p className="text-sm text-ink-light mt-2">{description}</p>
        <div className="flex flex-wrap gap-1.5 mt-3">
          <span className="chip">
            {service.governmentLevel === "central" ? t("government.tabCentral") : service.state}
          </span>
          <span className="chip">{categoryLabel}</span>
        </div>
        {reasons && reasons.length > 0 && (
          <ul className="mt-2 space-y-0.5">
            {reasons.map((r, i) => (
              <li key={i} className="text-xs text-ink-light flex gap-1.5">
                <span className="text-forest-500">•</span> {r}
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="flex items-center justify-between mt-4 pt-3 border-t border-forest-100 gap-2 flex-wrap">
        <button onClick={onTrack} className="btn-secondary text-xs">
          <FileCheck2 size={13} /> {t("scheme.trackApplication")}
        </button>
        <a
          href={service.officialUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs font-semibold text-forest-700 flex items-center gap-1 hover:underline"
        >
          {t("government.openOfficial")} <ExternalLink size={12} />
        </a>
      </div>
    </div>
  );
}

function ApplicationForm({
  service,
  app,
  onCancel,
  onSaved,
}: {
  service?: GovernmentService | null;
  app?: SchemeApplication | null;
  onCancel: () => void;
  onSaved: () => void;
}) {
  const { profile } = useAuth();
  const { t } = useLanguage();
  const { showToast } = useToast();
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    schemeId: app?.schemeId ?? service?.id ?? "general-scheme",
    schemeName: app?.schemeName ?? service?.name ?? "",
    applicationReference: app?.applicationReference ?? "",
    appliedDate: app?.appliedDate ?? new Date().toISOString().slice(0, 10),
    status: (app?.status ?? "planning") as SchemeApplicationStatus,
    notes: app?.notes ?? "",
    officialUrl: app?.officialUrl ?? service?.officialUrl ?? "",
  });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!profile || !form.schemeName.trim()) return;

    setSaving(true);
    const payload: Omit<SchemeApplication, "id" | "ownerId"> = {
      schemeId: form.schemeId,
      schemeName: form.schemeName.trim(),
      applicationReference: form.applicationReference.trim() || undefined,
      appliedDate: form.appliedDate,
      status: form.status,
      notes: form.notes.trim() || undefined,
      officialUrl: form.officialUrl.trim() || undefined,
    };

    try {
      if (app) {
        await updateSchemeApplication(app.id, payload);
        showToast(t("scheme.updated"), "success");
      } else {
        await addSchemeApplication(profile.uid, payload);
        showToast(t("scheme.saved"), "success");
      }
      onSaved();
    } catch {
      showToast(t("common.error"), "warning");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="card p-5 mb-4 grid sm:grid-cols-2 gap-3 bg-forest-50/40">
      <div>
        <label className="label-field">Scheme Name</label>
        <input
          required
          placeholder="e.g. PM-KISAN, PMFBY"
          value={form.schemeName}
          onChange={(e) => setForm((p) => ({ ...p, schemeName: e.target.value }))}
          className="input-field"
        />
      </div>

      <div>
        <label className="label-field">{t("scheme.refNumber")}</label>
        <input
          placeholder="e.g. ACK-2026-98124"
          value={form.applicationReference}
          onChange={(e) => setForm((p) => ({ ...p, applicationReference: e.target.value }))}
          className="input-field"
        />
      </div>

      <div>
        <label className="label-field">{t("scheme.appliedDate")}</label>
        <input
          required
          type="date"
          value={form.appliedDate}
          onChange={(e) => setForm((p) => ({ ...p, appliedDate: e.target.value }))}
          className="input-field"
        />
      </div>

      <div>
        <label className="label-field">{t("scheme.status")}</label>
        <select
          value={form.status}
          onChange={(e) => setForm((p) => ({ ...p, status: e.target.value as SchemeApplicationStatus }))}
          className="input-field"
        >
          <option value="planning">{t("scheme.status.planning")}</option>
          <option value="applied">{t("scheme.status.applied")}</option>
          <option value="pending">{t("scheme.status.pending")}</option>
          <option value="document_verification">{t("scheme.status.document_verification")}</option>
          <option value="field_verification">{t("scheme.status.field_verification")}</option>
          <option value="approved">{t("scheme.status.approved")}</option>
          <option value="rejected">{t("scheme.status.rejected")}</option>
          <option value="benefit_received">{t("scheme.status.benefit_received")}</option>
        </select>
      </div>

      <input
        placeholder="Official Portal URL (Optional)"
        value={form.officialUrl}
        onChange={(e) => setForm((p) => ({ ...p, officialUrl: e.target.value }))}
        className="input-field sm:col-span-2"
      />

      <input
        placeholder="Personal Notes (e.g. VAO contacted on 12th Aug)"
        value={form.notes}
        onChange={(e) => setForm((p) => ({ ...p, notes: e.target.value }))}
        className="input-field sm:col-span-2"
      />

      <div className="sm:col-span-2 flex gap-2 pt-1">
        <button type="submit" disabled={saving} className="btn-primary text-sm">
          {t("common.save")}
        </button>
        <button type="button" onClick={onCancel} className="btn-secondary text-sm">
          {t("common.cancel")}
        </button>
      </div>
    </form>
  );
}
