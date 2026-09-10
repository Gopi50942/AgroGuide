import { createOwned, listOwned, removeOwned } from "@/lib/firebase/firestore";
import { uploadPublicImage } from "@/lib/services/fileStorage";
import type { DiaryEntry } from "@/types";

// ─────────────────────────────────────────────
// Real farm diary entries and growth photos
// Scoped to the signed-in farmer (ownerId = uid).
// ─────────────────────────────────────────────

export async function listDiaryEntries(ownerId: string): Promise<DiaryEntry[]> {
  const list = await listOwned<DiaryEntry>("farm_diary", ownerId);
  return list.sort((a, b) => (b.date || "").localeCompare(a.date || ""));
}

export async function addDiaryEntry(
  ownerId: string,
  entry: Omit<DiaryEntry, "id" | "ownerId">
): Promise<string> {
  return createOwned("farm_diary", ownerId, {
    ...entry,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  } as unknown as Record<string, unknown>);
}

export async function removeDiaryEntry(id: string): Promise<void> {
  return removeOwned("farm_diary", id);
}

/**
 * Upload diary photo using provider-neutral storage abstraction (Cloudinary/Local)
 */
export async function uploadDiaryPhoto(
  ownerId: string,
  file: File | Blob,
  isDemoMode: boolean = false
): Promise<string> {
  const fileName = `${Date.now()}_${Math.random().toString(36).substring(2, 8)}.jpg`;
  const res = await uploadPublicImage(
    file,
    fileName,
    {
      ownerId,
      folder: `agroguide/users/${ownerId}/diary`,
      classification: "public_low_sensitivity",
    },
    isDemoMode
  );

  if (res.success && res.url) {
    return res.url;
  }

  // If upload not configured, return local preview URL safely
  if (typeof window !== "undefined") {
    return URL.createObjectURL(file);
  }
  return "";
}
