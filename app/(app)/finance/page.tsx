"use client";

import { useEffect, useMemo, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import {
  Plus,
  Wallet,
  Landmark,
  TrendingUp,
  ShoppingBag,
  Trash2,
  Edit2,
  Calendar,
  Layers,
  ChevronRight,
} from "lucide-react";
import { DEMO_EXPENSES, DEMO_REVENUE, DEMO_CROPS } from "@/data/demoData";
import { useAuth } from "@/hooks/useAuth";
import { useLanguage } from "@/hooks/useLanguage";
import { useToast } from "@/components/ui/Toast";
import { listExpenses, listRevenue, addExpense as addExpenseFs } from "@/lib/services/financeService";
import { listCrops } from "@/lib/services/farmService";
import { listHarvestRecords } from "@/lib/services/harvestService";
import {
  listProduceSales,
  addProduceSale,
  updateProduceSale,
  removeProduceSale,
  calculateSaleAmounts,
  computeCropProfitability,
} from "@/lib/services/produceSalesService";
import { SectionHeading, EmptyState, StatCard as SharedStatCard } from "@/components/ui/Primitives";
import { LoansPanel } from "@/components/finance/LoansPanel";
import type {
  Expense,
  Revenue,
  ProduceSale,
  Crop,
  HarvestRecord,
  BuyerType,
  PaymentStatus,
  QuantityUnit,
} from "@/types";

const CATEGORY_COLORS: Record<Expense["category"], string> = {
  seeds: "#5C8A44",
  fertilizer: "#7FA85F",
  labour: "#C68F2A",
  pesticides: "#C1592F",
  irrigation: "#3F6B2E",
  electricity: "#D99B5C",
  equipment: "#8F5424",
  transport: "#A6C48A",
  storage: "#B06A2C",
  other: "#6E401C",
};

export default function FinancePage() {
  const { profile, isDemoMode } = useAuth();
  const { t } = useLanguage();
  const { showToast } = useToast();

  const [tab, setTab] = useState<"expenses" | "sales" | "profitability" | "loans">("expenses");
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [sales, setSales] = useState<ProduceSale[]>([]);
  const [harvests, setHarvests] = useState<HarvestRecord[]>([]);
  const [crops, setCrops] = useState<Crop[]>([]);
  const [loading, setLoading] = useState(true);

  // Forms
  const [showAddExpense, setShowAddExpense] = useState(false);
  const [showAddSale, setShowAddSale] = useState(false);
  const [editingSale, setEditingSale] = useState<ProduceSale | null>(null);

  // Selected crop for profitability tab
  const [selectedCropId, setSelectedCropId] = useState<string>("");

  async function refresh() {
    if (!profile) return;
    if (isDemoMode) {
      setExpenses(DEMO_EXPENSES);
      setSales([]);
      setHarvests([]);
      setCrops(DEMO_CROPS);
      setSelectedCropId(DEMO_CROPS[0]?.id ?? "");
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const [e, s, h, c] = await Promise.all([
        listExpenses(profile.uid),
        listProduceSales(profile.uid),
        listHarvestRecords(profile.uid),
        listCrops(profile.uid),
      ]);
      setExpenses(e);
      setSales(s);
      setHarvests(h);
      setCrops(c);
      if (c.length > 0 && !selectedCropId) {
        setSelectedCropId(c[0].id);
      }
    } catch {
      showToast(t("common.error"), "warning");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profile?.uid, isDemoMode]);

  const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);
  const totalSalesGross = sales.reduce((sum, s) => sum + (s.grossAmount || 0), 0);
  const totalSalesNet = sales.reduce((sum, s) => sum + (s.netRealization || 0), 0);
  const netProfit = totalSalesNet - totalExpenses;

  const byCategory = useMemo(() => {
    const map = new Map<string, number>();
    expenses.forEach((e) => map.set(e.category, (map.get(e.category) ?? 0) + e.amount));
    return Array.from(map.entries()).map(([category, amount]) => ({ category, amount }));
  }, [expenses]);

  async function handleDeleteSale(saleId: string) {
    if (!confirm(t("sales.deleteConfirm"))) return;
    if (isDemoMode) {
      setSales((prev) => prev.filter((s) => s.id !== saleId));
      showToast(t("sales.deleted"), "success");
      return;
    }
    try {
      await removeProduceSale(saleId);
      showToast(t("sales.deleted"), "success");
      refresh();
    } catch {
      showToast(t("common.error"), "warning");
    }
  }

  const activeCrop = crops.find((c) => c.id === selectedCropId) || crops[0];
  const cropProfitability = activeCrop
    ? computeCropProfitability({
        cropId: activeCrop.id,
        cropName: activeCrop.name,
        areaAcres: activeCrop.areaAcres || 1,
        expenses,
        sales,
        harvests,
      })
    : null;

  return (
    <div className="space-y-8 animate-fade-up">
      <SectionHeading eyebrow={t("nav.finance")} title={t("finance.title")} />

      {/* ── Sub-Navigation Tabs ── */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        <button
          onClick={() => setTab("expenses")}
          className={`px-4 py-2 rounded-full text-xs sm:text-sm font-semibold border flex items-center gap-1.5 shrink-0 ${
            tab === "expenses"
              ? "bg-forest-600 text-cream-50 border-forest-600 shadow-sm"
              : "border-forest-100 text-ink-light bg-cream-50"
          }`}
        >
          <Wallet size={14} /> {t("finance.expensesTab")}
        </button>
        <button
          onClick={() => setTab("sales")}
          className={`px-4 py-2 rounded-full text-xs sm:text-sm font-semibold border flex items-center gap-1.5 shrink-0 ${
            tab === "sales"
              ? "bg-forest-600 text-cream-50 border-forest-600 shadow-sm"
              : "border-forest-100 text-ink-light bg-cream-50"
          }`}
        >
          <ShoppingBag size={14} /> {t("sales.title")}
        </button>
        <button
          onClick={() => setTab("profitability")}
          className={`px-4 py-2 rounded-full text-xs sm:text-sm font-semibold border flex items-center gap-1.5 shrink-0 ${
            tab === "profitability"
              ? "bg-forest-600 text-cream-50 border-forest-600 shadow-sm"
              : "border-forest-100 text-ink-light bg-cream-50"
          }`}
        >
          <TrendingUp size={14} /> {t("profitability.title")}
        </button>
        <button
          onClick={() => setTab("loans")}
          className={`px-4 py-2 rounded-full text-xs sm:text-sm font-semibold border flex items-center gap-1.5 shrink-0 ${
            tab === "loans"
              ? "bg-forest-600 text-cream-50 border-forest-600 shadow-sm"
              : "border-forest-100 text-ink-light bg-cream-50"
          }`}
        >
          <Landmark size={14} /> {t("finance.loansTab")}
        </button>
      </div>

      {/* ── TAB: EXPENSES ── */}
      {tab === "expenses" && (
        <div className="space-y-6 animate-fade-up">
          <div className="flex justify-end -mt-2">
            <button onClick={() => setShowAddExpense((v) => !v)} className="btn-secondary text-sm">
              <Plus size={15} /> {t("finance.addExpense")}
            </button>
          </div>

          {showAddExpense && (
            <AddExpenseForm
              crops={crops}
              onCancel={() => setShowAddExpense(false)}
              onSaved={() => {
                setShowAddExpense(false);
                refresh();
              }}
            />
          )}

          {loading ? (
            <div className="skeleton h-40" />
          ) : expenses.length === 0 && !showAddExpense ? (
            <EmptyState
              icon={Wallet}
              title={t("finance.noDataTitle")}
              message={t("finance.noDataMessage")}
              action={
                <button onClick={() => setShowAddExpense(true)} className="btn-primary text-sm">
                  <Plus size={15} /> {t("finance.addExpense")}
                </button>
              }
            />
          ) : (
            <>
              <div className="grid sm:grid-cols-3 gap-4">
                <StatCard label={t("sales.gross")} value={totalSalesGross} tone="forest" />
                <StatCard label={t("finance.totalExpenses")} value={totalExpenses} tone="rust" />
                <StatCard
                  label={t("finance.netProfit")}
                  value={netProfit}
                  tone={netProfit >= 0 ? "forest" : "rust"}
                />
              </div>

              {byCategory.length > 0 && (
                <div className="grid lg:grid-cols-2 gap-5">
                  <div className="card p-5">
                    <p className="font-display font-semibold mb-4">{t("finance.byCategory")}</p>
                    <ResponsiveContainer width="100%" height={260}>
                      <PieChart>
                        <Pie
                          data={byCategory}
                          dataKey="amount"
                          nameKey="category"
                          innerRadius={55}
                          outerRadius={90}
                          paddingAngle={2}
                        >
                          {byCategory.map((entry) => (
                            <Cell
                              key={entry.category}
                              fill={CATEGORY_COLORS[entry.category as Expense["category"]]}
                            />
                          ))}
                        </Pie>
                        <Tooltip formatter={(v: number) => `₹${v.toLocaleString("en-IN")}`} />
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="flex flex-wrap gap-2 mt-2 justify-center">
                      {byCategory.map((c) => (
                        <span key={c.category} className="text-xs flex items-center gap-1.5">
                          <span
                            className="w-2.5 h-2.5 rounded-full inline-block"
                            style={{ background: CATEGORY_COLORS[c.category as Expense["category"]] }}
                          />
                          <span className="capitalize">{c.category}</span>
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="card p-5">
                    <p className="font-display font-semibold mb-4">{t("finance.trend")}</p>
                    <ResponsiveContainer width="100%" height={260}>
                      <BarChart data={expenses.map((e) => ({ date: e.date.slice(5), amount: e.amount }))}>
                        <XAxis dataKey="date" tick={{ fontSize: 11 }} stroke="#8a9280" />
                        <YAxis tick={{ fontSize: 11 }} stroke="#8a9280" />
                        <Tooltip formatter={(v: number) => `₹${v.toLocaleString("en-IN")}`} />
                        <Bar dataKey="amount" fill="#3F6B2E" radius={[6, 6, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              )}

              {expenses.length > 0 && (
                <div>
                  <SectionHeading title={t("finance.recentExpenses")} />
                  <div className="card divide-y divide-forest-100">
                    {expenses.map((e) => (
                      <div key={e.id} className="flex items-center justify-between px-5 py-3 text-sm">
                        <div className="flex items-center gap-3">
                          <span
                            className="w-2.5 h-2.5 rounded-full shrink-0"
                            style={{ background: CATEGORY_COLORS[e.category] }}
                          />
                          <div>
                            <p className="font-semibold capitalize">{e.category}</p>
                            {e.note && <p className="text-xs text-ink-light">{e.note}</p>}
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold">₹{e.amount.toLocaleString("en-IN")}</p>
                          <p className="text-xs text-ink-light">{e.date}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* ── TAB: PRODUCE SALES (Phase 4) ── */}
      {tab === "sales" && (
        <div className="space-y-6 animate-fade-up">
          <div className="flex justify-between items-center -mt-2">
            <p className="text-sm font-semibold text-ink-light">{t("sales.title")}</p>
            {crops.length > 0 && (
              <button
                onClick={() => {
                  setEditingSale(null);
                  setShowAddSale((v) => !v);
                }}
                className="btn-secondary text-sm"
              >
                <Plus size={15} /> {t("sales.addSale")}
              </button>
            )}
          </div>

          {(showAddSale || editingSale) && (
            <SaleForm
              crops={crops}
              sale={editingSale}
              onCancel={() => {
                setShowAddSale(false);
                setEditingSale(null);
              }}
              onSaved={() => {
                setShowAddSale(false);
                setEditingSale(null);
                refresh();
              }}
            />
          )}

          {sales.length === 0 && !showAddSale && !editingSale ? (
            <EmptyState
              icon={ShoppingBag}
              title={t("sales.noSalesTitle")}
              message={t("sales.noSalesMessage")}
              action={
                crops.length > 0 ? (
                  <button onClick={() => setShowAddSale(true)} className="btn-primary text-sm">
                    <Plus size={15} /> {t("sales.addSale")}
                  </button>
                ) : undefined
              }
            />
          ) : (
            <div className="space-y-3">
              {sales.map((s) => (
                <div key={s.id} className="card p-4 sm:p-5">
                  <div className="flex items-start justify-between gap-3 flex-wrap">
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-display font-semibold text-base text-forest-900">{s.cropName}</p>
                        <span className="chip font-semibold text-xs">
                          {s.quantity} {s.quantityUnit} @ ₹{s.ratePerUnit}/{s.quantityUnit}
                        </span>
                        <span
                          className={`chip text-xs font-semibold ${
                            s.paymentStatus === "paid"
                              ? "bg-forest-100 text-forest-800"
                              : s.paymentStatus === "partially_paid"
                              ? "bg-wheat-100 text-wheat-800"
                              : "bg-rust-50 text-rust-700"
                          }`}
                        >
                          {(t as any)(`sales.status.${s.paymentStatus}`) || s.paymentStatus}
                        </span>
                      </div>
                      <p className="text-xs text-ink-light flex items-center gap-2 mt-1.5 flex-wrap">
                        <span className="flex items-center gap-1">
                          <Calendar size={12} /> {s.saleDate}
                        </span>
                        {s.buyerName && (
                          <span>
                            · {s.buyerName} ({(t as any)(`sales.buyer.${s.buyerType}`) || s.buyerType})
                          </span>
                        )}
                        {s.marketName && <span>· {s.marketName}</span>}
                      </p>
                    </div>

                    <div className="text-right">
                      <p className="text-xs text-ink-light">{t("sales.net")}</p>
                      <p className="font-display text-lg font-bold text-forest-700">
                        ₹{s.netRealization.toLocaleString("en-IN")}
                      </p>
                      <p className="text-[11px] text-ink-light">
                        Gross: ₹{s.grossAmount.toLocaleString("en-IN")}
                      </p>
                    </div>
                  </div>

                  <div className="mt-3 pt-3 border-t border-forest-100 flex items-center justify-between text-xs text-ink-light flex-wrap gap-2">
                    <div className="flex gap-3">
                      <span>
                        Transport: ₹{(s.transportCost || 0).toLocaleString("en-IN")}
                      </span>
                      <span>
                        Commission: ₹{(s.commissionCost || 0).toLocaleString("en-IN")}
                      </span>
                      <span>
                        Other: ₹{(s.otherSellingCost || 0).toLocaleString("en-IN")}
                      </span>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => {
                          setEditingSale(s);
                          setShowAddSale(true);
                        }}
                        className="p-1 rounded hover:text-forest-700"
                        title={t("sales.editSale")}
                      >
                        <Edit2 size={13} />
                      </button>
                      <button
                        onClick={() => handleDeleteSale(s.id)}
                        className="p-1 rounded hover:text-rust-500"
                        title={t("sales.deleted")}
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── TAB: CROP PROFITABILITY (Phase 5) ── */}
      {tab === "profitability" && (
        <div className="space-y-6 animate-fade-up">
          {crops.length === 0 ? (
            <EmptyState
              icon={TrendingUp}
              title={t("farm.noCropsTitle")}
              message={t("farm.noCropsMessage")}
            />
          ) : (
            <>
              {/* Crop Selector Header */}
              <div className="card p-4 flex items-center justify-between gap-4 flex-wrap bg-forest-50/50">
                <div className="flex items-center gap-2">
                  <label className="text-sm font-semibold text-forest-900">
                    {t("profitability.selectCrop")}:
                  </label>
                  <select
                    value={selectedCropId}
                    onChange={(e) => setSelectedCropId(e.target.value)}
                    className="input-field py-1 text-sm bg-cream-50 font-semibold"
                  >
                    {crops.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name} {c.variety ? `(${c.variety})` : ""} — {c.areaAcres} acres
                      </option>
                    ))}
                  </select>
                </div>
                {activeCrop && (
                  <span className="chip bg-forest-100 text-forest-800 font-semibold text-xs">
                    {activeCrop.areaAcres} {t("farm.acres")}
                  </span>
                )}
              </div>

              {cropProfitability && (
                <div className="card p-6 space-y-6">
                  <div className="flex items-center justify-between border-b border-forest-100 pb-4 flex-wrap gap-2">
                    <div>
                      <p className="text-xs uppercase tracking-wider font-semibold text-ink-light">
                        {t("profitability.title")}
                      </p>
                      <p className="font-display text-2xl font-bold text-forest-900 mt-0.5">
                        {cropProfitability.cropName}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-ink-light">{t("profitability.roi")}</p>
                      <p
                        className={`font-display text-2xl font-bold ${
                          cropProfitability.roiPercent >= 0 ? "text-forest-700" : "text-rust-600"
                        }`}
                      >
                        {cropProfitability.roiPercent > 0 ? "+" : ""}
                        {cropProfitability.roiPercent.toFixed(1)}%
                      </p>
                    </div>
                  </div>

                  {/* Financial Breakdown Table / Grid */}
                  <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="p-3.5 bg-cream-100 rounded-xl">
                      <p className="text-xs text-ink-light">{t("profitability.cultivationCost")}</p>
                      <p className="font-display text-lg font-bold text-ink mt-1">
                        ₹{cropProfitability.totalExpenses.toLocaleString("en-IN")}
                      </p>
                    </div>

                    <div className="p-3.5 bg-cream-100 rounded-xl">
                      <p className="text-xs text-ink-light">{t("profitability.harvestYield")}</p>
                      <p className="font-display text-lg font-bold text-ink mt-1">
                        {cropProfitability.totalHarvestKg.toLocaleString("en-IN")} kg
                      </p>
                    </div>

                    <div className="p-3.5 bg-cream-100 rounded-xl">
                      <p className="text-xs text-ink-light">{t("profitability.grossRevenue")}</p>
                      <p className="font-display text-lg font-bold text-forest-700 mt-1">
                        ₹{cropProfitability.grossSales.toLocaleString("en-IN")}
                      </p>
                    </div>

                    <div className="p-3.5 bg-cream-100 rounded-xl">
                      <p className="text-xs text-ink-light">{t("profitability.sellingCosts")}</p>
                      <p className="font-display text-lg font-bold text-rust-600 mt-1">
                        -₹{cropProfitability.totalSellingCosts.toLocaleString("en-IN")}
                      </p>
                    </div>
                  </div>

                  {/* Net Profit Summary Banner */}
                  <div
                    className={`p-5 rounded-2xl border flex items-center justify-between flex-wrap gap-4 ${
                      cropProfitability.netProfit >= 0
                        ? "bg-forest-50 border-forest-200"
                        : "bg-rust-50 border-rust-200"
                    }`}
                  >
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wider text-ink-light">
                        {cropProfitability.netProfit >= 0
                          ? t("profitability.netProfit")
                          : t("profitability.loss")}
                      </p>
                      <p
                        className={`font-display text-3xl font-extrabold mt-1 ${
                          cropProfitability.netProfit >= 0 ? "text-forest-800" : "text-rust-700"
                        }`}
                      >
                        {cropProfitability.netProfit >= 0 ? "₹" : "-₹"}
                        {Math.abs(cropProfitability.netProfit).toLocaleString("en-IN")}
                      </p>
                    </div>

                    <div className="text-right">
                      <p className="text-xs text-ink-light font-semibold">
                        {t("profitability.profitPerAcre")}
                      </p>
                      <p className="font-display text-xl font-bold text-forest-700 mt-1">
                        ₹{Math.round(cropProfitability.profitPerAcre).toLocaleString("en-IN")} / acre
                      </p>
                    </div>
                  </div>

                  {cropProfitability.totalExpenses === 0 && cropProfitability.grossSales === 0 && (
                    <p className="text-xs text-ink-light italic text-center">
                      {t("profitability.noData")}
                    </p>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* ── TAB: LOANS & CREDIT ── */}
      {tab === "loans" && <LoansPanel />}
    </div>
  );
}

function AddExpenseForm({
  crops,
  onCancel,
  onSaved,
}: {
  crops: Crop[];
  onCancel: () => void;
  onSaved: () => void;
}) {
  const { profile } = useAuth();
  const { t } = useLanguage();
  const { showToast } = useToast();
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<{
    cropId: string;
    category: Expense["category"];
    amount: string;
    date: string;
    note: string;
  }>({
    cropId: crops[0]?.id ?? "",
    category: "seeds",
    amount: "",
    date: new Date().toISOString().slice(0, 10),
    note: "",
  });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!profile || !form.amount) return;
    setSaving(true);
    try {
      await addExpenseFs(profile.uid, {
        cropId: form.cropId || undefined,
        category: form.category,
        amount: Number(form.amount) || 0,
        date: form.date,
        note: form.note.trim() || undefined,
      });
      showToast(t("finance.expenseSaved"), "success");
      onSaved();
    } catch {
      showToast(t("common.error"), "warning");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="card p-5 grid sm:grid-cols-2 gap-3">
      {crops.length > 0 && (
        <select
          value={form.cropId}
          onChange={(e) => setForm((p) => ({ ...p, cropId: e.target.value }))}
          className="input-field"
        >
          <option value="">General Farm Expense</option>
          {crops.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name} {c.variety ? `(${c.variety})` : ""}
            </option>
          ))}
        </select>
      )}

      <select
        value={form.category}
        onChange={(e) => setForm((p) => ({ ...p, category: e.target.value as Expense["category"] }))}
        className="input-field"
      >
        {Object.keys(CATEGORY_COLORS).map((c) => (
          <option key={c} value={c}>
            {(t as any)(`finance.cat.${c}`) || c}
          </option>
        ))}
      </select>

      <input
        required
        type="number"
        min={0}
        placeholder={t("finance.amount")}
        value={form.amount}
        onChange={(e) => setForm((p) => ({ ...p, amount: e.target.value }))}
        className="input-field"
      />
      <input
        type="date"
        value={form.date}
        onChange={(e) => setForm((p) => ({ ...p, date: e.target.value }))}
        className="input-field"
      />
      <input
        placeholder={t("finance.note")}
        value={form.note}
        onChange={(e) => setForm((p) => ({ ...p, note: e.target.value }))}
        className="input-field sm:col-span-2"
      />
      <div className="sm:col-span-2 flex gap-2">
        <button type="submit" disabled={saving} className="btn-primary text-sm">
          {t("common.save")}
        </button>
        <button type="button" onClick={onCancel} className="btn-secondary text-sm">
          {t("common.cancel")}
        </button>
      </div>
    </form>
  );
}

function SaleForm({
  crops,
  sale,
  onCancel,
  onSaved,
}: {
  crops: Crop[];
  sale?: ProduceSale | null;
  onCancel: () => void;
  onSaved: () => void;
}) {
  const { profile } = useAuth();
  const { t } = useLanguage();
  const { showToast } = useToast();
  const [saving, setSaving] = useState(false);

  const initialCrop = crops.find((c) => c.id === sale?.cropId) || crops[0];

  const [form, setForm] = useState({
    cropId: initialCrop?.id ?? "",
    saleDate: sale?.saleDate ?? new Date().toISOString().slice(0, 10),
    buyerName: sale?.buyerName ?? "",
    buyerType: (sale?.buyerType ?? "mandi") as BuyerType,
    marketName: sale?.marketName ?? "",
    quantity: String(sale?.quantity ?? ""),
    quantityUnit: (sale?.quantityUnit ?? "kg") as QuantityUnit,
    ratePerUnit: String(sale?.ratePerUnit ?? ""),
    transportCost: String(sale?.transportCost ?? "0"),
    commissionCost: String(sale?.commissionCost ?? "0"),
    otherSellingCost: String(sale?.otherSellingCost ?? "0"),
    paymentStatus: (sale?.paymentStatus ?? "paid") as PaymentStatus,
    notes: sale?.notes ?? "",
  });

  const qty = Number(form.quantity) || 0;
  const rate = Number(form.ratePerUnit) || 0;
  const trans = Number(form.transportCost) || 0;
  const comm = Number(form.commissionCost) || 0;
  const other = Number(form.otherSellingCost) || 0;

  const { grossAmount, netRealization } = calculateSaleAmounts({
    quantity: qty,
    ratePerUnit: rate,
    transportCost: trans,
    commissionCost: comm,
    otherSellingCost: other,
  });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!profile || !form.cropId || !qty || !rate) return;

    const selectedCrop = crops.find((c) => c.id === form.cropId);
    if (!selectedCrop) return;

    setSaving(true);
    const payload: Omit<ProduceSale, "id" | "ownerId"> = {
      cropId: form.cropId,
      cropName: selectedCrop.name,
      farmId: selectedCrop.farmId,
      saleDate: form.saleDate,
      buyerName: form.buyerName.trim() || undefined,
      buyerType: form.buyerType,
      marketName: form.marketName.trim() || undefined,
      quantity: qty,
      quantityUnit: form.quantityUnit,
      ratePerUnit: rate,
      grossAmount,
      transportCost: trans,
      commissionCost: comm,
      otherSellingCost: other,
      netRealization,
      paymentStatus: form.paymentStatus,
      notes: form.notes.trim() || undefined,
    };

    try {
      if (sale) {
        await updateProduceSale(sale.id, payload);
        showToast(t("sales.updated"), "success");
      } else {
        await addProduceSale(profile.uid, payload);
        showToast(t("sales.saved"), "success");
      }
      onSaved();
    } catch {
      showToast(t("common.error"), "warning");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="card p-5 mb-4 grid sm:grid-cols-2 gap-3">
      <div>
        <label className="label-field">{t("profitability.selectCrop")}</label>
        <select
          value={form.cropId}
          onChange={(e) => setForm((p) => ({ ...p, cropId: e.target.value }))}
          className="input-field"
          required
        >
          {crops.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name} {c.variety ? `(${c.variety})` : ""}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="label-field">{t("sales.date")}</label>
        <input
          required
          type="date"
          value={form.saleDate}
          onChange={(e) => setForm((p) => ({ ...p, saleDate: e.target.value }))}
          className="input-field"
        />
      </div>

      <div>
        <label className="label-field">{t("sales.quantity")}</label>
        <input
          required
          type="number"
          min="0.1"
          step="0.1"
          placeholder="e.g. 1000"
          value={form.quantity}
          onChange={(e) => setForm((p) => ({ ...p, quantity: e.target.value }))}
          className="input-field"
        />
      </div>

      <div>
        <label className="label-field">{t("sales.rate")} (₹)</label>
        <input
          required
          type="number"
          min="0.1"
          step="0.1"
          placeholder="e.g. 25"
          value={form.ratePerUnit}
          onChange={(e) => setForm((p) => ({ ...p, ratePerUnit: e.target.value }))}
          className="input-field"
        />
      </div>

      <div>
        <label className="label-field">{t("sales.buyer")}</label>
        <input
          placeholder="Buyer or Mandi Trader"
          value={form.buyerName}
          onChange={(e) => setForm((p) => ({ ...p, buyerName: e.target.value }))}
          className="input-field"
        />
      </div>

      <div>
        <label className="label-field">{t("sales.buyerType")}</label>
        <select
          value={form.buyerType}
          onChange={(e) => setForm((p) => ({ ...p, buyerType: e.target.value as BuyerType }))}
          className="input-field"
        >
          <option value="mandi">{t("sales.buyer.mandi")}</option>
          <option value="trader">{t("sales.buyer.trader")}</option>
          <option value="fpo">{t("sales.buyer.fpo")}</option>
          <option value="cooperative">{t("sales.buyer.cooperative")}</option>
          <option value="direct_consumer">{t("sales.buyer.direct_consumer")}</option>
          <option value="processor">{t("sales.buyer.processor")}</option>
          <option value="other">{t("sales.buyer.other")}</option>
        </select>
      </div>

      <div>
        <label className="label-field">{t("sales.transport")} (₹)</label>
        <input
          type="number"
          min="0"
          value={form.transportCost}
          onChange={(e) => setForm((p) => ({ ...p, transportCost: e.target.value }))}
          className="input-field"
        />
      </div>

      <div>
        <label className="label-field">{t("sales.commission")} (₹)</label>
        <input
          type="number"
          min="0"
          value={form.commissionCost}
          onChange={(e) => setForm((p) => ({ ...p, commissionCost: e.target.value }))}
          className="input-field"
        />
      </div>

      <div>
        <label className="label-field">{t("sales.paymentStatus")}</label>
        <select
          value={form.paymentStatus}
          onChange={(e) => setForm((p) => ({ ...p, paymentStatus: e.target.value as PaymentStatus }))}
          className="input-field"
        >
          <option value="paid">{t("sales.status.paid")}</option>
          <option value="partially_paid">{t("sales.status.partially_paid")}</option>
          <option value="pending">{t("sales.status.pending")}</option>
        </select>
      </div>

      {/* Live Net Calculation Callout */}
      <div className="bg-forest-50 p-3 rounded-xl flex items-center justify-between">
        <div>
          <p className="text-xs text-ink-light">{t("sales.gross")}: ₹{grossAmount.toLocaleString("en-IN")}</p>
          <p className="text-sm font-bold text-forest-800">{t("sales.net")}: ₹{netRealization.toLocaleString("en-IN")}</p>
        </div>
      </div>

      <div className="sm:col-span-2 flex gap-2 pt-2">
        <button type="submit" disabled={saving} className="btn-primary text-sm">
          {t("common.save")}
        </button>
        <button type="button" onClick={onCancel} className="btn-secondary text-sm">
          {t("common.cancel")}
        </button>
      </div>
    </form>
  );
}

function StatCard({
  label,
  value,
  tone,
}: {
  label: string;
  value: number;
  tone: "forest" | "rust";
}) {
  return (
    <SharedStatCard
      icon={Wallet}
      label={label}
      value={`${value < 0 ? "-" : ""}₹${Math.abs(value).toLocaleString("en-IN")}`}
      tone={tone}
    />
  );
}
