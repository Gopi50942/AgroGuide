import { getFirebaseDb, isFirebaseConfigured } from "@/lib/firebase/config";
import { collection, doc, getDocs, setDoc, updateDoc, query, where } from "firebase/firestore";
import type { FarmInputInventoryItem, InputCategory } from "@/types";

// ─────────────────────────────────────────────
// Phase 73: Farm Input Inventory & Stock Tracker
// ─────────────────────────────────────────────

export async function addFarmInputItem(
  ownerId: string,
  itemName: string,
  category: InputCategory,
  quantityOnHand: number,
  unit: string,
  purchaseCostRs: number,
  reorderLevel: number = 5,
  options?: {
    purchaseDate?: string;
    expiryDate?: string;
    supplierName?: string;
    batchNumber?: string;
  },
  isDemoMode: boolean = false
): Promise<FarmInputInventoryItem> {
  const itemId = `inv_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
  const item: FarmInputInventoryItem = {
    id: itemId,
    ownerId,
    itemName,
    category,
    quantityOnHand,
    reorderLevel,
    unit,
    purchaseDate: options?.purchaseDate || new Date().toISOString().slice(0, 10),
    expiryDate: options?.expiryDate,
    purchaseCostRs,
    supplierName: options?.supplierName,
    batchNumber: options?.batchNumber,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  if (isDemoMode || !isFirebaseConfigured) {
    try {
      const key = `agroguide_demo_inventory_${ownerId}`;
      const existing: FarmInputInventoryItem[] = JSON.parse(localStorage.getItem(key) || "[]");
      existing.unshift(item);
      localStorage.setItem(key, JSON.stringify(existing));
    } catch {}
    return item;
  }

  const db = getFirebaseDb();
  if (db) {
    await setDoc(doc(db, "farm_input_inventory", itemId), item);
  }

  return item;
}

export function consumeInputStock(
  item: FarmInputInventoryItem,
  consumedQuantity: number
): {
  updatedItem: FarmInputInventoryItem;
  isLowStock: boolean;
} {
  const newQty = Math.max(0, item.quantityOnHand - consumedQuantity);
  const updatedItem: FarmInputInventoryItem = {
    ...item,
    quantityOnHand: newQty,
    updatedAt: new Date().toISOString(),
  };

  return {
    updatedItem,
    isLowStock: newQty <= item.reorderLevel,
  };
}

export async function listFarmInputInventory(
  ownerId: string,
  isDemoMode: boolean = false
): Promise<FarmInputInventoryItem[]> {
  if (isDemoMode || !isFirebaseConfigured) {
    try {
      const key = `agroguide_demo_inventory_${ownerId}`;
      const stored = localStorage.getItem(key);
      if (stored) return JSON.parse(stored);
      return [
        {
          id: "inv_demo_01",
          ownerId,
          itemName: "DAP Fertilizer (IFFCO)",
          category: "fertilizer",
          quantityOnHand: 4,
          reorderLevel: 5,
          unit: "50kg Bag",
          purchaseDate: "2026-05-10",
          purchaseCostRs: 5400,
          supplierName: "Primary Agricultural Coop Society",
          createdAt: "2026-05-10T00:00:00Z",
          updatedAt: "2026-05-10T00:00:00Z",
        },
        {
          id: "inv_demo_02",
          ownerId,
          itemName: "Neem Oil 10000 PPM",
          category: "bio_input",
          quantityOnHand: 8,
          reorderLevel: 2,
          unit: "1 Litre Bottle",
          purchaseDate: "2026-06-01",
          purchaseCostRs: 3200,
          supplierName: "Organic Agro Care",
          createdAt: "2026-06-01T00:00:00Z",
          updatedAt: "2026-06-01T00:00:00Z",
        },
      ];
    } catch {
      return [];
    }
  }

  const db = getFirebaseDb();
  if (!db) return [];

  try {
    const q = query(collection(db, "farm_input_inventory"), where("ownerId", "==", ownerId));
    const snap = await getDocs(q);
    const res: FarmInputInventoryItem[] = [];
    snap.forEach((d) => res.push(d.data() as FarmInputInventoryItem));
    return res;
  } catch {
    return [];
  }
}
