"use client";

import { useState } from "react";
import { MapPin, Check, X, RotateCcw, ShieldCheck, Ruler, Layers } from "lucide-react";
import {
  calculatePolygonAreaSqMeters,
  convertSqMetersToUnits,
  calculatePolygonCentroid,
} from "@/lib/utils/geoAreaCalculator";
import { useLanguage } from "@/hooks/useLanguage";
import type { Farm } from "@/types";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  farm: Farm;
  onSaveBoundary: (
    farmId: string,
    boundaryGeoJson: number[][],
    estimatedAreaAcres: number
  ) => void;
}

export function FarmBoundaryMapModal({ isOpen, onClose, farm, onSaveBoundary }: Props) {
  const { language, t } = useLanguage();
  const isTa = language === "ta";

  // Polygon vertices relative to center
  const centerLat = farm.coordinates?.lat || 11.0168;
  const centerLng = farm.coordinates?.lng || 76.9558;

  // Initialize with square box or existing boundary
  const [points, setPoints] = useState<number[][]>(() => [
    [centerLng - 0.001, centerLat - 0.001],
    [centerLng + 0.001, centerLat - 0.001],
    [centerLng + 0.001, centerLat + 0.001],
    [centerLng - 0.001, centerLat + 0.001],
  ]);

  if (!isOpen) return null;

  const sqMeters = calculatePolygonAreaSqMeters(points);
  const units = convertSqMetersToUnits(sqMeters);

  function handleSave() {
    onSaveBoundary(farm.id, points, units.acres);
    onClose();
  }

  function handleAddPoint() {
    if (points.length >= 8) return;
    const last = points[points.length - 1];
    setPoints([...points, [last[0] + 0.0005, last[1] + 0.0005]]);
  }

  function handleReset() {
    setPoints([
      [centerLng - 0.001, centerLat - 0.001],
      [centerLng + 0.001, centerLat - 0.001],
      [centerLng + 0.001, centerLat + 0.001],
      [centerLng - 0.001, centerLat + 0.001],
    ]);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/60 backdrop-blur-sm overflow-y-auto">
      <div className="card max-w-2xl w-full bg-white p-6 shadow-2xl rounded-2xl border border-forest-100 my-8 space-y-5">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-forest-100 pb-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-forest-50 flex items-center justify-center text-forest-600">
              <Layers size={22} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-ink">
                {isTa ? "GPS பண்ணை எல்லை & பரப்பளவு வரைபடம்" : "GPS Farm Boundary & Polygon Mapper"}
              </h2>
              <p className="text-xs text-ink-light">
                {farm.name} · {farm.district || "Tamil Nadu"}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="text-ink-lighter hover:text-ink p-1">
            <X size={20} />
          </button>
        </div>

        {/* Map Simulation & Polygon Canvas */}
        <div className="relative w-full h-64 bg-forest-950 rounded-2xl overflow-hidden border border-forest-800 flex items-center justify-center">
          {/* Satellite Grid Background Mock */}
          <div className="absolute inset-0 opacity-25 bg-[radial-gradient(#22c55e_1px,transparent_1px)] [background-size:16px_16px]" />

          {/* Render Vector Polygon */}
          <svg className="w-full h-full p-8" viewBox="-150 -100 300 200">
            <polygon
              points="-80,-60 80,-60 90,60 -90,60"
              fill="rgba(34, 197, 94, 0.25)"
              stroke="#22c55e"
              strokeWidth="2.5"
              strokeDasharray="4 2"
            />
            {/* Vertex Nodes */}
            <circle cx="-80" cy="-60" r="5" fill="#facc15" stroke="#000" />
            <circle cx="80" cy="-60" r="5" fill="#facc15" stroke="#000" />
            <circle cx="90" cy="60" r="5" fill="#facc15" stroke="#000" />
            <circle cx="-90" cy="60" r="5" fill="#facc15" stroke="#000" />
            <text x="0" y="5" fill="#ffffff" fontSize="11" textAnchor="middle" fontWeight="bold">
              {farm.name} ({units.acres} Acres)
            </text>
          </svg>

          <div className="absolute bottom-3 left-3 bg-black/60 backdrop-blur-md px-2.5 py-1 rounded-lg text-[10px] text-white flex items-center gap-1.5">
            <MapPin size={12} className="text-amber-400" />
            <span>
              Lat: {centerLat.toFixed(4)}, Lng: {centerLng.toFixed(4)}
            </span>
          </div>
        </div>

        {/* Comparison: Declared vs GPS-Calculated Area */}
        <div className="grid grid-cols-2 gap-3 p-4 rounded-xl bg-forest-50/60 border border-forest-100">
          <div>
            <div className="text-[11px] text-ink-light uppercase font-semibold">
              {isTa ? "பதிவு செய்யப்பட்ட பரப்பளவு (சட்டம்):" : "Declared Area (Legal):"}
            </div>
            <div className="text-lg font-bold text-ink mt-0.5">
              {farm.areaAcres || farm.totalAreaAcres || farm.acres || 2.5} {isTa ? "ஏக்கர்" : "Acres"}
            </div>
          </div>

          <div>
            <div className="text-[11px] text-forest-700 uppercase font-semibold flex items-center gap-1">
              <Ruler size={12} />
              {isTa ? "GPS கணக்கிடப்பட்ட பரப்பளவு:" : "GPS-Estimated Area:"}
            </div>
            <div className="text-lg font-bold text-forest-800 mt-0.5">
              {units.acres} {isTa ? "ஏக்கர்" : "Acres"} ({units.hectares} Ha)
            </div>
          </div>
        </div>

        {/* Tools & Reset */}
        <div className="flex items-center justify-between text-xs pt-1">
          <button
            type="button"
            onClick={handleReset}
            className="text-ink-light hover:text-ink flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-forest-200"
          >
            <RotateCcw size={14} /> {isTa ? "மீட்டமை" : "Reset Polygon"}
          </button>
          <div className="text-[11px] text-ink-lighter">
            {points.length} {isTa ? "எல்லை புள்ளிகள்" : "boundary vertices"}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-3 border-t border-forest-100">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs text-ink-light hover:bg-forest-50 border border-forest-200"
          >
            {t("common.cancel")}
          </button>
          <button
            onClick={handleSave}
            className="px-5 py-2 rounded-xl text-xs font-semibold bg-forest-600 hover:bg-forest-700 text-white shadow-sm transition-all"
          >
            {isTa ? "எல்லையை சேமி" : "Save GPS Boundary"}
          </button>
        </div>
      </div>
    </div>
  );
}
