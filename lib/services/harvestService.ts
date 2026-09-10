import { createOwned, listOwned, updateOwned, removeOwned } from "@/lib/firebase/firestore";
import type { HarvestRecord } from "@/types";

// ─────────────────────────────────────────────
// Real harvest yield records, scoped to the signed-in farmer.
// ─────────────────────────────────────────────

export async function listHarvestRecords(ownerId: string): Promise<HarvestRecord[]> {
  const list = await listOwned<HarvestRecord>("harvest_records", ownerId);
  return list.sort((a, b) => (b.harvestDate || b.createdAt || "").localeCompare(a.harvestDate || a.createdAt || ""));
}

export async function addHarvestRecord(
  ownerId: string,
  record: Omit<HarvestRecord, "id" | "ownerId">
): Promise<string> {
  return createOwned("harvest_records", ownerId, {
    ...record,
    updatedAt: new Date().toISOString(),
  } as unknown as Record<string, unknown>);
}

export async function updateHarvestRecord(id: string, data: Partial<HarvestRecord>): Promise<void> {
  return updateOwned("harvest_records", id, {
    ...data,
    updatedAt: new Date().toISOString(),
  } as Record<string, unknown>);
}

export async function removeHarvestRecord(id: string): Promise<void> {
  return removeOwned("harvest_records", id);
}

/** Converts any quantity to kilograms for consistent internal aggregations. */
export function normalizeQuantityToKg(quantity: number, unit: HarvestRecord["quantityUnit"]): number {
  if (unit === "tonne") return quantity * 1000;
  if (unit === "quintal") return quantity * 100;
  return quantity;
}
