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
  CustomHiringProvider,
  EquipmentRequest,
  EquipmentCategory,
} from "@/types";

// ─────────────────────────────────────────────
// Phase 36: Custom Hiring Center & Farm Machinery Coordination
// Facilitates equipment hiring from verified government CHCs and FPO equipment hubs
// ─────────────────────────────────────────────

export const DEMO_CHC_PROVIDERS: CustomHiringProvider[] = [
  {
    id: "chc_cbe_govt_01",
    centerName: "Coimbatore South Block Custom Hiring Centre (Govt/AED)",
    operatorType: "chc_government",
    district: "Coimbatore",
    taluk: "Sulur",
    contactNumber: "0422-2687123",
    verified: true,
    isDemo: true,
    equipmentAvailable: [
      { category: "tractor", model: "Mahindra 575 DI (45 HP)", ratePerHourRs: 850, availableCount: 3 },
      { category: "rotavator", model: "Shaktiman Rotary Tiller 6ft", ratePerHourRs: 450, availableCount: 2 },
      { category: "sprayer", model: "Tractor-mounted Boom Sprayer (500L)", ratePerHourRs: 350, availableCount: 2 },
      { category: "drone_sprayer", model: "Agri-Drone 10L Precision Sprayer", ratePerHourRs: 600, availableCount: 1 },
    ],
  },
  {
    id: "chc_thj_fpo_02",
    centerName: "Cauvery Delta Harvesters & Transplanter Hub",
    operatorType: "fpo_cooperative",
    district: "Thanjavur",
    taluk: "Kumbakonam",
    contactNumber: "04362-251480",
    verified: true,
    isDemo: true,
    equipmentAvailable: [
      { category: "harvester", model: "Class Paddy Combine Harvester (Track)", ratePerHourRs: 2200, availableCount: 2 },
      { category: "transplanter", model: "Kubota 4-Row Paddy Transplanter", ratePerHourRs: 1200, availableCount: 2 },
      { category: "power_tiller", model: "VST Shakti 130DI Power Tiller", ratePerHourRs: 500, availableCount: 4 },
    ],
  },
  {
    id: "chc_mdu_hub_03",
    centerName: "Madurai Agri-Machinery Cooperative",
    operatorType: "fpo_cooperative",
    district: "Madurai",
    taluk: "Melur",
    contactNumber: "0452-2468112",
    verified: true,
    isDemo: true,
    equipmentAvailable: [
      { category: "tractor", model: "John Deere 5050D", ratePerHourRs: 900, availableCount: 2 },
      { category: "rotavator", model: "Fieldking Rotavator 7ft", ratePerHourRs: 500, availableCount: 1 },
      { category: "sprayer", model: "Battery Knapsack Power Sprayer", ratePerHourRs: 150, availableCount: 5 },
    ],
  },
];

export async function listMachineryProviders(district?: string): Promise<CustomHiringProvider[]> {
  if (!district) return DEMO_CHC_PROVIDERS;
  return DEMO_CHC_PROVIDERS.filter((p) => p.district.toLowerCase() === district.toLowerCase());
}

export async function createEquipmentBookingRequest(
  ownerId: string,
  farmerName: string,
  farmerPhone: string,
  farmId: string,
  farmName: string,
  provider: CustomHiringProvider,
  equipmentType: EquipmentCategory,
  preferredDate: string,
  durationHours: number,
  notes?: string,
  isDemoMode: boolean = false
): Promise<EquipmentRequest> {
  const reqId = `eq_req_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
  const request: EquipmentRequest = {
    id: reqId,
    ownerId,
    farmerName,
    farmerPhone,
    farmId,
    farmName,
    providerId: provider.id,
    providerName: provider.centerName,
    equipmentType,
    preferredDate,
    durationHours,
    notes,
    status: "requested",
    createdAt: new Date().toISOString(),
  };

  if (isDemoMode || !isFirebaseConfigured) {
    try {
      const key = `agroguide_demo_equipment_requests_${ownerId}`;
      const existing: EquipmentRequest[] = JSON.parse(localStorage.getItem(key) || "[]");
      existing.unshift(request);
      localStorage.setItem(key, JSON.stringify(existing));
    } catch {}
    return request;
  }

  const db = getFirebaseDb();
  if (db) {
    await setDoc(doc(db, "equipment_requests", reqId), request);
  }

  return request;
}

export async function listFarmerEquipmentRequests(
  ownerId: string,
  isDemoMode: boolean = false
): Promise<EquipmentRequest[]> {
  if (isDemoMode || !isFirebaseConfigured) {
    try {
      const key = `agroguide_demo_equipment_requests_${ownerId}`;
      const stored = localStorage.getItem(key);
      if (stored) return JSON.parse(stored);
      return [
        {
          id: `demo_eq_req_01`,
          ownerId,
          farmerName: "Farmer Member",
          farmerPhone: "9876543210",
          farmId: "farm_01",
          farmName: "Cauvery North Field",
          providerId: "chc_cbe_govt_01",
          providerName: "Coimbatore South Block Custom Hiring Centre (Govt/AED)",
          equipmentType: "tractor",
          preferredDate: "2026-06-25",
          durationHours: 4,
          notes: "Primary tillage before tomato transplanting",
          status: "confirmed",
          createdAt: "2026-06-18T10:00:00Z",
        },
      ];
    } catch {
      return [];
    }
  }

  const db = getFirebaseDb();
  if (!db) return [];

  try {
    const q = query(
      collection(db, "equipment_requests"),
      where("ownerId", "==", ownerId)
    );
    const snap = await getDocs(q);
    const results: EquipmentRequest[] = [];
    snap.forEach((d) => results.push(d.data() as EquipmentRequest));
    return results;
  } catch {
    return [];
  }
}
