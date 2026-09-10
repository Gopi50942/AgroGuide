"use client";

import { useEffect, useState } from "react";
import { Plus, Landmark, Calculator, ExternalLink, ChevronDown } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useLanguage } from "@/hooks/useLanguage";
import { useToast } from "@/components/ui/Toast";
import { listFarmerLoans, addFarmerLoan } from "@/lib/services/loanService";
import { recommendLoans } from "@/lib/services/loanRecommendationService";
import { calculateEmi } from "@/lib/utils/emiCalculator";
import { SectionHeading, EmptyState, SampleBadge } from "@/components/ui/Primitives";
import { useSampleDataVisible } from "@/hooks/useSampleDataVisible";
import type { FarmerLoan, LoanRecommendation } from "@/types";

export function LoansPanel() {
  const { profile, isDemoMode } = useAuth();
  const { t } = useLanguage();
  const [loans, setLoans] = useState<FarmerLoan[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const { visible: sampleVisible, dismiss: dismissSample } = useSampleDataVisible();

  const SAMPLE_LOAN = {
    lender: "Sample District Cooperative Bank",
    loanType: "Kisan Credit Card",
    purpose: "Crop cultivation — tomato",
    sanctionedAmount: 60000,
    outstandingAmount: 42000,
    interestRatePercent: 7,
    nextDueDate: "2026-09-01",
    status: "active" as const,
  };

  const recommendations: LoanRecommendation[] = profile ? recommendLoans(profile) : [];

  async function refresh() {
    if (!profile) return;
    if (isDemoMode) {
      setLoans([
        {
          id: "sample-loan-1",
          ownerId: profile.uid,
          startDate: "2026-04-01",
          ...SAMPLE_LOAN,
        },
      ]);
      setLoading(false);
      return;
    }
    setLoading(true);
    setLoans(await listFarmerLoans(profile.uid));
    setLoading(false);
  }

  useEffect(() => {
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profile?.uid, isDemoMode]);

  return (
    <div className="space-y-8">
      {/* My Loans */}
      <div>
        <SectionHeading
          eyebrow={t("loans.myLoansEyebrow")}
          title={t("loans.myLoans")}
          action={
            <button onClick={() => setShowAdd((v) => !v)} className="btn-secondary text-sm">
              <Plus size={15} /> {t("loans.addLoan")}
            </button>
          }
        />

        {showAdd && (
          <AddLoanForm
            onCancel={() => setShowAdd(false)}
            onSaved={() => {
              setShowAdd(false);
              refresh();
            }}
          />
        )}

        {loading ? (
          <div className="skeleton h-24" />
        ) : loans.length === 0 && !showAdd ? (
          <>
            <EmptyState icon={Landmark} title={t("loans.noLoansTitle")} message={t("loans.noLoansMessage")} />
            {!isDemoMode && sampleVisible && (
              <div className="card p-4 mt-3 border-dashed opacity-80">
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <div>
                    <p className="font-semibold text-sm">{SAMPLE_LOAN.loanType}</p>
                    <p className="text-xs text-ink-light">{SAMPLE_LOAN.lender} · {SAMPLE_LOAN.purpose}</p>
                  </div>
                  <SampleBadge />
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-3 text-sm">
                  <div>
                    <p className="text-xs text-ink-light">{t("loans.outstanding")}</p>
                    <p className="font-semibold">₹{SAMPLE_LOAN.outstandingAmount.toLocaleString("en-IN")}</p>
                  </div>
                  <div>
                    <p className="text-xs text-ink-light">{t("loans.sanctioned")}</p>
                    <p className="font-semibold">₹{SAMPLE_LOAN.sanctionedAmount.toLocaleString("en-IN")}</p>
                  </div>
                  <div>
                    <p className="text-xs text-ink-light">{t("loans.nextDue")}</p>
                    <p className="font-semibold">{SAMPLE_LOAN.nextDueDate}</p>
                  </div>
                  <div>
                    <p className="text-xs text-ink-light">{t("loans.interestRate")}</p>
                    <p className="font-semibold">{SAMPLE_LOAN.interestRatePercent}%</p>
                  </div>
                </div>
                <p className="text-xs text-ink-light mt-3">{t("loans.sampleExplainer")}</p>
                <button onClick={dismissSample} className="text-xs font-semibold text-forest-700 mt-2">
                  {t("farm.dismissSample")}
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="space-y-3">
            {loans.map((loan) => (
              <div key={loan.id} className="card p-4">
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <div>
                    <p className="font-semibold text-sm">{loan.loanType}</p>
                    <p className="text-xs text-ink-light">{loan.lender} · {loan.purpose}</p>
                  </div>
                  <span className={`chip capitalize ${loan.status === "overdue" ? "!bg-rust-400/10 !text-rust-500" : ""}`}>
                    {loan.status}
                  </span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-3 text-sm">
                  <div>
                    <p className="text-xs text-ink-light">{t("loans.outstanding")}</p>
                    <p className="font-semibold">₹{loan.outstandingAmount.toLocaleString("en-IN")}</p>
                  </div>
                  <div>
                    <p className="text-xs text-ink-light">{t("loans.sanctioned")}</p>
                    <p className="font-semibold">₹{loan.sanctionedAmount.toLocaleString("en-IN")}</p>
                  </div>
                  {loan.nextDueDate && (
                    <div>
                      <p className="text-xs text-ink-light">{t("loans.nextDue")}</p>
                      <p className="font-semibold">{loan.nextDueDate}</p>
                    </div>
                  )}
                  {loan.interestRatePercent !== undefined && (
                    <div>
                      <p className="text-xs text-ink-light">{t("loans.interestRate")}</p>
                      <p className="font-semibold">{loan.interestRatePercent}%</p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Find suitable loans */}
      <div>
        <SectionHeading eyebrow={t("loans.findEyebrow")} title={t("loans.findTitle")} />
        <p className="text-sm text-ink-light -mt-2 mb-4">{t("loans.findDisclaimer")}</p>
        <div className="space-y-3">
          {recommendations.map(({ product, relevance, reasons }) => (
            <div key={product.id} className="card p-4">
              <button
                onClick={() => setExpandedId(expandedId === product.id ? null : product.id)}
                className="w-full flex items-center justify-between gap-2 text-left"
              >
                <div>
                  <p className="font-semibold text-sm">{product.name}</p>
                  <p className="text-xs text-ink-light mt-0.5">{product.purpose}</p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span
                    className={`chip ${
                      relevance === "high" ? "" : relevance === "medium" ? "!bg-wheat-100 !text-clay-700" : "!bg-cream-100 !text-ink-light"
                    }`}
                  >
                    {t(`loans.relevance.${relevance}`)}
                  </span>
                  <ChevronDown size={16} className={`transition-transform ${expandedId === product.id ? "rotate-180" : ""}`} />
                </div>
              </button>

              {expandedId === product.id && (
                <div className="mt-4 pt-4 border-t border-forest-100 space-y-3 text-sm">
                  <div>
                    <p className="text-xs font-semibold text-ink-light uppercase tracking-wide">{t("loans.whyRecommended")}</p>
                    <ul className="mt-1 space-y-1">
                      {reasons.map((r, i) => (
                        <li key={i} className="flex gap-2">
                          <span className="text-forest-500">•</span> {r}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-ink-light uppercase tracking-wide">{t("loans.eligibility")}</p>
                    <ul className="mt-1 space-y-1">
                      {product.eligibility.map((e, i) => (
                        <li key={i} className="flex gap-2">
                          <span className="text-forest-500">•</span> {e}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-ink-light uppercase tracking-wide">{t("loans.documents")}</p>
                    <ul className="mt-1 space-y-1">
                      {product.documents.map((d, i) => (
                        <li key={i} className="flex gap-2">
                          <span className="text-forest-500">•</span> {d}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <p>
                    <span className="text-xs font-semibold text-ink-light uppercase tracking-wide">{t("loans.howToApply")}: </span>
                    {product.howToApply}
                  </p>
                  <a
                    href={product.officialUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-forest-700 font-semibold text-xs"
                  >
                    {product.officialSource} <ExternalLink size={12} />
                  </a>
                  <p className="text-xs text-ink-light">{t("loans.lastVerified")}: {product.lastVerified}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      <EmiCalculator />
    </div>
  );
}

function AddLoanForm({ onCancel, onSaved }: { onCancel: () => void; onSaved: () => void }) {
  const { profile } = useAuth();
  const { t } = useLanguage();
  const { showToast } = useToast();
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    lender: "",
    loanType: "",
    purpose: "",
    sanctionedAmount: "",
    outstandingAmount: "",
    interestRatePercent: "",
    startDate: new Date().toISOString().slice(0, 10),
    nextDueDate: "",
  });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!profile || !form.lender.trim() || !form.sanctionedAmount) return;
    setSaving(true);
    try {
      await addFarmerLoan(profile.uid, {
        lender: form.lender.trim(),
        loanType: form.loanType.trim() || "Agricultural loan",
        purpose: form.purpose.trim(),
        sanctionedAmount: Number(form.sanctionedAmount) || 0,
        outstandingAmount: Number(form.outstandingAmount) || Number(form.sanctionedAmount) || 0,
        interestRatePercent: form.interestRatePercent ? Number(form.interestRatePercent) : undefined,
        startDate: form.startDate,
        nextDueDate: form.nextDueDate || undefined,
        status: "active",
      });
      showToast(t("loans.loanSaved"), "success");
      onSaved();
    } catch {
      showToast(t("common.error"), "warning");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="card p-5 mb-3 grid sm:grid-cols-2 gap-3">
      <input required placeholder={t("loans.lender")} value={form.lender} onChange={(e) => setForm((p) => ({ ...p, lender: e.target.value }))} className="input-field" />
      <input placeholder={t("loans.loanType")} value={form.loanType} onChange={(e) => setForm((p) => ({ ...p, loanType: e.target.value }))} className="input-field" />
      <input placeholder={t("loans.purpose")} value={form.purpose} onChange={(e) => setForm((p) => ({ ...p, purpose: e.target.value }))} className="input-field sm:col-span-2" />
      <input required type="number" min={0} placeholder={t("loans.sanctioned")} value={form.sanctionedAmount} onChange={(e) => setForm((p) => ({ ...p, sanctionedAmount: e.target.value }))} className="input-field" />
      <input type="number" min={0} placeholder={t("loans.outstanding")} value={form.outstandingAmount} onChange={(e) => setForm((p) => ({ ...p, outstandingAmount: e.target.value }))} className="input-field" />
      <input type="number" min={0} step={0.1} placeholder={t("loans.interestRate")} value={form.interestRatePercent} onChange={(e) => setForm((p) => ({ ...p, interestRatePercent: e.target.value }))} className="input-field" />
      <div>
        <label className="label-field">{t("loans.nextDue")}</label>
        <input type="date" value={form.nextDueDate} onChange={(e) => setForm((p) => ({ ...p, nextDueDate: e.target.value }))} className="input-field" />
      </div>
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

function EmiCalculator() {
  const { t } = useLanguage();
  const [principal, setPrincipal] = useState("100000");
  const [rate, setRate] = useState("9");
  const [tenure, setTenure] = useState("12");

  const result = calculateEmi(Number(principal) || 0, Number(rate) || 0, Number(tenure) || 0);

  return (
    <div>
      <SectionHeading eyebrow={t("loans.calculatorEyebrow")} title={t("loans.calculatorTitle")} />
      <div className="card p-6">
        <div className="grid sm:grid-cols-3 gap-3">
          <div>
            <label className="label-field">{t("loans.principal")}</label>
            <input type="number" min={0} value={principal} onChange={(e) => setPrincipal(e.target.value)} className="input-field" />
          </div>
          <div>
            <label className="label-field">{t("loans.annualRate")}</label>
            <input type="number" min={0} step={0.1} value={rate} onChange={(e) => setRate(e.target.value)} className="input-field" />
          </div>
          <div>
            <label className="label-field">{t("loans.tenureMonths")}</label>
            <input type="number" min={1} value={tenure} onChange={(e) => setTenure(e.target.value)} className="input-field" />
          </div>
        </div>
        <div className="grid sm:grid-cols-3 gap-4 mt-5 pt-5 border-t border-forest-100">
          <div>
            <p className="text-xs text-ink-light">{t("loans.emi")}</p>
            <p className="font-display text-xl font-semibold text-forest-700">
              ₹{Math.round(result.monthlyEmi).toLocaleString("en-IN")}
            </p>
          </div>
          <div>
            <p className="text-xs text-ink-light">{t("loans.totalInterest")}</p>
            <p className="font-display text-xl font-semibold">₹{Math.round(result.totalInterest).toLocaleString("en-IN")}</p>
          </div>
          <div>
            <p className="text-xs text-ink-light">{t("loans.totalRepayment")}</p>
            <p className="font-display text-xl font-semibold">₹{Math.round(result.totalRepayment).toLocaleString("en-IN")}</p>
          </div>
        </div>
        <div className="flex items-center gap-2 mt-4 text-xs text-ink-light">
          <Calculator size={13} /> {t("loans.calculatorDisclaimer")}
        </div>
      </div>
    </div>
  );
}
