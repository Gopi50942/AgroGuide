"use client";

import { useState, useEffect } from "react";
import { Sparkles, Calendar, CheckSquare, Square, X, RefreshCw, CheckCircle2 } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useLanguage } from "@/hooks/useLanguage";
import { useToast } from "@/components/ui/Toast";
import {
  buildDraftTasks,
  saveGeneratedCropTasks,
  type DraftCropTask,
} from "@/lib/services/cropTaskSchedulerService";
import type { Crop } from "@/types";

interface Props {
  crop: Crop;
  isOpen: boolean;
  onClose: () => void;
  onTasksGenerated?: () => void;
}

export function CropTaskGeneratorModal({
  crop,
  isOpen,
  onClose,
  onTasksGenerated,
}: Props) {
  const { profile, isDemoMode } = useAuth();
  const { t, language } = useLanguage();
  const { showToast } = useToast();

  const [drafts, setDrafts] = useState<DraftCropTask[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen && crop.sowingDate) {
      const initial = buildDraftTasks(crop.name, crop.sowingDate, language);
      setDrafts(initial);
    }
  }, [isOpen, crop.name, crop.sowingDate, language]);

  if (!isOpen) return null;

  const selectedCount = drafts.filter((d) => d.selected).length;

  function toggleAll(selectAll: boolean) {
    setDrafts((prev) => prev.map((d) => ({ ...d, selected: selectAll })));
  }

  function toggleOne(templateId: string) {
    setDrafts((prev) =>
      prev.map((d) => (d.templateId === templateId ? { ...d, selected: !d.selected } : d))
    );
  }

  function updateDueDate(templateId: string, newDate: string) {
    setDrafts((prev) =>
      prev.map((d) => (d.templateId === templateId ? { ...d, dueDate: newDate } : d))
    );
  }

  async function handleConfirm() {
    if (!profile || selectedCount === 0) return;
    setLoading(true);

    try {
      if (isDemoMode) {
        showToast(t("taskScheduler.tasksGeneratedDemo"));
        onTasksGenerated?.();
        onClose();
        return;
      }

      await saveGeneratedCropTasks(
        profile.uid,
        crop.id,
        crop.name,
        crop.farmId,
        drafts
      );

      showToast(t("taskScheduler.tasksGeneratedSuccess"));
      onTasksGenerated?.();
      onClose();
    } catch {
      showToast(t("common.error"));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="card max-w-xl w-full bg-cream-50 max-h-[90vh] flex flex-col shadow-2xl animate-scale-up border-forest-200">
        {/* Modal Header */}
        <div className="p-5 border-b border-forest-100 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-forest-100 text-forest-700 flex items-center justify-center">
              <Sparkles size={18} />
            </div>
            <div>
              <h3 className="font-serif font-bold text-base text-forest-950">
                {t("taskScheduler.modalTitle")}
              </h3>
              <p className="text-xs text-ink-light">
                {crop.name} · {t("farm.sowingDate")}: {crop.sowingDate || "–"}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-ink-light hover:bg-forest-100 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 overflow-y-auto flex-1 space-y-4">
          <div className="flex items-center justify-between text-xs">
            <span className="text-ink-light">
              {t("taskScheduler.selectPrompt")} ({selectedCount}/{drafts.length})
            </span>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => toggleAll(true)}
                className="text-forest-700 hover:underline font-medium"
              >
                {t("taskScheduler.selectAll")}
              </button>
              <span>·</span>
              <button
                type="button"
                onClick={() => toggleAll(false)}
                className="text-ink-light hover:underline"
              >
                {t("taskScheduler.deselectAll")}
              </button>
            </div>
          </div>

          <div className="space-y-2.5">
            {drafts.map((draft) => (
              <div
                key={draft.templateId}
                className={`card p-3 transition-all border ${
                  draft.selected
                    ? "bg-cream-100/70 border-forest-300"
                    : "bg-cream-50/40 border-cream-200 opacity-60"
                }`}
              >
                <div className="flex items-start gap-3">
                  <button
                    type="button"
                    onClick={() => toggleOne(draft.templateId)}
                    className="mt-0.5 text-forest-700 hover:text-forest-900"
                  >
                    {draft.selected ? (
                      <CheckSquare size={17} className="text-forest-700" />
                    ) : (
                      <Square size={17} className="text-ink-light" />
                    )}
                  </button>

                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <p className="font-semibold text-xs text-forest-950">{draft.title}</p>
                      <span className="chip text-[10px] py-0 px-2 bg-wheat-100 text-wheat-900">
                        {draft.stage ? draft.stage.replace(/_/g, " ") : ""}
                      </span>
                    </div>

                    <p className="text-[11px] text-ink-light mt-1">{draft.description}</p>

                    <div className="mt-2 flex items-center gap-2">
                      <Calendar size={12} className="text-forest-600" />
                      <input
                        type="date"
                        value={draft.dueDate}
                        onChange={(e) => updateDueDate(draft.templateId, e.target.value)}
                        className="text-xs bg-white border border-forest-200 rounded-lg px-2 py-0.5 text-ink"
                      />
                      <span className="text-[10px] text-ink-light">
                        (
                        {draft.daysFromSowing >= 0
                          ? `+${draft.daysFromSowing} days`
                          : `${draft.daysFromSowing} days`}
                        )
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-cream-100/50 border-t border-forest-100 flex items-center justify-between">
          <button
            type="button"
            onClick={onClose}
            className="btn-secondary text-xs"
            disabled={loading}
          >
            {t("common.cancel")}
          </button>

          <button
            type="button"
            onClick={handleConfirm}
            className="btn-primary text-xs flex items-center gap-1.5"
            disabled={loading || selectedCount === 0}
          >
            {loading ? (
              <RefreshCw size={13} className="animate-spin" />
            ) : (
              <CheckCircle2 size={14} />
            )}
            {t("taskScheduler.generateBtn")} ({selectedCount})
          </button>
        </div>
      </div>
    </div>
  );
}
