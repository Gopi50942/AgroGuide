"use client";

import { useEffect, useState } from "react";
import {
  Shield,
  Download,
  Trash2,
  Lock,
  History,
  FileSpreadsheet,
  FileCode,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
} from "lucide-react";
import {
  CONSENT_DEFINITIONS,
  getFarmerConsents,
  updateFarmerConsent,
  CURRENT_CONSENT_VERSION,
} from "@/lib/services/consentService";
import {
  generateFarmerDataExport,
  downloadJsonExport,
  convertToCsv,
  downloadCsvExport,
} from "@/lib/services/exportService";
import { executeAccountDeletion } from "@/lib/services/accountDeletionService";
import { listAuditLogs } from "@/lib/services/auditLogService";
import { useAuth } from "@/hooks/useAuth";
import { useLanguage } from "@/hooks/useLanguage";
import { useToast } from "@/components/ui/Toast";
import type { ConsentType, AuditLogEntry } from "@/types";

export function PrivacyConsentCenter() {
  const { user, profile, isDemoMode, signOut } = useAuth();
  const { language, t } = useLanguage();
  const { showToast } = useToast();

  const [consents, setConsents] = useState<Record<ConsentType, boolean>>({
    location: true,
    ai_processing: true,
    image_diagnosis: true,
    voice_recording: true,
    weather_notifications: true,
    community_media: false,
  });

  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>([]);
  const [loadingConsents, setLoadingConsents] = useState(true);
  const [loadingExport, setLoadingExport] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteConfirmPhrase, setDeleteConfirmPhrase] = useState("");
  const [deleting, setDeleting] = useState(false);

  const requiredDeletePhrase = language === "ta" ? "நீக்கு" : "DELETE";

  useEffect(() => {
    if (!profile?.uid) return;
    loadData();
  }, [profile?.uid, isDemoMode]);

  async function loadData() {
    if (!profile?.uid) return;
    setLoadingConsents(true);
    try {
      const [fetchedConsents, logs] = await Promise.all([
        getFarmerConsents(profile.uid, isDemoMode),
        listAuditLogs(profile.uid, 15, isDemoMode),
      ]);
      setConsents(fetchedConsents);
      setAuditLogs(logs);
    } catch {}
    setLoadingConsents(false);
  }

  async function handleToggleConsent(type: ConsentType) {
    if (!profile?.uid) return;
    const newState = !consents[type];
    setConsents({ ...consents, [type]: newState });

    try {
      await updateFarmerConsent(profile.uid, type, newState, isDemoMode);
      showToast(t("privacy.consentUpdated"), "success");
      const logs = await listAuditLogs(profile.uid, 15, isDemoMode);
      setAuditLogs(logs);
    } catch {
      showToast(t("common.error"), "error");
      setConsents({ ...consents, [type]: !newState });
    }
  }

  async function handleExportJson() {
    if (!profile?.uid) return;
    setLoadingExport(true);
    try {
      const exportData = await generateFarmerDataExport(profile.uid, profile, isDemoMode);
      downloadJsonExport(exportData, `agroguide_${profile.name || "farmer"}`);
      showToast(t("privacy.exportSuccess"), "success");
      const logs = await listAuditLogs(profile.uid, 15, isDemoMode);
      setAuditLogs(logs);
    } catch {
      showToast(t("common.error"), "error");
    }
    setLoadingExport(false);
  }

  async function handleExportCsv() {
    if (!profile?.uid) return;
    setLoadingExport(true);
    try {
      const exportData = await generateFarmerDataExport(profile.uid, profile, isDemoMode);

      // Expenses CSV
      if (exportData.expenses.length > 0) {
        const expensesCsv = convertToCsv(exportData.expenses, [
          { key: "date", header: "Date" },
          { key: "category", header: "Category" },
          { key: "amount", header: "Amount (INR)" },
          { key: "note", header: "Note" },
        ]);
        downloadCsvExport(expensesCsv, `agroguide_expenses_${new Date().toISOString().slice(0, 10)}.csv`);
      }

      // Sales CSV
      if (exportData.sales.length > 0) {
        const salesCsv = convertToCsv(exportData.sales, [
          { key: "date", header: "Sale Date" },
          { key: "cropName", header: "Crop" },
          { key: "buyerName", header: "Buyer" },
          { key: "quantity", header: "Quantity" },
          { key: "unit", header: "Unit" },
          { key: "ratePerUnit", header: "Rate" },
          { key: "netRealization", header: "Net Realization (INR)" },
        ]);
        downloadCsvExport(salesCsv, `agroguide_sales_${new Date().toISOString().slice(0, 10)}.csv`);
      }

      showToast(t("privacy.exportSuccess"), "success");
    } catch {
      showToast(t("common.error"), "error");
    }
    setLoadingExport(false);
  }

  async function handleExecuteDelete() {
    if (deleteConfirmPhrase.trim() !== requiredDeletePhrase) return;
    setDeleting(true);
    try {
      const res = await executeAccountDeletion(user, isDemoMode);
      if (res.success) {
        showToast(t("privacy.accountDeleted"), "success");
        await signOut();
      } else if (res.error === "REAUTH_REQUIRED") {
        showToast(t("privacy.reauthRequired"), "error");
      } else {
        showToast(res.error || t("common.error"), "error");
      }
    } catch {
      showToast(t("common.error"), "error");
    }
    setDeleting(false);
    setShowDeleteModal(false);
  }

  return (
    <div className="space-y-6">
      {/* Privacy & Consents Header */}
      <div className="card p-5 space-y-4 border-forest-100 bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-forest-100 pb-3">
          <div className="flex items-center gap-2">
            <Shield size={20} className="text-forest-700" />
            <div>
              <h3 className="font-serif font-bold text-base text-forest-950">
                {t("privacy.consentTitle")}
              </h3>
              <p className="text-xs text-ink-light">
                {t("privacy.consentSubtitle")} (v{CURRENT_CONSENT_VERSION})
              </p>
            </div>
          </div>
        </div>

        {/* Consent Options List */}
        <div className="space-y-3 pt-1">
          {CONSENT_DEFINITIONS.map((def) => {
            const isGranted = consents[def.type] ?? def.defaultGranted;
            const title = language === "ta" ? def.titleTa : def.titleEn;
            const desc = language === "ta" ? def.descTa : def.descEn;

            return (
              <div
                key={def.type}
                className="p-3 rounded-xl border border-forest-100 bg-cream-50/40 flex flex-wrap sm:flex-nowrap items-start justify-between gap-3"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-xs text-forest-950">{title}</span>
                    {isGranted && (
                      <span className="chip bg-forest-100 text-forest-800 text-[10px] py-0 px-1.5 flex items-center gap-1">
                        <CheckCircle2 size={10} /> {t("privacy.active")}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-ink-light leading-relaxed">{desc}</p>
                </div>

                <label className="relative inline-flex items-center cursor-pointer shrink-0 mt-1">
                  <input
                    type="checkbox"
                    checked={isGranted}
                    onChange={() => handleToggleConsent(def.type)}
                    className="sr-only peer"
                  />
                  <div className="w-9 h-5 bg-cream-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-cream-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-forest-700"></div>
                </label>
              </div>
            );
          })}
        </div>
      </div>

      {/* Data Portability / Export */}
      <div className="card p-5 space-y-4 border-forest-100 bg-white shadow-sm">
        <div className="flex items-center gap-2 border-b border-forest-100 pb-3">
          <Download size={20} className="text-forest-700" />
          <div>
            <h3 className="font-serif font-bold text-base text-forest-950">
              {t("privacy.exportTitle")}
            </h3>
            <p className="text-xs text-ink-light">{t("privacy.exportSubtitle")}</p>
          </div>
        </div>

        <p className="text-xs text-ink-light leading-relaxed">
          {t("privacy.exportDescription")}
        </p>

        <div className="flex flex-wrap items-center gap-3 pt-1">
          <button
            type="button"
            onClick={handleExportJson}
            disabled={loadingExport}
            className="btn-primary text-xs flex items-center gap-1.5 py-2 px-3.5"
          >
            <FileCode size={14} />
            {loadingExport ? t("common.loading") : t("privacy.downloadJson")}
          </button>

          <button
            type="button"
            onClick={handleExportCsv}
            disabled={loadingExport}
            className="btn-secondary text-xs flex items-center gap-1.5 py-2 px-3.5"
          >
            <FileSpreadsheet size={14} />
            {t("privacy.downloadCsv")}
          </button>
        </div>
      </div>

      {/* Audit Log Stream */}
      <div className="card p-5 space-y-4 border-forest-100 bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-forest-100 pb-3">
          <div className="flex items-center gap-2">
            <History size={20} className="text-forest-700" />
            <div>
              <h3 className="font-serif font-bold text-base text-forest-950">
                {t("privacy.auditLogTitle")}
              </h3>
              <p className="text-xs text-ink-light">{t("privacy.auditLogSubtitle")}</p>
            </div>
          </div>

          <button
            type="button"
            onClick={loadData}
            className="text-xs text-forest-700 hover:underline flex items-center gap-1"
          >
            <RefreshCw size={12} /> {t("common.refresh")}
          </button>
        </div>

        <div className="space-y-2 max-h-56 overflow-y-auto">
          {auditLogs.map((log) => (
            <div
              key={log.id}
              className="p-2.5 rounded-lg border border-forest-100 bg-cream-50/50 flex items-center justify-between text-xs"
            >
              <div className="space-y-0.5">
                <span className="font-mono font-bold text-forest-900">{log.action}</span>
                <span className="chip bg-forest-100 text-forest-800 text-[10px] ml-2">
                  {log.entityType}
                </span>
              </div>
              <span className="text-[11px] text-ink-light font-mono">
                {log.timestamp ? new Date(log.timestamp).toLocaleString("en-IN") : ""}
              </span>
            </div>
          ))}

          {auditLogs.length === 0 && (
            <p className="text-xs text-ink-light py-2 text-center">
              {t("privacy.noAuditLogs")}
            </p>
          )}
        </div>
      </div>

      {/* Dangerous: Delete Account */}
      <div className="card p-5 space-y-3 border-rust-200 bg-rust-50/30">
        <div className="flex items-center gap-2">
          <Trash2 size={18} className="text-rust-700" />
          <h3 className="font-serif font-bold text-sm text-rust-950">
            {t("privacy.deleteAccountTitle")}
          </h3>
        </div>

        <p className="text-xs text-rust-900 leading-relaxed">
          {t("privacy.deleteAccountWarning")}
        </p>

        <button
          type="button"
          onClick={() => setShowDeleteModal(true)}
          className="btn-danger text-xs flex items-center gap-1.5 py-1.5 px-3 w-fit"
        >
          <Trash2 size={13} /> {t("privacy.deleteAccountBtn")}
        </button>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-forest-950/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="card max-w-md w-full p-6 space-y-4 bg-white border-rust-300 shadow-2xl">
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-full bg-rust-100 text-rust-700 flex items-center justify-center shrink-0">
                <AlertTriangle size={20} />
              </div>
              <div>
                <h3 className="font-serif font-bold text-base text-rust-950">
                  {t("privacy.confirmDeleteTitle")}
                </h3>
                <p className="text-xs text-ink-light mt-1">
                  {t("privacy.confirmDeleteDesc")}
                </p>
              </div>
            </div>

            <div className="space-y-2 pt-2">
              <label className="label-field text-xs text-forest-950">
                {t("privacy.typePhraseToConfirm")}{" "}
                <span className="font-bold font-mono text-rust-700 bg-rust-50 px-1.5 py-0.5 rounded border border-rust-200">
                  {requiredDeletePhrase}
                </span>
              </label>
              <input
                type="text"
                value={deleteConfirmPhrase}
                onChange={(e) => setDeleteConfirmPhrase(e.target.value)}
                placeholder={requiredDeletePhrase}
                className="input-field text-xs"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-forest-100">
              <button
                type="button"
                onClick={() => setShowDeleteModal(false)}
                className="btn-secondary text-xs py-1.5 px-3"
              >
                {t("common.cancel")}
              </button>
              <button
                type="button"
                onClick={handleExecuteDelete}
                disabled={deleteConfirmPhrase.trim() !== requiredDeletePhrase || deleting}
                className="btn-danger text-xs py-1.5 px-3 disabled:opacity-50 flex items-center gap-1"
              >
                <Trash2 size={13} /> {deleting ? t("common.loading") : t("privacy.confirmDeletePermanently")}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
