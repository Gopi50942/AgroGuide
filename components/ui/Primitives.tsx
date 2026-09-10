"use client";

import type { LucideIcon } from "lucide-react";
import { useLanguage } from "@/hooks/useLanguage";

export function SectionHeading({
  eyebrow,
  title,
  subtitle,
  action,
}: {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex items-end justify-between mb-4">
      <div>
        {eyebrow && <span className="section-eyebrow">{eyebrow}</span>}
        <h2 className="font-display text-xl sm:text-2xl font-semibold mt-0.5">{title}</h2>
        {subtitle && <p className="text-xs text-ink-light mt-0.5">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}

export function Disclaimer({ text }: { text: string }) {
  return (
    <div className="p-3 bg-cream-50/70 border border-forest-100 rounded-xl text-xs text-ink-light leading-relaxed">
      <p>{text}</p>
    </div>
  );
}

export function ProgressBar({ value, className = "" }: { value: number; className?: string }) {
  return (
    <div className={`h-2 rounded-full bg-forest-100 overflow-hidden ${className}`}>
      <div
        className="h-full bg-forest-500 rounded-full transition-all"
        style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
      />
    </div>
  );
}

export function EmptyState({
  icon: Icon,
  title,
  message,
  action,
}: {
  icon: LucideIcon;
  title: string;
  message: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="card p-10 flex flex-col items-center text-center">
      <div className="w-12 h-12 rounded-full bg-forest-50 flex items-center justify-center mb-3">
        <Icon size={22} className="text-forest-500" />
      </div>
      <h3 className="font-display font-semibold">{title}</h3>
      <p className="text-sm text-ink-light mt-1 max-w-xs">{message}</p>
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

/**
 * Marks a card as illustrative sample/example content — never the
 * farmer's real data. Always pair with a dismiss action when shown in
 * an empty-state context (see useSampleDataVisible).
 */
export function SampleBadge() {
  const { t } = useLanguage();
  return (
    <span className="text-[10px] font-bold tracking-wide uppercase px-2 py-0.5 rounded-full bg-wheat-300 text-clay-700 border border-wheat-400">
      {t("common.sample")}
    </span>
  );
}

/**
 * A compact metric card — icon, label, value, with a subtle color accent
 * on the left edge for quick visual scanning (used for financial/farm
 * totals: revenue, expenses, land area, etc.). Prefer this over ad-hoc
 * duplicated card markup so stat displays stay visually consistent.
 */
export function StatCard({
  icon: Icon,
  label,
  value,
  tone = "forest",
}: {
  icon: LucideIcon;
  label: string;
  value: string;
  tone?: "forest" | "rust" | "clay";
}) {
  const toneStyles = {
    forest: { border: "border-l-forest-500", text: "text-forest-700" },
    rust: { border: "border-l-rust-400", text: "text-rust-500" },
    clay: { border: "border-l-clay-400", text: "text-clay-600" },
  }[tone];

  return (
    <div className={`card p-3 sm:p-5 border-l-4 min-w-0 overflow-hidden ${toneStyles.border}`}>
      <div className="flex items-center gap-1.5 text-ink-light text-[11px] sm:text-xs uppercase tracking-wide font-semibold truncate">
        <Icon size={13} className="shrink-0" /> <span className="truncate">{label}</span>
      </div>
      <p className={`mt-1 sm:mt-2 font-display text-xl sm:text-2xl font-semibold truncate ${toneStyles.text}`}>{value}</p>
    </div>
  );
}

export function SeverityBadge({ severity }: { severity: "low" | "moderate" | "high" }) {
  const styles = {
    low: "bg-forest-50 text-forest-700 border-forest-100",
    moderate: "bg-wheat-100 text-clay-700 border-wheat-200",
    high: "bg-rust-400/10 text-rust-500 border-rust-400/20",
  }[severity];
  return (
    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${styles}`}>
      {severity[0].toUpperCase() + severity.slice(1)}
    </span>
  );
}

export function WhyDisclosure({ why }: { why?: string }) {
  if (!why) return null;
  return (
    <details className="mt-2 text-sm">
      <summary className="cursor-pointer font-semibold text-forest-600 select-none">Why?</summary>
      <p className="mt-1.5 text-ink-light leading-relaxed">{why}</p>
    </details>
  );
}
