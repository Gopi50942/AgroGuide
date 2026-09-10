import { createOwned, listOwned, removeOwned } from "@/lib/firebase/firestore";
import type { CropStage } from "@/types";

// ─────────────────────────────────────────────
// Agronomic Water Budget & Irrigation Volume Engine
// Based on FAO-56 Single Crop Coefficient (Kc) methodology.
// Evaluates crop stage demand, forecast rain offset, and irrigation efficiency.
// ─────────────────────────────────────────────

export interface WaterBudgetInput {
  cropName: string;
  stage?: CropStage;
  areaAcres: number;
  soilType?: string;
  irrigationMethod?: string;
  temperatureC?: number;
  humidity?: number;
  rainProbability?: number;
}

export interface WaterBudgetResult {
  et0MmPerDay: number; // Reference Evapotranspiration
  kc: number; // Crop coefficient
  etcMmPerDay: number; // Crop Evapotranspiration (mm/day)
  effectiveRainMm: number; // Forecast rainfall offset (mm/day)
  netDemandMm: number; // Net water required (mm/day)
  dailyVolumeLitres: number; // Total volume required per day
  litresPerAcre: number; // Volume per acre
  irrigationEfficiencyPercent: number;
  status: "needed" | "minimal" | "not_needed";
  recommendationEn: string;
  recommendationTa: string;
}

export interface IrrigationLog {
  id: string;
  ownerId: string;
  farmId?: string;
  cropId?: string;
  cropName?: string;
  date: string;
  method: string;
  durationMinutes?: number;
  estimatedVolumeLitres?: number;
  notes?: string;
  createdAt: string;
  updatedAt?: string;
}

/**
 * Get FAO-56 Crop Coefficient (Kc) based on crop type & growth stage
 */
export function getCropKc(cropName: string, stage?: CropStage): number {
  const norm = cropName.toLowerCase();

  // Stage mapping to FAO growth stages: initial, crop development, mid-season, late
  let stageFactor = 0.75; // default mid-growth

  if (stage === "land_preparation" || stage === "seed_selection") stageFactor = 0.3;
  else if (stage === "sowing" || stage === "germination") stageFactor = 0.45;
  else if (stage === "vegetative") stageFactor = 0.75;
  else if (stage === "flowering" || stage === "fruiting") stageFactor = 1.15;
  else if (stage === "maturity") stageFactor = 0.8;
  else if (stage === "harvest" || stage === "post_harvest") stageFactor = 0.4;

  if (norm.includes("paddy") || norm.includes("rice") || norm.includes("நெல்")) {
    return Math.min(1.3, stageFactor * 1.25);
  }
  if (norm.includes("banana") || norm.includes("வாழை") || norm.includes("sugarcane")) {
    return Math.min(1.2, stageFactor * 1.15);
  }
  if (norm.includes("tomato") || norm.includes("chilli") || norm.includes("தக்காளி")) {
    return Math.min(1.15, stageFactor * 1.05);
  }

  return stageFactor;
}

export function getIrrigationEfficiency(method?: string): number {
  if (!method) return 0.7; // default 70%
  const norm = method.toLowerCase();
  if (norm.includes("drip") || norm.includes("சொட்டு")) return 0.9;
  if (norm.includes("sprinkler") || norm.includes("தெளிப்பு")) return 0.75;
  if (norm.includes("flood") || norm.includes("furrow") || norm.includes("கால்வாய்")) return 0.6;
  return 0.7;
}

/**
 * Approximate Reference Evapotranspiration (ET0) using temperature and humidity
 */
export function estimateEt0(temperatureC: number = 28, humidity: number = 65): number {
  // Typical tropical agricultural ET0 ranges from 3.5mm/day to 6.5mm/day
  const tempFactor = (temperatureC - 20) * 0.15;
  const humidityFactor = (100 - humidity) * 0.02;
  const et0 = 3.5 + Math.max(0, tempFactor) + Math.max(0, humidityFactor);
  return Number(Math.min(7.5, Math.max(2.5, et0)).toFixed(1));
}

/**
 * Compute agricultural water demand & volume conversion
 */
export function calculateWaterBudget(input: WaterBudgetInput): WaterBudgetResult {
  const area = Math.max(0.1, input.areaAcres || 1);
  const et0 = estimateEt0(input.temperatureC ?? 30, input.humidity ?? 60);
  const kc = getCropKc(input.cropName, input.stage);
  const etc = Number((et0 * kc).toFixed(1));

  // Rain offset estimate
  const rainProb = input.rainProbability ?? 0;
  const effectiveRain = rainProb >= 70 ? 12 : rainProb >= 40 ? 4 : 0;

  const netDemandMm = Number(Math.max(0, etc - effectiveRain).toFixed(1));
  const efficiency = getIrrigationEfficiency(input.irrigationMethod);

  // 1 mm of water over 1 acre = 4,046.86 Litres
  const rawLitresPerAcre = netDemandMm * 4047;
  const litresPerAcre = Math.round(rawLitresPerAcre / efficiency);
  const dailyVolumeLitres = Math.round(litresPerAcre * area);

  let status: "needed" | "minimal" | "not_needed" = "needed";
  let recommendationEn = `Apply approx. ${dailyVolumeLitres.toLocaleString("en-IN")} Litres today (${litresPerAcre.toLocaleString("en-IN")} L/acre) via ${input.irrigationMethod || "your irrigation system"}.`;
  let recommendationTa = `இன்று உங்கள் ${input.irrigationMethod || "பாசன அமைப்பு"} மூலம் சுமார் ${dailyVolumeLitres.toLocaleString("en-IN")} லிட்டர் (${litresPerAcre.toLocaleString("en-IN")} லி/ஏக்கர்) நீர் பாய்ச்சவும்.`;

  if (netDemandMm === 0 || rainProb >= 70) {
    status = "not_needed";
    recommendationEn = "Rainfall contribution is expected to satisfy crop moisture demand today. Postpone scheduled irrigation.";
    recommendationTa = "இன்றைய மழை வாய்ப்பு பயிரின் ஈரப்பத தேவையை பூர்த்தி செய்யும் என எதிர்பார்க்கப்படுகிறது. திட்டமிட்ட பாசனத்தை ஒத்திவைக்கவும்.";
  } else if (netDemandMm < 1.5) {
    status = "minimal";
    recommendationEn = "Crop water demand is low today. Light surface wetting is sufficient.";
    recommendationTa = "இன்றைய பயிர் நீர் தேவை குறைவாக உள்ளது. லேசான பாசனம் போதுமானது.";
  }

  return {
    et0MmPerDay: et0,
    kc,
    etcMmPerDay: etc,
    effectiveRainMm: effectiveRain,
    netDemandMm,
    dailyVolumeLitres,
    litresPerAcre,
    irrigationEfficiencyPercent: Math.round(efficiency * 100),
    status,
    recommendationEn,
    recommendationTa,
  };
}

// ─────────────────────────────────────────────
// Firestore Irrigation Log CRUD
// ─────────────────────────────────────────────

export async function listIrrigationLogs(ownerId: string): Promise<IrrigationLog[]> {
  const logs = await listOwned<IrrigationLog>("irrigation_logs", ownerId);
  return logs.sort((a, b) => b.date.localeCompare(a.date));
}

export async function addIrrigationLog(
  ownerId: string,
  log: Omit<IrrigationLog, "id" | "ownerId">
): Promise<string> {
  return createOwned("irrigation_logs", ownerId, {
    ...log,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  } as unknown as Record<string, unknown>);
}

export async function removeIrrigationLog(id: string): Promise<void> {
  return removeOwned("irrigation_logs", id);
}
