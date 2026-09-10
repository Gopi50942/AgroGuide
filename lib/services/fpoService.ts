import { getFirebaseDb, isFirebaseConfigured } from "@/lib/firebase/config";
import {
  collection,
  doc,
  getDocs,
  setDoc,
  updateDoc,
  query,
  where,
} from "firebase/firestore";
import type {
  FPO,
  FPOMembership,
  FPOLot,
  FPOBuyerRequirement,
  QuantityUnit,
} from "@/types";

// ─────────────────────────────────────────────
// Phase 34: FPO Produce Aggregation & Collective Selling Engine
// Enables collective bargaining and harvest pooling for farmer producer organizations
// ─────────────────────────────────────────────

export const DEMO_FPOS: FPO[] = [
  {
    id: "fpo_cbe_organic_01",
    name: "Kongu Farmer Producer Company Ltd.",
    district: "Coimbatore",
    state: "Tamil Nadu",
    registrationReference: "DEMO-FPO-CBE-2024",
    verifiedStatus: true,
    contactPerson: "P. Shanmugam (Managing Director)",
    contactPhone: "0422-2645890",
    cropsHandled: ["Tomato", "Chilli", "Turmeric", "Banana", "Maize"],
    isDemo: true,
  },
  {
    id: "fpo_thj_delta_rice_02",
    name: "Cauvery Delta Organic Paddy Farmers Collective",
    district: "Thanjavur",
    state: "Tamil Nadu",
    registrationReference: "DEMO-FPO-THJ-2023",
    verifiedStatus: true,
    contactPerson: "V. Swaminathan (Secretary)",
    contactPhone: "04362-245120",
    cropsHandled: ["Paddy", "Black Gram", "Green Gram", "Sesame"],
    isDemo: true,
  },
  {
    id: "fpo_mdu_pulses_03",
    name: "Madurai Agro-Producers Cooperative Federation",
    district: "Madurai",
    state: "Tamil Nadu",
    registrationReference: "DEMO-FPO-MDU-2022",
    verifiedStatus: true,
    contactPerson: "K. Alagarsamy (CEO)",
    contactPhone: "0452-2589012",
    cropsHandled: ["Red Gram", "Groundnut", "Cotton", "Millets"],
    isDemo: true,
  },
];

export const DEMO_BUYER_REQUIREMENTS: FPOBuyerRequirement[] = [
  {
    id: "req_itc_spices_01",
    fpoId: "fpo_cbe_organic_01",
    buyerName: "Agro-Processing Exporters Consortium",
    crop: "Turmeric (Curcumin > 4%)",
    requiredQuantity: 250,
    unit: "quintal",
    offeredPricePerUnit: 12500,
    deliveryLocation: "Erode Processing Hub",
    deadlineDate: "2026-08-30",
    status: "open",
  },
  {
    id: "req_organic_retail_02",
    fpoId: "fpo_thj_delta_rice_02",
    buyerName: "Tamil Nadu Organic Food Network",
    crop: "Traditional Paddy (Mappillai Samba / Karuppu Kavuni)",
    requiredQuantity: 150,
    unit: "quintal",
    offeredPricePerUnit: 4200,
    deliveryLocation: "Thanjavur FPO Warehouse",
    deadlineDate: "2026-09-15",
    status: "open",
  },
];

export async function listFPOs(district?: string): Promise<FPO[]> {
  if (!district) return DEMO_FPOS;
  return DEMO_FPOS.filter((f) => f.district.toLowerCase() === district.toLowerCase());
}

export async function requestFpoMembership(
  ownerId: string,
  farmerName: string,
  fpo: FPO,
  isDemoMode: boolean = false
): Promise<FPOMembership> {
  const membershipId = `fpo_mem_${ownerId}_${fpo.id}`;
  const membership: FPOMembership = {
    id: membershipId,
    ownerId,
    farmerName,
    fpoId: fpo.id,
    fpoName: fpo.name,
    status: "active", // Approved for pilot demonstration
    joinedDate: new Date().toISOString(),
  };

  if (isDemoMode || !isFirebaseConfigured) {
    try {
      const key = `agroguide_demo_fpo_memberships_${ownerId}`;
      const existing: FPOMembership[] = JSON.parse(localStorage.getItem(key) || "[]");
      const filtered = existing.filter((m) => m.id !== membershipId);
      filtered.push(membership);
      localStorage.setItem(key, JSON.stringify(filtered));
    } catch {}
    return membership;
  }

  const db = getFirebaseDb();
  if (db) {
    await setDoc(doc(db, "fpo_memberships", membershipId), membership);
  }

  return membership;
}

export async function listFarmerFpoMemberships(
  ownerId: string,
  isDemoMode: boolean = false
): Promise<FPOMembership[]> {
  if (isDemoMode || !isFirebaseConfigured) {
    try {
      const key = `agroguide_demo_fpo_memberships_${ownerId}`;
      const stored = localStorage.getItem(key);
      if (stored) return JSON.parse(stored);
      // Default demo membership
      return [
        {
          id: `fpo_mem_${ownerId}_fpo_cbe_organic_01`,
          ownerId,
          farmerName: "Farmer Member",
          fpoId: "fpo_cbe_organic_01",
          fpoName: "Kongu Farmer Producer Company Ltd.",
          status: "active",
          joinedDate: "2026-03-01T00:00:00Z",
        },
      ];
    } catch {
      return [];
    }
  }

  const db = getFirebaseDb();
  if (!db) return [];

  try {
    const q = query(collection(db, "fpo_memberships"), where("ownerId", "==", ownerId));
    const snap = await getDocs(q);
    const res: FPOMembership[] = [];
    snap.forEach((d) => res.push(d.data() as FPOMembership));
    return res;
  } catch {
    return [];
  }
}

export async function offerLotToFpo(
  ownerId: string,
  fpoId: string,
  crop: string,
  variety: string,
  grade: string,
  quantity: number,
  unit: QuantityUnit,
  availableDate: string,
  expectedPricePerUnit?: number,
  harvestRecordId?: string,
  isDemoMode: boolean = false
): Promise<FPOLot> {
  const lotId = `fpo_lot_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
  const lot: FPOLot = {
    id: lotId,
    ownerId,
    fpoId,
    harvestRecordId,
    crop,
    variety,
    grade,
    quantity,
    unit,
    availableDate,
    expectedPricePerUnit,
    status: "pooled",
    createdAt: new Date().toISOString(),
  };

  if (isDemoMode || !isFirebaseConfigured) {
    try {
      const key = `agroguide_demo_fpo_lots_${fpoId}`;
      const existing: FPOLot[] = JSON.parse(localStorage.getItem(key) || "[]");
      existing.push(lot);
      localStorage.setItem(key, JSON.stringify(existing));
    } catch {}
    return lot;
  }

  const db = getFirebaseDb();
  if (db) {
    await setDoc(doc(db, "fpo_lots", lotId), lot);
  }

  return lot;
}

export function calculateFpoTotalPooled(
  lots: FPOLot[],
  cropFilter?: string
): { totalQuantity: number; unit: QuantityUnit; lotCount: number } {
  const filtered = cropFilter
    ? lots.filter((l) => l.crop.toLowerCase().includes(cropFilter.toLowerCase()))
    : lots;

  const totalQuantity = filtered.reduce((acc, l) => acc + (Number(l.quantity) || 0), 0);
  const unit = filtered.length > 0 ? filtered[0].unit : "quintal";

  return {
    totalQuantity,
    unit,
    lotCount: filtered.length,
  };
}
