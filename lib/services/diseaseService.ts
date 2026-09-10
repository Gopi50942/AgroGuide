import { createOwned, listOwned, removeOwned } from "@/lib/firebase/firestore";
import type { DiseaseReport } from "@/types";

// ─────────────────────────────────────────────
// Real disease diagnostic report persistence,
// scoped to the signed-in farmer (ownerId = uid).
// ─────────────────────────────────────────────

export async function listDiseaseReports(ownerId: string): Promise<DiseaseReport[]> {
  const list = await listOwned<DiseaseReport>("disease_reports", ownerId);
  return list.sort((a, b) => {
    const dateA = a.scanDate || a.createdAt || "";
    const dateB = b.scanDate || b.createdAt || "";
    return dateB.localeCompare(dateA);
  });
}

export async function addDiseaseReport(
  ownerId: string,
  report: Omit<DiseaseReport, "id" | "ownerId">
): Promise<string> {
  return createOwned("disease_reports", ownerId, {
    ...report,
    updatedAt: new Date().toISOString(),
  } as unknown as Record<string, unknown>);
}

export async function removeDiseaseReport(id: string): Promise<void> {
  return removeOwned("disease_reports", id);
}
