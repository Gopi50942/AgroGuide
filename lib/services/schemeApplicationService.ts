import { createOwned, listOwned, updateOwned, removeOwned } from "@/lib/firebase/firestore";
import type { SchemeApplication } from "@/types";

// ─────────────────────────────────────────────
// Real farmer scheme application tracking ledger.
// ─────────────────────────────────────────────

export async function listSchemeApplications(ownerId: string): Promise<SchemeApplication[]> {
  const list = await listOwned<SchemeApplication>("scheme_applications", ownerId);
  return list.sort((a, b) => (b.appliedDate || b.createdAt || "").localeCompare(a.appliedDate || a.createdAt || ""));
}

export async function addSchemeApplication(
  ownerId: string,
  app: Omit<SchemeApplication, "id" | "ownerId">
): Promise<string> {
  return createOwned("scheme_applications", ownerId, {
    ...app,
    lastUpdatedDate: new Date().toISOString().slice(0, 10),
    updatedAt: new Date().toISOString(),
  } as unknown as Record<string, unknown>);
}

export async function updateSchemeApplication(id: string, data: Partial<SchemeApplication>): Promise<void> {
  return updateOwned("scheme_applications", id, {
    ...data,
    lastUpdatedDate: new Date().toISOString().slice(0, 10),
    updatedAt: new Date().toISOString(),
  } as Record<string, unknown>);
}

export async function removeSchemeApplication(id: string): Promise<void> {
  return removeOwned("scheme_applications", id);
}
