import { createOwned, listOwned, updateOwned, removeOwned } from "@/lib/firebase/firestore";
import type { ProduceSale, Expense, HarvestRecord } from "@/types";
import { normalizeQuantityToKg } from "./harvestService";

// ─────────────────────────────────────────────
// Real produce sales ledger and per-crop profitability engine.
// ─────────────────────────────────────────────

export function calculateSaleAmounts(params: {
  quantity: number;
  ratePerUnit: number;
  transportCost?: number;
  commissionCost?: number;
  otherSellingCost?: number;
}): { grossAmount: number; netRealization: number } {
  const gross = Math.max(0, params.quantity * params.ratePerUnit);
  const deductions =
    Math.max(0, params.transportCost ?? 0) +
    Math.max(0, params.commissionCost ?? 0) +
    Math.max(0, params.otherSellingCost ?? 0);
  const net = Math.max(0, gross - deductions);
  return { grossAmount: gross, netRealization: net };
}

export async function listProduceSales(ownerId: string): Promise<ProduceSale[]> {
  const list = await listOwned<ProduceSale>("produce_sales", ownerId);
  return list.sort((a, b) => (b.saleDate || b.createdAt || "").localeCompare(a.saleDate || a.createdAt || ""));
}

export async function addProduceSale(
  ownerId: string,
  sale: Omit<ProduceSale, "id" | "ownerId">
): Promise<string> {
  const { grossAmount, netRealization } = calculateSaleAmounts(sale);
  return createOwned("produce_sales", ownerId, {
    ...sale,
    grossAmount,
    netRealization,
    updatedAt: new Date().toISOString(),
  } as unknown as Record<string, unknown>);
}

export async function updateProduceSale(id: string, data: Partial<ProduceSale>): Promise<void> {
  let computed: Partial<ProduceSale> = { ...data };
  if (data.quantity !== undefined && data.ratePerUnit !== undefined) {
    const { grossAmount, netRealization } = calculateSaleAmounts({
      quantity: data.quantity,
      ratePerUnit: data.ratePerUnit,
      transportCost: data.transportCost,
      commissionCost: data.commissionCost,
      otherSellingCost: data.otherSellingCost,
    });
    computed = { ...computed, grossAmount, netRealization };
  }
  return updateOwned("produce_sales", id, {
    ...computed,
    updatedAt: new Date().toISOString(),
  } as Record<string, unknown>);
}

export async function removeProduceSale(id: string): Promise<void> {
  return removeOwned("produce_sales", id);
}

// ── Crop Profitability Analysis ──────────────────────────

export interface CropProfitability {
  cropId: string;
  cropName: string;
  areaAcres: number;
  totalExpenses: number;
  totalHarvestKg: number;
  grossSales: number;
  totalSellingCosts: number;
  netRealization: number;
  netProfit: number;
  profitPerAcre: number;
  roiPercent: number;
}

export function computeCropProfitability(params: {
  cropId: string;
  cropName: string;
  areaAcres: number;
  expenses: Expense[];
  sales: ProduceSale[];
  harvests: HarvestRecord[];
}): CropProfitability {
  const { cropId, cropName, areaAcres, expenses, sales, harvests } = params;

  const cropExpenses = expenses.filter((e) => !e.cropId || e.cropId === cropId);
  const cropSales = sales.filter((s) => s.cropId === cropId);
  const cropHarvests = harvests.filter((h) => h.cropId === cropId);

  const totalExpenses = cropExpenses.reduce((sum, e) => sum + (e.amount || 0), 0);
  const totalHarvestKg = cropHarvests.reduce(
    (sum, h) => sum + normalizeQuantityToKg(h.quantity || 0, h.quantityUnit),
    0
  );

  const grossSales = cropSales.reduce((sum, s) => sum + (s.grossAmount || 0), 0);
  const totalSellingCosts = cropSales.reduce(
    (sum, s) =>
      sum +
      ((s.transportCost || 0) + (s.commissionCost || 0) + (s.otherSellingCost || 0)),
    0
  );
  const netRealization = cropSales.reduce((sum, s) => sum + (s.netRealization || 0), 0);

  const netProfit = netRealization - totalExpenses;
  const profitPerAcre = areaAcres > 0 ? netProfit / areaAcres : netProfit;
  const roiPercent =
    totalExpenses > 0 ? (netProfit / totalExpenses) * 100 : netProfit > 0 ? 100 : 0;

  return {
    cropId,
    cropName,
    areaAcres,
    totalExpenses,
    totalHarvestKg,
    grossSales,
    totalSellingCosts,
    netRealization,
    netProfit,
    profitPerAcre,
    roiPercent,
  };
}
