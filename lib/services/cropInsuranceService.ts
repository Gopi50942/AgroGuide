import { getFirebaseDb, isFirebaseConfigured } from "@/lib/firebase/config";
import { collection, doc, getDocs, setDoc, query, where } from "firebase/firestore";
import type {
  CropInsuranceRecord,
  CropLossEvent,
  LossEventType,
} from "@/types";

// ─────────────────────────────────────────────
// Phase 47: Crop Insurance Policy & Field Loss Evidence Center
// Empowers farmers to document loss events and prepare evidence dossiers for PMFBY claims.
// ─────────────────────────────────────────────

export async function createCropInsuranceRecord(
  ownerId: string,
  cropId: string,
  cropName: string,
  scheme: string,
  season: string,
  policyReference: string,
  insuredAreaAcres: number,
  sumInsuredRs?: number,
  premiumPaidRs?: number,
  isDemoMode: boolean = false
): Promise<CropInsuranceRecord> {
  const policyId = `ins_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
  const record: CropInsuranceRecord = {
    id: policyId,
    ownerId,
    cropId,
    cropName,
    scheme,
    season,
    policyReference,
    insuredAreaAcres,
    sumInsuredRs,
    premiumPaidRs,
    status: "active",
    createdAt: new Date().toISOString(),
  };

  if (isDemoMode || !isFirebaseConfigured) {
    try {
      const key = `agroguide_demo_insurance_${ownerId}`;
      const existing: CropInsuranceRecord[] = JSON.parse(localStorage.getItem(key) || "[]");
      existing.unshift(record);
      localStorage.setItem(key, JSON.stringify(existing));
    } catch {}
    return record;
  }

  const db = getFirebaseDb();
  if (db) {
    await setDoc(doc(db, "crop_insurance_records", policyId), record);
  }

  return record;
}

export async function recordCropLossEvent(
  ownerId: string,
  farmId: string,
  farmName: string,
  cropId: string,
  cropName: string,
  eventType: LossEventType,
  eventDate: string,
  estimatedAffectedAreaAcres: number,
  farmerNotes: string,
  photoUrls: string[] = [],
  weatherContext?: { temperatureC?: number; rainfallMm?: number; windKph?: number },
  policyReference?: string,
  isDemoMode: boolean = false
): Promise<CropLossEvent> {
  const lossId = `loss_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
  const lossEvent: CropLossEvent = {
    id: lossId,
    ownerId,
    farmId,
    farmName,
    cropId,
    cropName,
    eventType,
    eventDate,
    estimatedAffectedAreaAcres,
    farmerNotes,
    photoUrls,
    weatherContext,
    policyReference,
    isEvidenceGenerated: true,
    createdAt: new Date().toISOString(),
  };

  if (isDemoMode || !isFirebaseConfigured) {
    try {
      const key = `agroguide_demo_loss_events_${ownerId}`;
      const existing: CropLossEvent[] = JSON.parse(localStorage.getItem(key) || "[]");
      existing.unshift(lossEvent);
      localStorage.setItem(key, JSON.stringify(existing));
    } catch {}
    return lossEvent;
  }

  const db = getFirebaseDb();
  if (db) {
    await setDoc(doc(db, "crop_loss_events", lossId), lossEvent);
  }

  return lossEvent;
}

export async function listFarmerCropLossEvents(
  ownerId: string,
  isDemoMode: boolean = false
): Promise<CropLossEvent[]> {
  if (isDemoMode || !isFirebaseConfigured) {
    try {
      const key = `agroguide_demo_loss_events_${ownerId}`;
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
    const q = query(collection(db, "crop_loss_events"), where("ownerId", "==", ownerId));
    const snap = await getDocs(q);
    const res: CropLossEvent[] = [];
    snap.forEach((d) => res.push(d.data() as CropLossEvent));
    return res;
  } catch {
    return [];
  }
}

export function generateLossEvidenceSummary(
  lossEvent: CropLossEvent,
  farmerName: string,
  district: string
): {
  dossierTitle: string;
  evidenceItems: { label: string; value: string }[];
  disclaimer: string;
} {
  return {
    dossierTitle: `Crop Damage & Loss Evidence Dossier — ${lossEvent.cropName}`,
    evidenceItems: [
      { label: "Farmer Name", value: farmerName },
      { label: "District / Location", value: district },
      { label: "Farm & Field", value: lossEvent.farmName || "Primary Cultivation Unit" },
      { label: "Crop Affected", value: lossEvent.cropName },
      { label: "Disaster / Loss Cause", value: lossEvent.eventType.replace(/_/g, " ").toUpperCase() },
      { label: "Date of Occurrence", value: lossEvent.eventDate },
      { label: "Estimated Damage Extent", value: `${lossEvent.estimatedAffectedAreaAcres} Acres` },
      { label: "Policy Reference", value: lossEvent.policyReference || "Pending linking" },
      { label: "Local Weather at Event", value: lossEvent.weatherContext?.rainfallMm ? `${lossEvent.weatherContext.rainfallMm} mm rainfall` : "Recorded in AgroGuide history" },
      { label: "Farmer Statement", value: lossEvent.farmerNotes },
      { label: "Photographic Records", value: `${lossEvent.photoUrls?.length || 0} geo-tagged photos attached` },
    ],
    disclaimer: "Farmer-recorded evidence — not an official insurance assessment. Submit this dossier to your authorized District Agriculture Officer or Insurance Representative within 72 hours of loss.",
  };
}
