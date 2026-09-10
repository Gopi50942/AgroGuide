"use client";

import { useState } from "react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from "recharts";
import { TrendingUp, TrendingDown, Minus, Info } from "lucide-react";
import { useLanguage } from "@/hooks/useLanguage";
import { computeMarketPriceTrends } from "@/lib/market/trendCalculator";
import type { NormalizedMarketRecord } from "@/lib/market/marketTypes";

interface Props {
  records: NormalizedMarketRecord[];
  commodityName: string;
}

export function MarketPriceTrendChart({ records, commodityName }: Props) {
  const { t } = useLanguage();
  const [period, setPeriod] = useState<7 | 30 | 90>(30);

  const trend = computeMarketPriceTrends(records, period);

  return (
    <div className="card p-5 space-y-4">
      {/* Header & Controls */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="font-serif font-bold text-base text-forest-950 flex items-center gap-2">
            {commodityName ? `${commodityName} — ` : ""}
            {t("market.trendsTitle")}
          </h3>
          <p className="text-xs text-ink-light">
            {t("market.trendSubtitle")} ({trend.observationCount} {t("market.observations")})
          </p>
        </div>

        {/* Period Selector */}
        <div className="flex items-center gap-1 bg-cream-200/60 p-1 rounded-xl border border-forest-100">
          {([7, 30, 90] as const).map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-all ${
                period === p
                  ? "bg-forest-800 text-cream-50 shadow-sm"
                  : "text-forest-900 hover:bg-forest-100"
              }`}
            >
              {p}D
            </button>
          ))}
        </div>
      </div>

      {/* Summary Metrics */}
      {trend.hasSufficientData ? (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="card p-3 bg-cream-50/70 border-forest-100">
              <p className="text-[11px] text-ink-light">{t("market.latestPrice")}</p>
              <p className="text-lg font-display font-bold text-forest-950 mt-0.5">
                ₹{trend.latestPrice.toLocaleString("en-IN")}
              </p>
            </div>

            <div className="card p-3 bg-cream-50/70 border-forest-100">
              <p className="text-[11px] text-ink-light">{t("market.averagePrice")}</p>
              <p className="text-lg font-display font-bold text-forest-950 mt-0.5">
                ₹{trend.averagePrice.toLocaleString("en-IN")}
              </p>
            </div>

            <div className="card p-3 bg-cream-50/70 border-forest-100">
              <p className="text-[11px] text-ink-light">{t("market.priceRange")}</p>
              <p className="text-xs font-medium text-forest-900 mt-1">
                ₹{trend.lowestPrice} – ₹{trend.highestPrice}
              </p>
            </div>

            <div className="card p-3 bg-cream-50/70 border-forest-100">
              <p className="text-[11px] text-ink-light">{t("market.periodChange")}</p>
              <div className="flex items-center gap-1.5 mt-0.5">
                {trend.trendDirection === "UP" ? (
                  <span className="flex items-center text-xs font-bold text-forest-700">
                    <TrendingUp size={14} className="mr-0.5" /> +{trend.percentageChange}%
                  </span>
                ) : trend.trendDirection === "DOWN" ? (
                  <span className="flex items-center text-xs font-bold text-rust-600">
                    <TrendingDown size={14} className="mr-0.5" /> {trend.percentageChange}%
                  </span>
                ) : (
                  <span className="flex items-center text-xs font-bold text-clay-600">
                    <Minus size={14} className="mr-0.5" /> {trend.percentageChange}%
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Chart */}
          <div className="h-64 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trend.series} margin={{ top: 10, right: 15, left: -10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E2DDD2" vertical={false} />
                <XAxis
                  dataKey="formattedDate"
                  tick={{ fontSize: 11, fill: "#5C6F63" }}
                  tickLine={false}
                  axisLine={{ stroke: "#C7D4CA" }}
                />
                <YAxis
                  tick={{ fontSize: 11, fill: "#5C6F63" }}
                  tickLine={false}
                  axisLine={{ stroke: "#C7D4CA" }}
                  domain={["auto", "auto"]}
                  tickFormatter={(val) => `₹${val}`}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#FFFFFF",
                    borderColor: "#C7D4CA",
                    borderRadius: "12px",
                    fontSize: "12px",
                    boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
                  }}
                  formatter={(val: number, name: string) => [
                    `₹${val.toLocaleString("en-IN")}`,
                    name === "modalPrice"
                      ? t("market.modalPrice")
                      : t("market.movingAverage"),
                  ]}
                  labelFormatter={(label) => `${t("market.date")}: ${label}`}
                />
                <Legend
                  wrapperStyle={{ fontSize: "12px", paddingTop: "8px" }}
                  formatter={(val) =>
                    val === "modalPrice"
                      ? t("market.modalPrice")
                      : t("market.movingAverage")
                  }
                />
                <Line
                  type="monotone"
                  dataKey="modalPrice"
                  name="modalPrice"
                  stroke="#2C4C38"
                  strokeWidth={2.5}
                  dot={{ r: 3, fill: "#2C4C38" }}
                  activeDot={{ r: 5 }}
                />
                <Line
                  type="monotone"
                  dataKey="movingAverage"
                  name="movingAverage"
                  stroke="#D4A373"
                  strokeWidth={1.8}
                  strokeDasharray="4 4"
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Safety disclaimer */}
          <div className="flex items-start gap-2 text-[11px] text-ink-light bg-cream-100/70 p-2.5 rounded-xl border border-cream-300">
            <Info size={13} className="shrink-0 text-clay-600 mt-0.5" />
            <span>{t("market.trendDisclaimer")}</span>
          </div>
        </>
      ) : (
        <div className="p-8 text-center bg-cream-50/50 rounded-xl border border-dashed border-forest-200">
          <p className="text-sm text-ink-light font-medium">{t("market.insufficientTrendData")}</p>
          <p className="text-xs text-ink-light/75 mt-1">{t("market.insufficientTrendDataDesc")}</p>
        </div>
      )}
    </div>
  );
}
