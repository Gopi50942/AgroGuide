import { getFirebaseDb, isFirebaseConfigured } from "@/lib/firebase/config";
import { collection, doc, getDocs, setDoc, query, where } from "firebase/firestore";
import type { ProduceQualityRecord, QualityAssessmentSource } from "@/types";

// ─────────────────────────────────────────────
// Phase 72: Produce Quality Grading & Moisture Record Service
// ─────────────────────────────────────────────

export async function createProduceQualityRecord(
  ownerId: string,
  crop: string,
  grade: ProduceQualityRecord["grade"],
  visualQualityScore: number,
  assessmentType: QualityAssessmentSource,
  options?: {
    harvestBatchId?: string;
    variety?: string;
    moisturePercent?: number;
    sizeCategory?: "Large" | "Medium" | "Small";
    foreignMatterPercent?: number;
    assessorName?: string;
    notes?: string;
  },
  isDemoMode: boolean = false
): Promise<ProduceQualityRecord> {
  const qualityId = `qual_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
  const record: ProduceQualityRecord = {
    id: qualityId,
    ownerId,
    crop,
    grade,
    visualQualityScore: Math.min(10, Math.max(1, visualQualityScore)),
    assessmentType,
    harvestBatchId: options?.harvestBatchId,
    variety: options?.variety,
    moisturePercent: options?.moisturePercent,
    sizeCategory: options?.sizeCategory,
    foreignMatterPercent: options?.foreignMatterPercent,
    assessorName: options?.assessorName || (assessmentType === "farmer_self" ? "Farmer Self-Assessment" : "Authorized Grader"),
    notes: options?.notes,
    createdAt: new Date().toISOString(),
  };

  if (isDemoMode || !isFirebaseConfigured) {
    try {
      const key = `agroguide_demo_quality_${ownerId}`;
      const existing: ProduceQualityRecord[] = JSON.parse(localStorage.getItem(key) || "[]");
      existing.unshift(record);
      localStorage.setItem(key, JSON.stringify(existing));
    } catch {}
    return record;
  }

  const db = getFirebaseDb();
  if (db) {
    await setDoc(doc(db, "produce_quality_records", qualityId), record);
  }

  return record;
}

export async function listProduceQualityRecords(
  ownerId: string,
  isDemoMode: boolean = false
): Promise<ProduceQualityRecord[]> {
  if (isDemoMode || !isFirebaseConfigured) {
    try {
      const key = `agroguide_demo_quality_${ownerId}`;
      const stored = localStorage.getItem(key);
      if (stored) return JSON.parse(stored);
      return [
        {
          id: "qual_demo_01",
          ownerId,
          crop: "Tomato",
          variety: "Shivam Hybrid",
          grade: "Grade A / Premium",
          visualQualityScore: 9,
          moisturePercent: 12.5,
          sizeCategory: "Large",
          assessmentType: "farmer_self",
          assessorName: "Farmer Self-Assessment",
          createdAt: "2026-06-25T10:00:00Z",
        },
      ];
    } catch {
      return [];
    }
  }

  const db = getFirebaseDb();
  if (!db) return [];

  try {
    const q = query(collection(db, "produce_quality_records"), where("ownerId", "==", ownerId));
    const snap = await getDocs(q);
    const res: ProduceQualityRecord[] = [];
    snap.forEach((d) => res.push(d.data() as ProduceQualityRecord));
    return res;
  } catch {
    return [];
  }
}
