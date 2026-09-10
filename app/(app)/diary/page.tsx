"use client";

import { useEffect, useState, useRef } from "react";
import {
  Camera,
  Plus,
  Trash2,
  Calendar,
  Sprout,
  Image as ImageIcon,
  X,
  Columns,
  Sparkles,
  ArrowRight,
} from "lucide-react";
import { DEMO_DIARY, DEMO_CROPS } from "@/data/demoData";
import { useAuth } from "@/hooks/useAuth";
import { useLanguage } from "@/hooks/useLanguage";
import { useToast } from "@/components/ui/Toast";
import { listDiaryEntries, addDiaryEntry, removeDiaryEntry, uploadDiaryPhoto } from "@/lib/services/diaryService";
import { listCrops } from "@/lib/services/farmService";
import { computeCropProgress } from "@/lib/utils/cropLifecycle";
import { SectionHeading, EmptyState } from "@/components/ui/Primitives";
import type { DiaryEntry, Crop } from "@/types";

export default function DiaryPage() {
  const { profile, isDemoMode } = useAuth();
  const { t } = useLanguage();
  const { showToast } = useToast();

  const [entries, setEntries] = useState<DiaryEntry[]>([]);
  const [crops, setCrops] = useState<Crop[]>([]);
  const [selectedCropId, setSelectedCropId] = useState<string>("all");
  const [compareMode, setCompareMode] = useState<boolean>(false);
  const [loading, setLoading] = useState(true);

  // New Entry Form State
  const [showAdd, setShowAdd] = useState(false);
  const [note, setNote] = useState("");
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [linkedCropId, setLinkedCropId] = useState<string>("");
  const [selectedPhoto, setSelectedPhoto] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  async function refresh() {
    if (!profile) return;
    if (isDemoMode) {
      setEntries(DEMO_DIARY);
      setCrops(DEMO_CROPS);
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const [diaryList, cropList] = await Promise.all([
        listDiaryEntries(profile.uid),
        listCrops(profile.uid),
      ]);
      setEntries(diaryList);
      setCrops(cropList);
    } catch {
      // Non-fatal
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profile?.uid, isDemoMode]);

  function handlePhotoSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      showToast("Please select a valid image file (JPEG, PNG).");
      return;
    }

    setSelectedPhoto(file);
    setPhotoPreview(URL.createObjectURL(file));
  }

  function clearPhoto() {
    if (photoPreview) URL.revokeObjectURL(photoPreview);
    setSelectedPhoto(null);
    setPhotoPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!note.trim() || !profile) return;

    setSaving(true);
    try {
      let uploadedPhotoUrl: string | undefined = undefined;
      if (selectedPhoto) {
        uploadedPhotoUrl = await uploadDiaryPhoto(profile.uid, selectedPhoto, isDemoMode);
      }

      const linkedCrop = crops.find((c) => c.id === linkedCropId);
      let daysAfterSowing: number | undefined = undefined;
      let stage = linkedCrop?.stage;

      if (linkedCrop?.sowingDate) {
        const sowing = new Date(linkedCrop.sowingDate).getTime();
        const entryDate = new Date(date).getTime();
        if (!isNaN(sowing) && !isNaN(entryDate)) {
          daysAfterSowing = Math.max(0, Math.round((entryDate - sowing) / 86400000));
        }
      }

      const payload: Omit<DiaryEntry, "id" | "ownerId"> = {
        date,
        note: note.trim(),
        cropId: linkedCrop?.id,
        cropName: linkedCrop?.name,
        farmId: linkedCrop?.farmId,
        stage,
        daysAfterSowing,
        imageUrls: uploadedPhotoUrl ? [uploadedPhotoUrl] : undefined,
      };

      if (isDemoMode) {
        setEntries((prev) => [
          { id: crypto.randomUUID(), ownerId: profile.uid, ...payload },
          ...prev,
        ]);
        setNote("");
        clearPhoto();
        setShowAdd(false);
        showToast(t("diary.entrySaved"));
        setSaving(false);
        return;
      }

      await addDiaryEntry(profile.uid, payload);
      setNote("");
      clearPhoto();
      setShowAdd(false);
      showToast(t("diary.entrySaved"));
      refresh();
    } catch {
      showToast(t("common.error"));
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm(t("diary.deleteConfirm"))) return;

    setEntries((prev) => prev.filter((e) => e.id !== id));
    showToast(t("diary.entryDeleted"));

    if (isDemoMode) return;

    try {
      await removeDiaryEntry(id);
    } catch {
      showToast(t("common.error"));
    }
  }

  // Filter entries by selected crop
  const filteredEntries =
    selectedCropId === "all"
      ? entries
      : entries.filter((e) => e.cropId === selectedCropId);

  // Chronological photos for compare mode
  const photoEntries = filteredEntries.filter((e) => e.imageUrls && e.imageUrls.length > 0);
  const earliestPhoto = photoEntries[photoEntries.length - 1];
  const latestPhoto = photoEntries[0];

  return (
    <div className="space-y-6 animate-fade-up">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <SectionHeading eyebrow={t("nav.diary")} title={t("diary.title")} />
        <div className="flex items-center gap-2">
          {photoEntries.length >= 2 && (
            <button
              onClick={() => setCompareMode((v) => !v)}
              className={`btn-secondary text-xs flex items-center gap-1.5 ${
                compareMode ? "bg-forest-800 text-cream-50" : ""
              }`}
            >
              <Columns size={13} /> {t("diary.comparePhotos")}
            </button>
          )}
          <button
            onClick={() => setShowAdd((v) => !v)}
            className="btn-primary text-xs flex items-center gap-1.5"
          >
            <Plus size={14} /> {t("diary.addEntry")}
          </button>
        </div>
      </div>

      {/* ── Crop Filter Bar ── */}
      {crops.length > 0 && (
        <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
          <button
            onClick={() => setSelectedCropId("all")}
            className={`px-3 py-1.5 rounded-full font-semibold border shrink-0 transition-all ${
              selectedCropId === "all"
                ? "bg-forest-700 text-cream-50 border-forest-700 shadow-sm"
                : "bg-cream-50 text-ink-light border-forest-100 hover:bg-forest-50"
            }`}
          >
            {t("diary.allEntries")}
          </button>
          {crops.map((c) => (
            <button
              key={c.id}
              onClick={() => setSelectedCropId(c.id)}
              className={`px-3 py-1.5 rounded-full font-semibold border shrink-0 transition-all flex items-center gap-1.5 ${
                selectedCropId === c.id
                  ? "bg-forest-700 text-cream-50 border-forest-700 shadow-sm"
                  : "bg-cream-50 text-ink-light border-forest-100 hover:bg-forest-50"
              }`}
            >
              <Sprout size={12} /> {c.name}
            </button>
          ))}
        </div>
      )}

      {/* ── Side-by-Side Compare View (Phase 20) ── */}
      {compareMode && photoEntries.length >= 2 && earliestPhoto && latestPhoto && (
        <div className="card p-5 bg-forest-50/70 border-forest-300 space-y-4">
          <div className="flex items-center justify-between border-b border-forest-200 pb-2">
            <h4 className="font-serif font-bold text-sm text-forest-950 flex items-center gap-2">
              <Sparkles size={15} className="text-wheat-600" /> {t("diary.growthComparison")}
            </h4>
            <button
              onClick={() => setCompareMode(false)}
              className="text-xs text-ink-light hover:underline"
            >
              {t("common.cancel")}
            </button>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            {/* Earlier Photo */}
            <div className="card p-3 bg-white space-y-2">
              <div className="flex justify-between items-center text-xs">
                <span className="font-bold text-forest-800">{t("diary.earlierPhoto")}</span>
                <span className="text-ink-light">{earliestPhoto.date}</span>
              </div>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={earliestPhoto.imageUrls![0]}
                alt="Earlier growth"
                className="w-full h-48 object-cover rounded-xl border border-forest-100"
              />
              <p className="text-xs text-ink-light italic">{earliestPhoto.note}</p>
            </div>

            {/* Latest Photo */}
            <div className="card p-3 bg-white space-y-2">
              <div className="flex justify-between items-center text-xs">
                <span className="font-bold text-forest-800">{t("diary.latestPhoto")}</span>
                <span className="text-ink-light">{latestPhoto.date}</span>
              </div>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={latestPhoto.imageUrls![0]}
                alt="Latest growth"
                className="w-full h-48 object-cover rounded-xl border border-forest-100"
              />
              <p className="text-xs text-ink-light italic">{latestPhoto.note}</p>
            </div>
          </div>
        </div>
      )}

      {/* ── New Entry Form ── */}
      {showAdd && (
        <form onSubmit={handleAdd} className="card p-5 space-y-4 bg-forest-50/50 border-forest-200">
          <div className="grid sm:grid-cols-2 gap-3">
            <div>
              <label className="label-field">{t("harvest.date")}</label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="input-field"
              />
            </div>

            <div>
              <label className="label-field">{t("harvest.selectCrop")} (Optional)</label>
              <select
                value={linkedCropId}
                onChange={(e) => setLinkedCropId(e.target.value)}
                className="input-field"
              >
                <option value="">-- {t("diary.generalObservation")} --</option>
                {crops.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({c.stage.replace(/_/g, " ")})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="label-field">{t("diary.fieldNotes")}</label>
            <textarea
              required
              rows={3}
              placeholder={t("diary.notesPlaceholder")}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="input-field w-full"
            />
          </div>

          {/* Photo upload */}
          <div className="flex items-center gap-3">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handlePhotoSelect}
              className="hidden"
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="btn-secondary text-xs py-1.5 px-3 flex items-center gap-1.5 text-forest-700"
            >
              <Camera size={14} /> {t("diary.attachPhoto")}
            </button>

            {photoPreview && (
              <div className="relative inline-block">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={photoPreview}
                  alt="Preview"
                  className="w-16 h-12 object-cover rounded-lg border border-forest-200"
                />
                <button
                  type="button"
                  onClick={clearPhoto}
                  className="absolute -top-1.5 -right-1.5 bg-rust-600 text-white rounded-full p-0.5 shadow hover:bg-rust-700"
                >
                  <X size={10} />
                </button>
              </div>
            )}
          </div>

          <div className="flex justify-end gap-2 pt-1">
            <button
              type="button"
              onClick={() => {
                setShowAdd(false);
                clearPhoto();
              }}
              className="btn-secondary text-xs"
            >
              {t("common.cancel")}
            </button>
            <button type="submit" disabled={saving} className="btn-primary text-xs">
              {saving ? t("common.loading") : t("common.save")}
            </button>
          </div>
        </form>
      )}

      {/* ── Chronological Growth Timeline ── */}
      {loading ? (
        <div className="space-y-3">
          <div className="skeleton h-20" />
          <div className="skeleton h-20" />
        </div>
      ) : filteredEntries.length === 0 ? (
        <div className="card p-8 text-center bg-cream-50">
          <Camera size={28} className="text-forest-400 mx-auto mb-2" />
          <p className="text-sm font-semibold text-forest-950">{t("diary.noEntriesTitle")}</p>
          <p className="text-xs text-ink-light mt-1">{t("diary.noEntriesMessage")}</p>
        </div>
      ) : (
        <div className="relative pl-6 sm:pl-8 border-l-2 border-forest-200 space-y-6">
          {filteredEntries.map((entry) => (
            <div key={entry.id} className="relative group">
              {/* Timeline marker */}
              <div className="absolute -left-[31px] sm:-left-[39px] top-4 w-4 h-4 rounded-full bg-forest-600 border-4 border-cream-100 shadow-sm" />

              <div className="card p-5 bg-white space-y-3 hover:border-forest-300 transition-colors">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-xs text-forest-950 flex items-center gap-1.5">
                      <Calendar size={13} className="text-forest-600" />
                      {entry.date}
                    </span>

                    {entry.daysAfterSowing !== undefined && (
                      <span className="chip bg-forest-100 text-forest-800 text-[11px]">
                        Day {entry.daysAfterSowing}
                      </span>
                    )}

                    {entry.cropName && (
                      <span className="chip bg-wheat-100 text-wheat-900 text-[11px] font-medium">
                        {entry.cropName} {entry.stage ? `(${entry.stage.replace(/_/g, " ")})` : ""}
                      </span>
                    )}
                  </div>

                  <button
                    onClick={() => handleDelete(entry.id)}
                    className="p-1 text-ink-light hover:text-rust-500 rounded transition-colors"
                    title={t("diary.deleteEntry")}
                  >
                    <Trash2 size={13} />
                  </button>
                </div>

                <p className="text-sm text-ink leading-relaxed whitespace-pre-wrap">{entry.note}</p>

                {/* Attached Growth Photos */}
                {entry.imageUrls && entry.imageUrls.length > 0 && (
                  <div className="flex gap-2.5 pt-1 overflow-x-auto pb-1">
                    {entry.imageUrls.map((url, i) => (
                      /* eslint-disable-next-line @next/next/no-img-element */
                      <img
                        key={i}
                        src={url}
                        alt="Crop growth log"
                        className="w-44 h-32 object-cover rounded-xl border border-forest-100 shadow-sm shrink-0"
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
