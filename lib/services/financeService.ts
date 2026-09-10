import { createOwned, listOwned, updateOwned, removeOwned } from "@/lib/firebase/firestore";
import type { Expense, Revenue } from "@/types";

// ─────────────────────────────────────────────
// Real expense/revenue records, scoped to the signed-in farmer
// (ownerId = uid). No demo figures here — an empty array means the
// farmer genuinely hasn't logged anything yet; the UI should show
// "Add your first expense" rather than any placeholder ₹ value.
// ─────────────────────────────────────────────

export async function listExpenses(ownerId: string): Promise<Expense[]> {
  return listOwned<Expense>("expenses", ownerId);
}

export async function addExpense(ownerId: string, expense: Omit<Expense, "id" | "ownerId">): Promise<string> {
  return createOwned("expenses", ownerId, expense as unknown as Record<string, unknown>);
}

export async function updateExpense(id: string, data: Partial<Expense>): Promise<void> {
  return updateOwned("expenses", id, data as Record<string, unknown>);
}

export async function removeExpense(id: string): Promise<void> {
  return removeOwned("expenses", id);
}

export async function listRevenue(ownerId: string): Promise<Revenue[]> {
  return listOwned<Revenue>("revenues", ownerId);
}

export async function addRevenue(ownerId: string, revenue: Omit<Revenue, "id" | "ownerId">): Promise<string> {
  return createOwned("revenues", ownerId, revenue as unknown as Record<string, unknown>);
}

export async function updateRevenue(id: string, data: Partial<Revenue>): Promise<void> {
  return updateOwned("revenues", id, data as Record<string, unknown>);
}

export async function removeRevenue(id: string): Promise<void> {
  return removeOwned("revenues", id);
}
