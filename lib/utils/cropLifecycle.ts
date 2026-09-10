import type { Crop, CropStage } from "@/types";

// ─────────────────────────────────────────────
// Crop lifecycle is derived from the farmer's own sowing/expected-harvest
// dates — never hardcoded per farmer. We don't have a real agronomic
// database of per-crop-variety stage durations, so the stage is
// interpolated as a fraction of the farmer-entered sowing→harvest
// window. This is an approximation (labeled as such in the UI), not a
// fabricated "Day 42 / Flowering" for every farmer.
// ─────────────────────────────────────────────

export const STAGE_ORDER: CropStage[] = [
  "land_preparation",
  "seed_selection",
  "sowing",
  "germination",
  "vegetative",
  "flowering",
  "fruiting",
  "maturity",
  "harvest",
  "post_harvest",
];

export interface CropProgress {
  dayNumber: number;
  stage: CropStage;
  /** true when the stage was interpolated from dates rather than read from stored data */
  isEstimated: boolean;
}

function daysBetween(a: number, b: number): number {
  return Math.round((b - a) / 86400000);
}

export function computeCropProgress(crop: Pick<Crop, "sowingDate" | "expectedHarvestDate" | "stage" | "dayNumber">): CropProgress {
  const sowing = crop.sowingDate ? new Date(crop.sowingDate).getTime() : NaN;
  const now = Date.now();

  if (!Number.isFinite(sowing)) {
    return { dayNumber: crop.dayNumber ?? 0, stage: crop.stage, isEstimated: false };
  }

  const dayNumber = Math.max(0, daysBetween(sowing, now));
  const harvest = crop.expectedHarvestDate ? new Date(crop.expectedHarvestDate).getTime() : NaN;

  if (!Number.isFinite(harvest) || harvest <= sowing) {
    // No usable harvest date to interpolate against — fall back to whatever stage is stored.
    return { dayNumber, stage: crop.stage, isEstimated: false };
  }

  const totalDays = daysBetween(sowing, harvest);
  const fraction = Math.min(1, dayNumber / totalDays);
  const idx = Math.min(STAGE_ORDER.length - 1, Math.floor(fraction * STAGE_ORDER.length));

  return { dayNumber, stage: STAGE_ORDER[idx], isEstimated: true };
}
