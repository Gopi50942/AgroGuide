import { getFirebaseDb, isFirebaseConfigured } from "@/lib/firebase/config";
import { cleanFirestoreData } from "@/lib/firebase/cleanData";
import {
  collection,
  doc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
} from "firebase/firestore";
import type {
  LivestockRecord,
  MilkYieldLog,
  LivestockHealthEvent,
  Expense,
  LivestockAnimalType,
} from "@/types";

// ─────────────────────────────────────────────
// Phase 38: Livestock & Mixed-Farming Ledger Service
// Tracks cattle/livestock inventory, daily dairy milk yields, and feed expenses
// ─────────────────────────────────────────────

export async function createLivestockAnimal(
  ownerId: string,
  animalType: LivestockAnimalType,
  breed: string,
  tagNameOrNumber: string,
  gender: "female" | "male",
  birthDate?: string,
  acquiredDate?: string,
  notes?: string,
  isDemoMode: boolean = false
): Promise<LivestockRecord> {
  const animalId = `live_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
  const animal: LivestockRecord = {
    id: animalId,
    ownerId,
    animalType,
    breed,
    tagNameOrNumber,
    gender,
    birthDate: birthDate || undefined,
    acquiredDate: acquiredDate || new Date().toISOString().slice(0, 10),
    status: "active",
    notes: notes || undefined,
    createdAt: new Date().toISOString(),
  };

  if (isDemoMode || !isFirebaseConfigured) {
    try {
      const key = `agroguide_demo_livestock_${ownerId}`;
      const existing: LivestockRecord[] = JSON.parse(localStorage.getItem(key) || "[]");
      existing.unshift(animal);
      localStorage.setItem(key, JSON.stringify(existing));
    } catch {}
    return animal;
  }

  const db = getFirebaseDb();
  if (db) {
    // Sanitize undefined fields so Firestore setDoc does not throw
    const sanitized = cleanFirestoreData(animal);
    await setDoc(doc(db, "livestock", animalId), sanitized);
  }

  return animal;
}

export async function logDailyMilkYield(
  ownerId: string,
  animalId: string,
  date: string,
  morningLitres: number,
  eveningLitres: number,
  sellingPricePerLitre: number = 40,
  animalTag?: string,
  isDemoMode: boolean = false
): Promise<MilkYieldLog> {
  const logId = `milk_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
  const totalLitres = Number(morningLitres) + Number(eveningLitres);
  const revenueGeneratedRs = totalLitres * Number(sellingPricePerLitre);

  const milkLog: MilkYieldLog = {
    id: logId,
    ownerId,
    animalId,
    animalTag: animalTag || undefined,
    date,
    morningLitres: Number(morningLitres),
    eveningLitres: Number(eveningLitres),
    totalLitres,
    sellingPricePerLitre: Number(sellingPricePerLitre),
    revenueGeneratedRs,
    createdAt: new Date().toISOString(),
  };

  if (isDemoMode || !isFirebaseConfigured) {
    try {
      const key = `agroguide_demo_milkyield_${ownerId}`;
      const existing: MilkYieldLog[] = JSON.parse(localStorage.getItem(key) || "[]");
      existing.unshift(milkLog);
      localStorage.setItem(key, JSON.stringify(existing));
    } catch {}
    return milkLog;
  }

  const db = getFirebaseDb();
  if (db) {
    const sanitized = cleanFirestoreData(milkLog);
    await setDoc(doc(db, "milk_yield_logs", logId), sanitized);
  }

  return milkLog;
}

export async function listFarmerLivestock(
  ownerId: string,
  isDemoMode: boolean = false
): Promise<LivestockRecord[]> {
  if (isDemoMode || !isFirebaseConfigured) {
    try {
      const key = `agroguide_demo_livestock_${ownerId}`;
      const stored = localStorage.getItem(key);
      if (stored) return JSON.parse(stored);
      return [
        {
          id: "live_demo_01",
          ownerId,
          animalType: "cow",
          breed: "Kangayam (Native) / Holstein Friesian Cross",
          tagNameOrNumber: "TN-CBE-042",
          gender: "female",
          acquiredDate: "2024-05-10",
          status: "active",
          notes: "Good milker, 12L daily avg",
          createdAt: "2024-05-10T00:00:00Z",
        },
        {
          id: "live_demo_02",
          ownerId,
          animalType: "buffalo",
          breed: "Murrah",
          tagNameOrNumber: "TN-CBE-089",
          gender: "female",
          acquiredDate: "2025-01-15",
          status: "active",
          notes: "High fat content dairy",
          createdAt: "2025-01-15T00:00:00Z",
        },
      ];
    } catch {
      return [];
    }
  }

  const db = getFirebaseDb();
  if (!db) return [];

  try {
    const q = query(collection(db, "livestock"), where("ownerId", "==", ownerId));
    const snap = await getDocs(q);
    const results: LivestockRecord[] = [];
    snap.forEach((d) => results.push(d.data() as LivestockRecord));
    return results;
  } catch {
    return [];
  }
}

export async function listFarmerMilkYieldLogs(
  ownerId: string,
  isDemoMode: boolean = false
): Promise<MilkYieldLog[]> {
  if (isDemoMode || !isFirebaseConfigured) {
    try {
      const key = `agroguide_demo_milkyield_${ownerId}`;
      const stored = localStorage.getItem(key);
      if (stored) return JSON.parse(stored);
      return [
        {
          id: "milk_demo_01",
          ownerId,
          animalId: "live_demo_01",
          animalTag: "TN-CBE-042",
          date: new Date().toISOString().slice(0, 10),
          morningLitres: 6.5,
          eveningLitres: 5.5,
          totalLitres: 12,
          sellingPricePerLitre: 42,
          revenueGeneratedRs: 504,
          createdAt: new Date().toISOString(),
        },
      ];
    } catch {
      return [];
    }
  }

  const db = getFirebaseDb();
  if (!db) return [];

  try {
    const q = query(collection(db, "milk_yield_logs"), where("ownerId", "==", ownerId));
    const snap = await getDocs(q);
    const results: MilkYieldLog[] = [];
    snap.forEach((d) => results.push(d.data() as MilkYieldLog));
    return results;
  } catch {
    return [];
  }
}

export function calculateMixedFarmingEconomics(
  cropNetProfit: number,
  milkLogs: MilkYieldLog[],
  feedExpenses: Expense[]
): {
  totalMilkLitres: number;
  totalMilkRevenueRs: number;
  totalFeedExpenseRs: number;
  livestockNetIncomeRs: number;
  combinedFarmNetProfitRs: number;
} {
  const totalMilkLitres = milkLogs.reduce((acc, l) => acc + (Number(l.totalLitres) || 0), 0);
  const totalMilkRevenueRs = milkLogs.reduce(
    (acc, l) => acc + (Number(l.revenueGeneratedRs) || (Number(l.totalLitres) * 40)),
    0
  );
  const totalFeedExpenseRs = feedExpenses.reduce((acc, e) => acc + (Number(e.amount) || 0), 0);
  const livestockNetIncomeRs = totalMilkRevenueRs - totalFeedExpenseRs;
  const combinedFarmNetProfitRs = cropNetProfit + livestockNetIncomeRs;

  return {
    totalMilkLitres,
    totalMilkRevenueRs,
    totalFeedExpenseRs,
    livestockNetIncomeRs,
    combinedFarmNetProfitRs,
  };
}
