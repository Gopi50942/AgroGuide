import { createOwned, listOwned, updateOwned, removeOwned } from "@/lib/firebase/firestore";
import type { FarmerLoan } from "@/types";

// ─────────────────────────────────────────────
// A farmer's own record of loans they've actually taken — private,
// scoped to ownerId. This is the farmer's personal bookkeeping, not
// connected to any bank's live loan-servicing system.
// ─────────────────────────────────────────────

export async function listFarmerLoans(ownerId: string): Promise<FarmerLoan[]> {
  return listOwned<FarmerLoan>("farmer_loans", ownerId);
}

export async function addFarmerLoan(ownerId: string, loan: Omit<FarmerLoan, "id" | "ownerId">): Promise<string> {
  return createOwned("farmer_loans", ownerId, loan as unknown as Record<string, unknown>);
}

export async function updateFarmerLoan(id: string, data: Partial<FarmerLoan>): Promise<void> {
  return updateOwned("farmer_loans", id, data as Record<string, unknown>);
}

export async function removeFarmerLoan(id: string): Promise<void> {
  return removeOwned("farmer_loans", id);
}
