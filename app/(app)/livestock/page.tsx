"use client";

import { useState, useEffect } from "react";
import {
  Milk,
  Plus,
  HeartPulse,
  TrendingUp,
  DollarSign,
  AlertCircle,
  Calendar,
  Layers,
  ChevronRight,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useLanguage } from "@/hooks/useLanguage";
import { useToast } from "@/components/ui/Toast";
import {
  listFarmerLivestock,
  listFarmerMilkYieldLogs,
  createLivestockAnimal,
  logDailyMilkYield,
  calculateMixedFarmingEconomics,
} from "@/lib/services/livestockService";
import type { LivestockRecord, MilkYieldLog, LivestockAnimalType } from "@/types";

export default function LivestockLedgerPage() {
  const { user, profile, isDemoMode } = useAuth();
  const { language, t } = useLanguage();
  const { showToast } = useToast();
  const isTa = language === "ta";

  const [animals, setAnimals] = useState<LivestockRecord[]>([]);
  const [milkLogs, setMilkLogs] = useState<MilkYieldLog[]>([]);
  const [showAddAnimal, setShowAddAnimal] = useState(false);
  const [showLogMilk, setShowLogMilk] = useState(false);

  // New Animal form state
  const [animalType, setAnimalType] = useState<LivestockAnimalType>("cow");
  const [breed, setBreed] = useState("");
  const [tagNumber, setTagNumber] = useState("");
  const [gender, setGender] = useState<"female" | "male">("female");

  // New Milk Log form state
  const [selectedAnimalId, setSelectedAnimalId] = useState("");
  const [morningL, setMorningL] = useState<number>(6);
  const [eveningL, setEveningL] = useState<number>(5);
  const [pricePerLitre, setPricePerLitre] = useState<number>(42);

  const currentUid = user?.uid || profile?.uid || "demo_farmer";

  useEffect(() => {
    async function load() {
      if (!currentUid) return;
      const aList = await listFarmerLivestock(currentUid, isDemoMode);
      setAnimals(aList);
      if (aList.length > 0) setSelectedAnimalId(aList[0].id);

      const mList = await listFarmerMilkYieldLogs(currentUid, isDemoMode);
      setMilkLogs(mList);
    }
    load();
  }, [currentUid, isDemoMode]);

  async function handleCreateAnimal(e: React.FormEvent) {
    e.preventDefault();
    if (!currentUid || !breed || !tagNumber) return;

    try {
      const record = await createLivestockAnimal(
        currentUid,
        animalType,
        breed,
        tagNumber,
        gender,
        undefined,
        undefined,
        "",
        isDemoMode
      );
      setAnimals([record, ...animals]);
      setShowAddAnimal(false);
      setBreed("");
      setTagNumber("");
      showToast(isTa ? "கால்நடை பதிவு வெற்றிகரமாக சேர்க்கப்பட்டது." : "Livestock animal added successfully.", "success");
    } catch {
      showToast(t("common.error"), "error");
    }
  }

  async function handleLogMilk(e: React.FormEvent) {
    e.preventDefault();
    if (!currentUid || !selectedAnimalId) return;

    const animal = animals.find((a) => a.id === selectedAnimalId);

    try {
      const log = await logDailyMilkYield(
        currentUid,
        selectedAnimalId,
        new Date().toISOString().slice(0, 10),
        morningL,
        eveningL,
        pricePerLitre,
        animal?.tagNameOrNumber,
        isDemoMode
      );
      setMilkLogs([log, ...milkLogs]);
      setShowLogMilk(false);
      showToast(isTa ? "பால் உற்பத்தி பதிவு செய்யப்பட்டது." : "Milk yield logged successfully.", "success");
    } catch {
      showToast(t("common.error"), "error");
    }
  }

  const economics = calculateMixedFarmingEconomics(45000, milkLogs, []);

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-forest-100 pb-4">
        <div>
          <h1 className="text-2xl font-bold font-display text-ink flex items-center gap-2">
            <Milk size={26} className="text-forest-600" />
            {isTa ? "கால்நடை & கலப்புப் பண்ணை கணக்கு" : "Livestock & Mixed-Farming Ledger"}
          </h1>
          <p className="text-xs text-ink-light mt-0.5">
            {isTa
              ? "பால் பண்ணை வருமானம், தீவன செலவுகள் மற்றும் ஒருங்கிணைந்த பண்ணை லாபம்."
              : "Dairy yield tracking, cattle records, and integrated mixed-farming profits."}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowAddAnimal(true)}
            className="px-3.5 py-2 text-xs font-semibold rounded-xl border border-forest-200 bg-white hover:bg-forest-50 text-ink flex items-center gap-1.5 transition-all"
          >
            <Plus size={14} /> {isTa ? "கால்நடை சேர்" : "Add Animal"}
          </button>
          <button
            onClick={() => setShowLogMilk(true)}
            className="px-4 py-2 text-xs font-semibold rounded-xl bg-forest-600 hover:bg-forest-700 text-white flex items-center gap-1.5 transition-all shadow-sm"
          >
            <Milk size={14} /> {isTa ? "பால் உற்பத்தி பதிவு" : "Log Milk Yield"}
          </button>
        </div>
      </div>

      {/* Economics Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="card p-4 bg-forest-50/70 border-forest-100 space-y-1">
          <span className="text-[11px] font-semibold text-forest-700 uppercase flex items-center gap-1">
            <Milk size={12} /> {isTa ? "மொத்த பால் உற்பத்தி" : "Total Milk Recorded"}
          </span>
          <div className="text-xl font-bold text-ink">
            {economics.totalMilkLitres} {isTa ? "லிட்டர்" : "Litres"}
          </div>
          <p className="text-[10px] text-ink-light">
            {isTa ? "மதிப்பிடப்பட்ட வருவாய்:" : "Gross Realization:"} ₹{economics.totalMilkRevenueRs.toLocaleString()}
          </p>
        </div>

        <div className="card p-4 bg-forest-50/70 border-forest-100 space-y-1">
          <span className="text-[11px] font-semibold text-forest-700 uppercase flex items-center gap-1">
            <TrendingUp size={12} /> {isTa ? "கால்நடை நிகர வருமானம்" : "Dairy Net Income"}
          </span>
          <div className="text-xl font-bold text-forest-800">
            ₹{economics.livestockNetIncomeRs.toLocaleString()}
          </div>
          <p className="text-[10px] text-ink-light">
            {isTa ? "தீவனச் செலவு கழித்த பின்" : "After feed and maintenance"}
          </p>
        </div>

        <div className="card p-4 bg-gradient-to-br from-forest-800 to-forest-900 text-cream-50 border-forest-700 space-y-1">
          <span className="text-[11px] font-semibold text-forest-200 uppercase flex items-center gap-1">
            <DollarSign size={12} /> {isTa ? "ஒருங்கிணைந்த பண்ணை லாபம்" : "Combined Mixed Profit"}
          </span>
          <div className="text-xl font-bold text-white">
            ₹{economics.combinedFarmNetProfitRs.toLocaleString()}
          </div>
          <p className="text-[10px] text-forest-300">
            {isTa ? "பயிர் + பால் பண்ணை ஒருங்கிணைப்பு" : "Crops + Dairy integration"}
          </p>
        </div>
      </div>

      {/* Main Grid: Animals List & Recent Milk Logs */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Animals List */}
        <div className="card p-5 bg-white border-forest-100 space-y-4">
          <h2 className="text-sm font-bold text-ink flex items-center justify-between">
            <span>{isTa ? "பதிவு செய்யப்பட்ட கால்நடைகள்" : "Registered Livestock"}</span>
            <span className="text-xs bg-forest-100 text-forest-800 px-2 py-0.5 rounded-full font-medium">
              {animals.length} {isTa ? "எண்ணிக்கை" : "head"}
            </span>
          </h2>

          <div className="space-y-2.5">
            {animals.length === 0 ? (
              <div className="text-center py-8 text-xs text-ink-lighter">
                {isTa ? "கால்நடைகள் எதுவும் இன்னும் பதிவு செய்யப்படவில்லை." : "No livestock recorded yet."}
              </div>
            ) : (
              animals.map((a) => (
                <div
                  key={a.id}
                  className="p-3.5 rounded-xl border border-forest-100 hover:border-forest-200 transition-all flex items-center justify-between text-xs bg-cream-50/30"
                >
                  <div>
                    <div className="font-semibold text-ink flex items-center gap-1.5">
                      <span className="capitalize">{a.animalType}</span>: {a.breed}
                    </div>
                    <div className="text-ink-lighter text-[11px] mt-0.5">
                      Tag: <span className="font-mono text-ink">{a.tagNameOrNumber}</span> · {a.gender}
                    </div>
                  </div>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-forest-100 text-forest-800">
                    {a.status}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Recent Milk Logs */}
        <div className="card p-5 bg-white border-forest-100 space-y-4">
          <h2 className="text-sm font-bold text-ink flex items-center justify-between">
            <span>{isTa ? "சமீபத்திய பால் உற்பத்தி பதிவுகள்" : "Recent Dairy Milk Logs"}</span>
            <span className="text-xs text-ink-light flex items-center gap-1">
              <Calendar size={12} /> {isTa ? "தினசரி பதிவு" : "Daily Logs"}
            </span>
          </h2>

          <div className="space-y-2">
            {milkLogs.length === 0 ? (
              <div className="text-center py-8 text-xs text-ink-lighter">
                {isTa ? "பால் உற்பத்தி பதிவுகள் எதுவும் இல்லை." : "No milk yield logs recorded."}
              </div>
            ) : (
              milkLogs.slice(0, 6).map((log) => (
                <div
                  key={log.id}
                  className="p-3 rounded-xl border border-forest-100 flex items-center justify-between text-xs bg-white"
                >
                  <div>
                    <div className="font-semibold text-ink">{log.date}</div>
                    <div className="text-[11px] text-ink-lighter">
                      M: {log.morningLitres}L · E: {log.eveningLitres}L
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-forest-800">{log.totalLitres} L</div>
                    <div className="text-[10px] text-ink-light">₹{log.revenueGeneratedRs}</div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Advisory Notice */}
      <div className="p-3.5 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-900 flex items-start gap-2.5">
        <AlertCircle size={16} className="shrink-0 mt-0.5 text-amber-700" />
        <p>
          {isTa
            ? "கால்நடை நோய் மேலாண்மை குறிப்பு: கால்நடைகளுக்கு தடுப்பூசி மற்றும் மருத்துவ சிகிச்சைகளுக்கு எப்போதும் தகுதிவாய்ந்த கால்நடை மருத்துவரை அணுகவும்."
            : "Veterinary Advisory: Always consult a qualified veterinary doctor for vaccinations, deworming schedules, and disease treatments."}
        </p>
      </div>

      {/* Modal: Add Animal */}
      {showAddAnimal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/60 backdrop-blur-sm">
          <form onSubmit={handleCreateAnimal} className="card max-w-md w-full bg-white p-6 rounded-2xl space-y-4">
            <h2 className="text-lg font-bold text-ink">{isTa ? "கால்நடை சேர்" : "Add Livestock Animal"}</h2>
            <div>
              <label className="block text-xs font-medium text-ink-light mb-1">Type</label>
              <select
                value={animalType}
                onChange={(e) => setAnimalType(e.target.value as LivestockAnimalType)}
                className="w-full text-xs p-2.5 rounded-lg border border-forest-200"
              >
                <option value="cow">Cow / பசு</option>
                <option value="buffalo">Buffalo / எருமை</option>
                <option value="goat">Goat / வெள்ளாடு</option>
                <option value="sheep">Sheep / செம்மறியாடு</option>
                <option value="poultry">Poultry / கோழி</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-ink-light mb-1">Breed / இனம்</label>
              <input
                type="text"
                required
                value={breed}
                onChange={(e) => setBreed(e.target.value)}
                placeholder="e.g. Kangayam / Murrah"
                className="w-full text-xs p-2.5 rounded-lg border border-forest-200"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-ink-light mb-1">Tag / ID Number</label>
              <input
                type="text"
                required
                value={tagNumber}
                onChange={(e) => setTagNumber(e.target.value)}
                placeholder="e.g. TN-CBE-042"
                className="w-full text-xs p-2.5 rounded-lg border border-forest-200"
              />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowAddAnimal(false)}
                className="px-4 py-2 text-xs border rounded-xl"
              >
                {t("common.cancel")}
              </button>
              <button type="submit" className="px-5 py-2 text-xs font-semibold bg-forest-600 text-white rounded-xl">
                {t("common.save")}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Modal: Log Milk Yield */}
      {showLogMilk && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/60 backdrop-blur-sm">
          <form onSubmit={handleLogMilk} className="card max-w-md w-full bg-white p-6 rounded-2xl space-y-4">
            <h2 className="text-lg font-bold text-ink">{isTa ? "பால் உற்பத்தி பதிவு" : "Log Daily Milk Yield"}</h2>
            <div>
              <label className="block text-xs font-medium text-ink-light mb-1">Select Animal</label>
              <select
                value={selectedAnimalId}
                onChange={(e) => setSelectedAnimalId(e.target.value)}
                className="w-full text-xs p-2.5 rounded-lg border border-forest-200"
              >
                {animals.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.tagNameOrNumber} ({a.animalType} - {a.breed})
                  </option>
                ))}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-ink-light mb-1">Morning (L)</label>
                <input
                  type="number"
                  step="0.1"
                  required
                  value={morningL}
                  onChange={(e) => setMorningL(Number(e.target.value))}
                  className="w-full text-xs p-2.5 rounded-lg border border-forest-200"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-ink-light mb-1">Evening (L)</label>
                <input
                  type="number"
                  step="0.1"
                  required
                  value={eveningL}
                  onChange={(e) => setEveningL(Number(e.target.value))}
                  className="w-full text-xs p-2.5 rounded-lg border border-forest-200"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-ink-light mb-1">Selling Price (₹ / Litre)</label>
              <input
                type="number"
                required
                value={pricePerLitre}
                onChange={(e) => setPricePerLitre(Number(e.target.value))}
                className="w-full text-xs p-2.5 rounded-lg border border-forest-200"
              />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowLogMilk(false)}
                className="px-4 py-2 text-xs border rounded-xl"
              >
                {t("common.cancel")}
              </button>
              <button type="submit" className="px-5 py-2 text-xs font-semibold bg-forest-600 text-white rounded-xl">
                {t("common.save")}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
