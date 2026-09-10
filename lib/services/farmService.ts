import { createOwned, listOwned, updateOwned, removeOwned } from "@/lib/firebase/firestore";
import type { Farm, Crop } from "@/types";

// ─────────────────────────────────────────────
// Real farm/crop data, scoped to the signed-in farmer (ownerId = uid).
// No demo/mock data lives here — an empty array means the farmer
// genuinely hasn't added anything yet, and callers should show an
// empty state rather than inventing a placeholder farm or crop.
// ─────────────────────────────────────────────

export async function listFarms(ownerId: string): Promise<Farm[]> {
  return listOwned<Farm>("farms", ownerId);
}

export async function addFarm(ownerId: string, farm: Omit<Farm, "id" | "ownerId">): Promise<string> {
  return createOwned("farms", ownerId, farm as unknown as Record<string, unknown>);
}

export async function updateFarm(id: string, data: Partial<Farm>): Promise<void> {
  return updateOwned("farms", id, data as Record<string, unknown>);
}

export async function removeFarm(id: string): Promise<void> {
  return removeOwned("farms", id);
}

export async function listCrops(ownerId: string): Promise<Crop[]> {
  return listOwned<Crop>("crops", ownerId);
}

export async function addCrop(ownerId: string, crop: Omit<Crop, "id" | "ownerId">): Promise<string> {
  return createOwned("crops", ownerId, crop as unknown as Record<string, unknown>);
}

export async function updateCrop(id: string, data: Partial<Crop>): Promise<void> {
  return updateOwned("crops", id, data as Record<string, unknown>);
}

export async function removeCrop(id: string): Promise<void> {
  return removeOwned("crops", id);
}
