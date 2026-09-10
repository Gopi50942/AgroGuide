import { createOwned, listOwned, updateOwned, removeOwned } from "@/lib/firebase/firestore";
import type { CropTask } from "@/types";

// ─────────────────────────────────────────────
// Real crop tasks, scoped to the signed-in farmer (ownerId = uid).
// No demo tasks here — an empty array means the farmer genuinely has
// no tasks yet.
// ─────────────────────────────────────────────

export async function listTasks(ownerId: string): Promise<CropTask[]> {
  return listOwned<CropTask>("crop_tasks", ownerId);
}

export async function addTask(ownerId: string, task: Omit<CropTask, "id" | "ownerId">): Promise<string> {
  return createOwned("crop_tasks", ownerId, task as unknown as Record<string, unknown>);
}

export async function updateTask(id: string, data: Partial<CropTask>): Promise<void> {
  return updateOwned("crop_tasks", id, data as Record<string, unknown>);
}

export async function removeTask(id: string): Promise<void> {
  return removeOwned("crop_tasks", id);
}
