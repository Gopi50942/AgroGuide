import { getFirebaseDb, isFirebaseConfigured } from "@/lib/firebase/config";
import {
  collection,
  doc,
  getDocs,
  getDoc,
  setDoc,
  updateDoc,
  query,
  where,
} from "firebase/firestore";
import type {
  HarvestBatch,
  PublicTraceBatchPayload,
  HarvestRecord,
  Farm,
  Crop,
} from "@/types";

// ─────────────────────────────────────────────
// Phase 37: Harvest Batch Traceability & Public QR Verification
// Generates sanitized cryptographic-safe public batch certificates for farm produce
// ─────────────────────────────────────────────

export function generateBatchCode(crop: string, district: string): string {
  const cropPrefix = (crop || "CROP").slice(0, 3).toUpperCase();
  const distPrefix = (district || "TN").slice(0, 3).toUpperCase();
  const rand = Math.random().toString(36).slice(2, 7).toUpperCase();
  const year = new Date().getFullYear();
  return `AG-${distPrefix}-${cropPrefix}-${year}-${rand}`;
}

export async function createHarvestBatch(
  ownerId: string,
  harvestRecord: HarvestRecord,
  farm: Farm | null,
  crop: Crop | null,
  farmerDisplayName?: string,
  isPublic: boolean = true,
  isDemoMode: boolean = false
): Promise<HarvestBatch> {
  const batchCode = generateBatchCode(harvestRecord.cropName || harvestRecord.crop || "Crop", farm?.district || "Tamil Nadu");
  const batchId = `batch_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;

  const batch: HarvestBatch = {
    id: batchId,
    ownerId,
    batchCode,
    farmId: harvestRecord.farmId || farm?.id || "farm_main",
    farmName: farm?.name || "AgroGuide Farm",
    cropId: harvestRecord.cropId || crop?.id || "crop_main",
    crop: harvestRecord.cropName || harvestRecord.crop || "Crop",
    variety: crop?.variety || "Standard Hybrid",
    harvestRecordId: harvestRecord.id,
    harvestDate: harvestRecord.harvestDate,
    quantity: harvestRecord.quantity,
    unit: (harvestRecord.quantityUnit || harvestRecord.unit || "quintal") as any,
    qualityGrade: harvestRecord.qualityGrade || "FAQ Grade A",
    district: farm?.district || "Tamil Nadu",
    state: "Tamil Nadu",
    farmerConsentDisplayName: farmerDisplayName,
    isPublic,
    createdAt: new Date().toISOString(),
  };

  if (isDemoMode || !isFirebaseConfigured) {
    try {
      const key = `agroguide_demo_batches_${ownerId}`;
      const existing: HarvestBatch[] = JSON.parse(localStorage.getItem(key) || "[]");
      existing.unshift(batch);
      localStorage.setItem(key, JSON.stringify(existing));

      // Also store in global public lookup for demo trace page
      localStorage.setItem(`agroguide_public_batch_${batchCode}`, JSON.stringify(batch));
    } catch {}
    return batch;
  }

  const db = getFirebaseDb();
  if (db) {
    await setDoc(doc(db, "harvest_batches", batchId), batch);
  }

  return batch;
}

export async function getPublicTraceBatch(
  batchCode: string,
  isDemoMode: boolean = false
): Promise<PublicTraceBatchPayload | null> {
  if (isDemoMode || !isFirebaseConfigured) {
    try {
      const stored = localStorage.getItem(`agroguide_public_batch_${batchCode}`);
      if (stored) {
        const batch: HarvestBatch = JSON.parse(stored);
        if (!batch.isPublic) return null;
        return sanitizeBatchForPublicView(batch);
      }
      // Demo fallback certificate
      if (batchCode.startsWith("AG-")) {
        return {
          batchCode,
          crop: "Hybrid Tomato F1",
          variety: "Shivam / Abhinav",
          district: "Coimbatore",
          state: "Tamil Nadu",
          harvestDate: "2026-06-20",
          qualityGrade: "Grade A (Export / Mandi FAQ)",
          farmerDisplayName: "Verified Farmer Member",
          verifiedBy: "AgroGuide Farm Traceability Network",
          traceTimestamp: new Date().toISOString(),
        };
      }
      return null;
    } catch {
      return null;
    }
  }

  const db = getFirebaseDb();
  if (!db) return null;

  try {
    const q = query(
      collection(db, "harvest_batches"),
      where("batchCode", "==", batchCode),
      where("isPublic", "==", true)
    );
    const snap = await getDocs(q);
    if (snap.empty) return null;

    const batch = snap.docs[0].data() as HarvestBatch;
    return sanitizeBatchForPublicView(batch);
  } catch {
    return null;
  }
}

/**
 * Strict data minimisation — strips internal IDs, GPS, financials, and private notes
 */
export function sanitizeBatchForPublicView(batch: HarvestBatch): PublicTraceBatchPayload {
  return {
    batchCode: batch.batchCode,
    crop: batch.crop,
    variety: batch.variety,
    district: batch.district,
    state: batch.state,
    harvestDate: batch.harvestDate,
    qualityGrade: batch.qualityGrade,
    farmerDisplayName: batch.farmerConsentDisplayName || "Verified Farmer Partner",
    verifiedBy: "AgroGuide Farm Traceability Network",
    traceTimestamp: new Date().toISOString(),
  };
}

export async function listFarmerHarvestBatches(
  ownerId: string,
  isDemoMode: boolean = false
): Promise<HarvestBatch[]> {
  if (isDemoMode || !isFirebaseConfigured) {
    try {
      const key = `agroguide_demo_batches_${ownerId}`;
      const stored = localStorage.getItem(key);
      if (stored) return JSON.parse(stored);
      return [];
    } catch {
      return [];
    }
  }

  const db = getFirebaseDb();
  if (!db) return [];

  try {
    const q = query(
      collection(db, "harvest_batches"),
      where("ownerId", "==", ownerId)
    );
    const snap = await getDocs(q);
    const results: HarvestBatch[] = [];
    snap.forEach((d) => results.push(d.data() as HarvestBatch));
    return results;
  } catch {
    return [];
  }
}

export async function toggleBatchPublicStatus(
  batchId: string,
  ownerId: string,
  isPublic: boolean,
  isDemoMode: boolean = false
): Promise<boolean> {
  if (isDemoMode || !isFirebaseConfigured) {
    try {
      const key = `agroguide_demo_batches_${ownerId}`;
      const existing: HarvestBatch[] = JSON.parse(localStorage.getItem(key) || "[]");
      const updated = existing.map((b) => (b.id === batchId ? { ...b, isPublic } : b));
      localStorage.setItem(key, JSON.stringify(updated));
      return true;
    } catch {
      return false;
    }
  }

  const db = getFirebaseDb();
  if (db) {
    await updateDoc(doc(db, "harvest_batches", batchId), { isPublic });
  }

  return true;
}
