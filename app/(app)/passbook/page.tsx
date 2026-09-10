"use client";

import { useEffect, useState } from "react";
import {
  BookOpen,
  Printer,
  Sprout,
  DollarSign,
  Award,
  Calendar,
  FileCheck,
  CheckCircle2,
  Download,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useLanguage } from "@/hooks/useLanguage";
import { getFarmerPassbookData } from "@/lib/services/farmerPassbookService";
import type { FarmerPassbookData } from "@/types";

export default function FarmerPassbookPage() {
  const { profile } = useAuth();
  const { t, language } = useLanguage();
  const [data, setData] = useState<FarmerPassbookData | null>(null);

  useEffect(() => {
    getFarmerPassbookData(profile?.uid || "farmer_gopi_cbe").then(setData);
  }, [profile]);

  const handlePrint = () => {
    window.print();
  };

  return (
    <main className="space-y-6 max-w-5xl mx-auto pb-12">
      {/* Top Action Bar */}
      <div className="card p-6 bg-gradient-to-r from-forest-800 to-forest-950 text-cream-50 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border border-forest-700 shadow-md">
        <div>
          <div className="flex items-center gap-2.5">
            <BookOpen className="text-earth-300" size={26} />
            <h1 className="text-2xl font-bold tracking-tight">
              {language === "ta" ? "விவசாயி ஒருங்கிணைந்த பண்ணைப் புத்தகம்" : "Farmer Unified Agriculture Passbook"}
            </h1>
          </div>
          <p className="text-sm text-cream-200/80 mt-1">
            {language === "ta"
              ? "உங்கள் நிலம், பயிர் வரலாறு, மண் ஆரோக்கியம் மற்றும் அரசுத் திட்டங்களின் முழுமையான ஆவணம்"
              : "Unified record of your farm holdings, crop history, soil health, and government services"}
          </p>
        </div>

        <button
          onClick={handlePrint}
          className="flex items-center gap-2 px-4 py-2 bg-earth-600 hover:bg-earth-500 text-white rounded-xl text-xs font-semibold self-start sm:self-auto transition-colors"
        >
          <Printer size={15} />
          {language === "ta" ? "அச்சிடுக / PDF பதிவிறக்கம்" : "Print / Export PDF"}
        </button>
      </div>

      {data && (
        <div className="space-y-6">
          {/* Identity & Farm Holdings Summary Card */}
          <div className="card p-6 border border-forest-100 bg-white space-y-4">
            <div className="border-b border-forest-100 pb-3 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-ink">{data.farmerName}</h2>
                <p className="text-xs text-ink-light font-mono">ID: {data.farmerId} • {data.village}, {data.district}</p>
              </div>
              <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 font-bold text-xs">
                {data.totalAcres} Acres Registered
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
              <div className="p-3 bg-cream-50 rounded-xl border border-forest-100/60">
                <p className="text-ink-light">Active Farms</p>
                <p className="text-xl font-bold text-forest-800 mt-0.5">{data.activeFarmsCount}</p>
              </div>
              <div className="p-3 bg-cream-50 rounded-xl border border-forest-100/60">
                <p className="text-ink-light">Soil Tests Verified</p>
                <p className="text-xl font-bold text-forest-800 mt-0.5">{data.soilReportsCount}</p>
              </div>
              <div className="p-3 bg-cream-50 rounded-xl border border-forest-100/60">
                <p className="text-ink-light">Tasks Completed</p>
                <p className="text-xl font-bold text-forest-800 mt-0.5">{data.tasksCompletedCount}</p>
              </div>
              <div className="p-3 bg-cream-50 rounded-xl border border-forest-100/60">
                <p className="text-ink-light">Government Schemes</p>
                <p className="text-xl font-bold text-forest-800 mt-0.5">{data.schemesEnrolledCount}</p>
              </div>
            </div>
          </div>

          {/* Current Season Crops & Production */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="card p-5 border border-forest-100 bg-white space-y-3">
              <h3 className="text-sm font-bold text-ink flex items-center gap-2">
                <Sprout size={16} className="text-forest-600" />
                Active Crop Portfolio
              </h3>
              <div className="space-y-2 text-xs">
                {data.activeCrops.map((c, i) => (
                  <div key={i} className="p-3 rounded-xl bg-cream-50 border border-forest-100/60 flex items-center justify-between">
                    <span className="font-bold text-ink">{c}</span>
                    <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-semibold text-[10px]">
                      Kharif 2026
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="card p-5 border border-forest-100 bg-white space-y-3">
              <h3 className="text-sm font-bold text-ink flex items-center gap-2">
                <DollarSign size={16} className="text-emerald-600" />
                Financial & Harvest Performance
              </h3>
              <div className="space-y-2 text-xs">
                <div className="p-3 rounded-xl bg-cream-50 border border-forest-100/60 flex items-center justify-between">
                  <span className="text-ink-light">Total Crop Harvest:</span>
                  <strong className="text-ink">{data.totalHarvestQuintals} Quintals</strong>
                </div>
                <div className="p-3 rounded-xl bg-cream-50 border border-forest-100/60 flex items-center justify-between">
                  <span className="text-ink-light">Total Sales Revenue:</span>
                  <strong className="text-emerald-700 font-bold">₹{data.totalSalesRevenueRs.toLocaleString()}</strong>
                </div>
                <div className="p-3 rounded-xl bg-cream-50 border border-forest-100/60 flex items-center justify-between">
                  <span className="text-ink-light">Seasonal Expenses:</span>
                  <strong className="text-rust-700">₹{data.totalExpensesRs.toLocaleString()}</strong>
                </div>
                <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-between">
                  <span className="text-emerald-900 font-semibold">Estimated Net Operating Surplus:</span>
                  <strong className="text-emerald-900 font-bold">
                    ₹{(data.totalSalesRevenueRs - data.totalExpensesRs).toLocaleString()}
                  </strong>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
