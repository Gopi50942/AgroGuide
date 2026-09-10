"use client";

import { useEffect, useState } from "react";
import { RefreshCw, AlertTriangle, Bookmark, Trash2, Plus, ArrowUpRight, ArrowDownRight, CheckCircle2 } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useSharedMarketPrices } from "@/hooks/useSharedMarketPrices";
import { compareMarketsByReturn } from "@/lib/services/marketService";
import {
  listMarketWatchlists,
  addMarketWatchlist,
  removeMarketWatchlist,
  evaluateTargetPriceStatus,
} from "@/lib/services/marketWatchlistService";
import { SectionHeading, EmptyState } from "@/components/ui/Primitives";
import { MarketPriceTrendChart } from "@/components/market/MarketPriceTrendChart";
import { formatDataFreshness } from "@/hooks/useNetworkStatus";
import { useLanguage } from "@/hooks/useLanguage";
import { useToast } from "@/components/ui/Toast";
import type { MarketWatchlist } from "@/types";

export default function MarketPage() {
  const { profile, isDemoMode } = useAuth();
  const { t, language } = useLanguage();
  const { showToast } = useToast();

  const [commodityInput, setCommodityInput] = useState(profile?.currentCrops?.[0] ?? "Tomato");
  const [committedCommodity, setCommittedCommodity] = useState(profile?.currentCrops?.[0] ?? "Tomato");
  const [quintals, setQuintals] = useState(5);

  const [watchlists, setWatchlists] = useState<MarketWatchlist[]>([]);
  const [loadingWatchlist, setLoadingWatchlist] = useState(true);
  const [showAddWatchlist, setShowAddWatchlist] = useState(false);
  const [targetPriceInput, setTargetPriceInput] = useState("");
  const [targetDirection, setTargetDirection] = useState<"ABOVE" | "BELOW">("ABOVE");

  const { response, loading, refetch, isOfflineCached, cachedAt } = useSharedMarketPrices({
    state: profile?.state,
    district: profile?.district,
    commodity: committedCommodity || undefined,
  });

  const records = response?.records ?? [];
  const isLive = response?.isLive ?? true;
  const error = response?.error ?? t("market.unavailable");
  const freshness = cachedAt ? formatDataFreshness(cachedAt, language) : null;

  const options = compareMarketsByReturn(records, quintals);

  async function loadWatchlist() {
    if (!profile) return;
    if (isDemoMode) {
      setWatchlists([]);
      setLoadingWatchlist(false);
      return;
    }
    setLoadingWatchlist(true);
    try {
      const list = await listMarketWatchlists(profile.uid);
      setWatchlists(list);
    } catch {
      // Non-fatal
    } finally {
      setLoadingWatchlist(false);
    }
  }

  useEffect(() => {
    loadWatchlist();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profile?.uid, isDemoMode]);

  async function handleAddWatchlist(commodity: string, marketName?: string, currentPrice?: number) {
    if (!profile) return;
    const target = targetPriceInput ? Number(targetPriceInput) : currentPrice ? currentPrice + 200 : undefined;

    const payload: Omit<MarketWatchlist, "id" | "ownerId"> = {
      commodity,
      state: profile.state || "Tamil Nadu",
      district: profile.district || "Coimbatore",
      market: marketName,
      targetPrice: target,
      targetDirection,
      active: true,
    };

    if (isDemoMode) {
      setWatchlists((prev) => [
        {
          id: `demo-watch-${Date.now()}`,
          ownerId: profile.uid,
          ...payload,
        },
        ...prev,
      ]);
      showToast(t("market.watchlistSaved"), "success");
      setShowAddWatchlist(false);
      return;
    }

    try {
      await addMarketWatchlist(profile.uid, payload);
      showToast(t("market.watchlistSaved"), "success");
      setShowAddWatchlist(false);
      setTargetPriceInput("");
      loadWatchlist();
    } catch {
      showToast(t("common.error"), "warning");
    }
  }

  async function handleDeleteWatchlist(id: string) {
    if (isDemoMode) {
      setWatchlists((prev) => prev.filter((w) => w.id !== id));
      showToast(t("market.watchlistRemoved"), "success");
      return;
    }
    try {
      await removeMarketWatchlist(id);
      showToast(t("market.watchlistRemoved"), "success");
      loadWatchlist();
    } catch {
      showToast(t("common.error"), "warning");
    }
  }

  return (
    <div className="space-y-8 animate-fade-up">
      <SectionHeading eyebrow={t("nav.market")} title={t("market.title")} />

      {/* ── Search Form ── */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          setCommittedCommodity(commodityInput);
        }}
        className="card p-4 flex flex-wrap items-end gap-3"
      >
        <div className="flex-1 min-w-[160px]">
          <label className="label-field">{t("market.crop")}</label>
          <input
            value={commodityInput}
            onChange={(e) => setCommodityInput(e.target.value)}
            placeholder={t("market.cropPlaceholder")}
            className="input-field"
          />
        </div>
        <button type="submit" className="btn-primary text-sm" disabled={loading}>
          <RefreshCw size={14} className={loading ? "animate-spin" : ""} /> {t("market.search")}
        </button>
      </form>

      {/* ── Offline Cached Market Banner ── */}
      {isOfflineCached && freshness && (
        <div className="card p-3 bg-wheat-100/70 border-wheat-300 text-xs text-forest-900 flex items-center justify-between">
          <span className="font-medium">💾 {t("market.cachedNotice")} ({freshness.label})</span>
          <span className="text-[11px] opacity-75">{t("market.offlineNote")}</span>
        </div>
      )}

      {/* ── Market Price Historical Trend (Phase 13) ── */}
      {records.length > 0 && (
        <MarketPriceTrendChart records={records} commodityName={committedCommodity} />
      )}

      {/* ── Market Watchlist (Phase 6) ── */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <SectionHeading title={`${t("market.watchlist")} (${watchlists.length})`} />
          <button
            onClick={() => setShowAddWatchlist((v) => !v)}
            className="btn-secondary text-xs"
          >
            <Bookmark size={13} /> {t("market.addToWatchlist")}
          </button>
        </div>

        {showAddWatchlist && (
          <div className="card p-4 mb-4 grid sm:grid-cols-3 gap-3 bg-forest-50/50">
            <div>
              <label className="label-field">{t("market.crop")}</label>
              <input
                value={commodityInput}
                onChange={(e) => setCommodityInput(e.target.value)}
                className="input-field"
                required
              />
            </div>
            <div>
              <label className="label-field">{t("market.targetPrice")} (₹/quintal)</label>
              <input
                type="number"
                placeholder="e.g. 2500"
                value={targetPriceInput}
                onChange={(e) => setTargetPriceInput(e.target.value)}
                className="input-field"
              />
            </div>
            <div>
              <label className="label-field">{t("market.targetDirection")}</label>
              <select
                value={targetDirection}
                onChange={(e) => setTargetDirection(e.target.value as "ABOVE" | "BELOW")}
                className="input-field"
              >
                <option value="ABOVE">{t("market.above")}</option>
                <option value="BELOW">{t("market.below")}</option>
              </select>
            </div>
            <div className="sm:col-span-3 flex gap-2 pt-1">
              <button
                type="button"
                onClick={() => handleAddWatchlist(commodityInput)}
                className="btn-primary text-xs"
              >
                {t("common.save")}
              </button>
              <button
                type="button"
                onClick={() => setShowAddWatchlist(false)}
                className="btn-secondary text-xs"
              >
                {t("common.cancel")}
              </button>
            </div>
          </div>
        )}

        {loadingWatchlist ? (
          <div className="skeleton h-20" />
        ) : watchlists.length === 0 && !showAddWatchlist ? (
          <div className="card p-4 text-xs text-ink-light bg-cream-100/50">
            {t("market.noWatchlist")}
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-3">
            {watchlists.map((w) => {
              const matchedRecord = records.find(
                (r) => r.commodity.toLowerCase() === w.commodity.toLowerCase()
              );
              const currentPrice = matchedRecord?.modalPrice || 0;
              const evalResult = evaluateTargetPriceStatus(currentPrice, w.targetPrice, w.targetDirection);

              return (
                <div key={w.id} className="card p-4 flex flex-col justify-between gap-2 border-forest-100">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="font-display font-semibold text-base text-forest-900">{w.commodity}</p>
                      <p className="text-xs text-ink-light">{w.district || w.state}</p>
                    </div>
                    <button
                      onClick={() => handleDeleteWatchlist(w.id)}
                      className="p-1 text-ink-light hover:text-rust-500 rounded"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>

                  {w.targetPrice && (
                    <div className="pt-2 border-t border-forest-100 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="text-ink-light">{t("market.targetPrice")}:</span>
                        <span className="font-semibold text-ink">₹{w.targetPrice}</span>
                      </div>
                      {currentPrice > 0 ? (
                        <div className="mt-1 flex items-center justify-between">
                          <span className="text-ink-light">Current:</span>
                          <span className="font-semibold text-forest-700">₹{currentPrice}</span>
                        </div>
                      ) : null}

                      {/* In-app status indicator */}
                      {currentPrice > 0 && w.targetPrice && (
                        <div className="mt-2 pt-1.5 flex items-center gap-1.5">
                          {evalResult.status === "reached" ? (
                            <span className="chip bg-forest-100 text-forest-800 text-[11px] flex items-center gap-1">
                              <CheckCircle2 size={11} /> {t("market.targetReached")}
                            </span>
                          ) : evalResult.difference < 0 ? (
                            <span className="chip bg-wheat-100 text-wheat-800 text-[11px] flex items-center gap-1">
                              <ArrowDownRight size={11} /> ₹{Math.abs(evalResult.difference)} {t("market.belowTarget")}
                            </span>
                          ) : (
                            <span className="chip bg-forest-100 text-forest-800 text-[11px] flex items-center gap-1">
                              <ArrowUpRight size={11} /> ₹{evalResult.difference} {t("market.aboveTarget")}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {loading && (
        <div className="space-y-3">
          <div className="skeleton h-16" />
          <div className="skeleton h-16" />
          <div className="skeleton h-16" />
        </div>
      )}

      {!loading && !isLive && (
        <div className="card p-5 flex items-start gap-3 border-clay-200 bg-clay-50/50">
          <AlertTriangle size={18} className="text-clay-500 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold">{t("market.unavailable")}</p>
            <p className="text-xs text-ink-light mt-1">{error}</p>
            <button onClick={refetch} className="btn-secondary text-xs mt-3">
              <RefreshCw size={13} /> {t("common.tryAgain")}
            </button>
          </div>
        </div>
      )}

      {!loading && isLive && records.length === 0 && (
        <div className="card p-5 text-sm text-ink-light">
          {committedCommodity ? t("market.noResultsForCrop") : t("market.enterCropPrompt")}
        </div>
      )}

      {!loading && isLive && records.length > 0 && (
        <>
          <div className="card divide-y divide-forest-100">
            {records.map((r, i) => (
              <div key={i} className="flex items-center justify-between px-5 py-4 gap-3">
                <div className="min-w-0">
                  <p className="font-semibold text-sm truncate">
                    {r.commodity}
                    {r.variety ? ` · ${r.variety}` : ""}
                  </p>
                  <p className="text-xs text-ink-light mt-0.5 truncate">
                    {r.market} · {r.district || r.state} · {r.arrivalDate || "—"}
                  </p>
                </div>
                <div className="text-right shrink-0 flex items-center gap-3">
                  <div>
                    <p className="font-display font-semibold">
                      ₹{r.modalPrice.toLocaleString("en-IN")}
                      <span className="text-xs text-ink-light font-normal"> /quintal</span>
                    </p>
                    <p className="text-xs text-ink-light mt-0.5">
                      ₹{r.minPrice.toLocaleString("en-IN")}–₹{r.maxPrice.toLocaleString("en-IN")}
                    </p>
                  </div>
                  <button
                    onClick={() => handleAddWatchlist(r.commodity, r.market, r.modalPrice)}
                    className="p-1.5 rounded-lg border border-forest-200 text-forest-700 hover:bg-forest-50"
                    title={t("market.addToWatchlist")}
                  >
                    <Bookmark size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
          <p className="text-xs text-ink-light">
            {t("market.source")}: {records[0].source}
          </p>

          <div>
            <SectionHeading title={t("market.whereToSell")} />
            <div className="card p-6">
              <label className="label-field">{t("market.quantity")}</label>
              <input
                type="number"
                min={1}
                value={quintals}
                onChange={(e) => setQuintals(Number(e.target.value) || 1)}
                className="input-field max-w-[160px]"
              />

              <div className="mt-5 space-y-3">
                {options.map((o, i) => (
                  <div
                    key={`${o.market}-${i}`}
                    className={`flex items-center justify-between px-4 py-3 rounded-xl border gap-3 ${
                      i === 0 ? "border-forest-500 bg-forest-50" : "border-forest-100"
                    }`}
                  >
                    <div className="min-w-0">
                      <p className="font-semibold text-sm flex items-center gap-2 flex-wrap">
                        <span className="truncate">{o.market}</span>
                        {i === 0 && <span className="chip">{t("market.bestReturn")}</span>}
                      </p>
                      <p className="text-xs text-ink-light mt-1">
                        {t("market.price")} ₹{o.modalPrice.toLocaleString("en-IN")} · {t("market.estCommission")} ≈ ₹
                        {o.estCommissionRs.toLocaleString("en-IN")}
                      </p>
                    </div>
                    <p className="font-display font-semibold text-lg shrink-0">
                      ₹{o.estNetReturnRs.toLocaleString("en-IN")}
                    </p>
                  </div>
                ))}
              </div>
              <p className="text-xs text-ink-light mt-4">{t("market.estimateDisclaimer")}</p>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
