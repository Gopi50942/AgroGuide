import { getFirebaseDb, isFirebaseConfigured } from "@/lib/firebase/config";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  query,
  where,
} from "firebase/firestore";
import type {
  OfficerProfile,
  FarmerOfficerAccess,
  OfficerAccessScope,
  FarmerProfile,
  Crop,
  SoilReport,
  DiseaseReport,
  SchemeApplication,
} from "@/types";

// ─────────────────────────────────────────────
// Phase 32: Authorized Extension Officer Portal & Consent Engine
// Governs farmer-controlled read sharing with verified KVK / Department officers
// ─────────────────────────────────────────────

export const DEMO_OFFICERS: OfficerProfile[] = [
  {
    uid: "officer_tnau_cbe_01",
    name: "Dr. K. Senthilkumar",
    department: "Department of Agronomy",
    designation: "Subject Matter Specialist (Agronomy)",
    district: "Coimbatore",
    officeName: "ICAR-KVK TNAU Coimbatore",
    verified: true,
    officialEmail: "kvk.cbe@tnau.ac.in",
    phone: "0422-6611223",
    createdAt: "2026-01-10T09:00:00Z",
  },
  {
    uid: "officer_tnau_thj_02",
    name: "Dr. M. Rajendran",
    department: "Department of Agriculture",
    designation: "Assistant Director of Agriculture (ADA)",
    district: "Thanjavur",
    officeName: "District Agriculture Office Thanjavur",
    verified: true,
    officialEmail: "ada.thanjavur@tnagrisnet.tn.gov.in",
    phone: "04362-278234",
    createdAt: "2026-01-15T09:00:00Z",
  },
  {
    uid: "officer_tnau_mdu_03",
    name: "Dr. R. Meenakshi",
    department: "Plant Protection & Pathology",
    designation: "Senior Scientist & Head",
    district: "Madurai",
    officeName: "Agricultural College & Research Institute, Madurai",
    verified: true,
    officialEmail: "kvk.mdu@tnau.ac.in",
    phone: "0452-2422956",
    createdAt: "2026-02-01T09:00:00Z",
  },
];

export async function listVerifiedOfficers(district?: string): Promise<OfficerProfile[]> {
  if (!isFirebaseConfigured) {
    if (!district) return DEMO_OFFICERS;
    return DEMO_OFFICERS.filter((o) => o.district.toLowerCase() === district.toLowerCase());
  }

  const db = getFirebaseDb();
  if (!db) return DEMO_OFFICERS;

  try {
    const q = district
      ? query(collection(db, "officer_profiles"), where("district", "==", district), where("verified", "==", true))
      : query(collection(db, "officer_profiles"), where("verified", "==", true));
    const snap = await getDocs(q);
    const officers: OfficerProfile[] = [];
    snap.forEach((d) => officers.push(d.data() as OfficerProfile));
    return officers.length > 0 ? officers : DEMO_OFFICERS;
  } catch {
    return DEMO_OFFICERS;
  }
}

const demoMemoryStore: Record<string, string> = {};

function getDemoItem(key: string): string | null {
  if (typeof localStorage !== "undefined") {
    try {
      return localStorage.getItem(key);
    } catch {}
  }
  return demoMemoryStore[key] || null;
}

function setDemoItem(key: string, value: string): void {
  demoMemoryStore[key] = value;
  if (typeof localStorage !== "undefined") {
    try {
      localStorage.setItem(key, value);
    } catch {}
  }
}

export async function grantOfficerAccess(
  farmerId: string,
  farmerName: string,
  farmerDistrict: string,
  officer: OfficerProfile,
  scopes: OfficerAccessScope[],
  durationDays: number = 30,
  isDemoMode: boolean = false
): Promise<FarmerOfficerAccess> {
  const accessId = `${farmerId}_${officer.uid}`;
  const now = new Date();
  const expires = new Date(now.getTime() + durationDays * 24 * 60 * 60 * 1000);

  const accessRecord: FarmerOfficerAccess = {
    id: accessId,
    farmerId,
    farmerName,
    farmerDistrict,
    officerId: officer.uid,
    officerName: officer.name,
    officerDesignation: officer.designation,
    scopes,
    granted: true,
    grantedAt: now.toISOString(),
    expiresAt: expires.toISOString(),
    revokedAt: null,
  };

  if (isDemoMode || !isFirebaseConfigured) {
    try {
      const key = `agroguide_demo_officer_access_${farmerId}`;
      const existing: FarmerOfficerAccess[] = JSON.parse(getDemoItem(key) || "[]");
      const filtered = existing.filter((a) => a.id !== accessId);
      filtered.push(accessRecord);
      setDemoItem(key, JSON.stringify(filtered));
    } catch {}
    return accessRecord;
  }

  const db = getFirebaseDb();
  if (db) {
    await setDoc(doc(db, "farmer_officer_access", accessId), accessRecord);
  }

  return accessRecord;
}

export async function revokeOfficerAccess(
  farmerId: string,
  accessId: string,
  isDemoMode: boolean = false
): Promise<boolean> {
  const now = new Date().toISOString();

  if (isDemoMode || !isFirebaseConfigured) {
    try {
      const key = `agroguide_demo_officer_access_${farmerId}`;
      const existing: FarmerOfficerAccess[] = JSON.parse(getDemoItem(key) || "[]");
      const updated = existing.map((a) =>
        a.id === accessId ? { ...a, granted: false, revokedAt: now } : a
      );
      setDemoItem(key, JSON.stringify(updated));
      return true;
    } catch {
      return false;
    }
  }

  const db = getFirebaseDb();
  if (db) {
    await updateDoc(doc(db, "farmer_officer_access", accessId), {
      granted: false,
      revokedAt: now,
    });
  }

  return true;
}

export async function listFarmerOfficerAccess(
  farmerId: string,
  isDemoMode: boolean = false
): Promise<FarmerOfficerAccess[]> {
  if (isDemoMode || !isFirebaseConfigured) {
    try {
      const key = `agroguide_demo_officer_access_${farmerId}`;
      return JSON.parse(getDemoItem(key) || "[]");
    } catch {
      return [];
    }
  }

  const db = getFirebaseDb();
  if (!db) return [];

  try {
    const q = query(
      collection(db, "farmer_officer_access"),
      where("farmerId", "==", farmerId)
    );
    const snap = await getDocs(q);
    const results: FarmerOfficerAccess[] = [];
    snap.forEach((d) => results.push(d.data() as FarmerOfficerAccess));
    return results;
  } catch {
    return [];
  }
}

export async function listConsentingFarmersForOfficer(
  officerId: string,
  isDemoMode: boolean = false
): Promise<FarmerOfficerAccess[]> {
  if (isDemoMode || !isFirebaseConfigured) {
    return [
      {
        id: `demo_farmer_01_${officerId}`,
        farmerId: "demo_farmer_01",
        farmerName: "Murugan Palanisamy",
        farmerDistrict: "Coimbatore",
        officerId,
        officerName: "Dr. K. Senthilkumar",
        officerDesignation: "Subject Matter Specialist",
        scopes: ["farm_summary", "crop_status", "soil_reports", "disease_reports"],
        granted: true,
        grantedAt: "2026-06-01T10:00:00Z",
        expiresAt: "2026-07-01T10:00:00Z",
        revokedAt: null,
      },
    ];
  }

  const db = getFirebaseDb();
  if (!db) return [];

  try {
    const q = query(
      collection(db, "farmer_officer_access"),
      where("officerId", "==", officerId),
      where("granted", "==", true)
    );
    const snap = await getDocs(q);
    const results: FarmerOfficerAccess[] = [];
    const now = new Date().toISOString();
    snap.forEach((d) => {
      const data = d.data() as FarmerOfficerAccess;
      if (data.expiresAt > now && !data.revokedAt) {
        results.push(data);
      }
    });
    return results;
  } catch {
    return [];
  }
}
