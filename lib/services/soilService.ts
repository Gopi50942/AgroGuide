import { createOwned, listOwned, updateOwned, removeOwned } from "@/lib/firebase/firestore";
import type { SoilReport } from "@/types";

// ─────────────────────────────────────────────
// Real soil report data, scoped to the signed-in farmer (ownerId = uid).
// Persisted in the `soil_reports` Firestore collection.
// ─────────────────────────────────────────────

export async function listSoilReports(ownerId: string): Promise<SoilReport[]> {
  const reports = await listOwned<SoilReport>("soil_reports", ownerId);
  return reports.sort((a, b) => {
    const dateA = a.sampleDate || a.createdAt || "";
    const dateB = b.sampleDate || b.createdAt || "";
    return dateB.localeCompare(dateA);
  });
}

export async function addSoilReport(
  ownerId: string,
  report: Omit<SoilReport, "id" | "ownerId">
): Promise<string> {
  return createOwned("soil_reports", ownerId, {
    ...report,
    updatedAt: new Date().toISOString(),
  } as unknown as Record<string, unknown>);
}

export async function updateSoilReport(id: string, data: Partial<SoilReport>): Promise<void> {
  return updateOwned("soil_reports", id, {
    ...data,
    updatedAt: new Date().toISOString(),
  } as Record<string, unknown>);
}

export async function removeSoilReport(id: string): Promise<void> {
  return removeOwned("soil_reports", id);
}

/**
 * Agronomic guidance summary based on standard agricultural thresholds.
 * Returns translation keys that callers can resolve using t(key).
 */
export function getSoilGuidanceKeys(params: {
  ph?: number;
  nitrogen?: number;
  organicCarbon?: number;
}): string[] {
  const notes: string[] = [];
  const { ph, nitrogen, organicCarbon } = params;

  if (ph !== undefined && !isNaN(ph)) {
    if (ph < 6.0) notes.push("soil.acidic");
    else if (ph > 7.5) notes.push("soil.alkaline");
    else notes.push("soil.favorable");
  }

  if (nitrogen !== undefined && !isNaN(nitrogen) && nitrogen < 280) {
    notes.push("soil.lowN");
  }

  if (organicCarbon !== undefined && !isNaN(organicCarbon) && organicCarbon < 0.5) {
    notes.push("soil.lowOc");
  }

  return notes;
}
