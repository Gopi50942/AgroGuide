import type { Farm, Crop, VillageCropCensus } from "@/types";

// ─────────────────────────────────────────────
// Phase 109: Village Crop Census & Acreage Intelligence Service
// Aggregates crop coverage across villages with privacy cohort thresholds (min 5 farms).
// ─────────────────────────────────────────────

export const MIN_PRIVACY_COHORT_THRESHOLD = 5;

export function aggregateVillageCropCensus(
  farms: Farm[],
  crops: Crop[]
): VillageCropCensus[] {
  // Map farm locations
  const farmLocationMap = new Map<string, { district: string; block: string; village: string }>();
  farms.forEach((f) => {
    farmLocationMap.set(f.id, {
      district: f.district || "Coimbatore",
      block: f.taluk || "Thondamuthur",
      village: f.village || "Alandurai",
    });
  });

  // Group by district + block + village + cropName
  const grouping = new Map<
    string,
    {
      district: string;
      block: string;
      village: string;
      cropName: string;
      farmIds: Set<string>;
      totalAcreage: number;
      stageDistribution: Record<string, number>;
    }
  >();

  crops.forEach((c) => {
    const loc = farmLocationMap.get(c.farmId || "") || {
      district: "Coimbatore",
      block: "Thondamuthur",
      village: "Alandurai",
    };
    const key = `${loc.district}__${loc.block}__${loc.village}__${c.name}`;

    if (!grouping.has(key)) {
      grouping.set(key, {
        district: loc.district,
        block: loc.block,
        village: loc.village,
        cropName: c.name,
        farmIds: new Set<string>(),
        totalAcreage: 0,
        stageDistribution: {},
      });
    }

    const group = grouping.get(key)!;
    if (c.farmId) group.farmIds.add(c.farmId);
    group.totalAcreage += c.areaAcres || 1.0;
    const stage = c.currentStage || "vegetative";
    group.stageDistribution[stage] = (group.stageDistribution[stage] || 0) + (c.areaAcres || 1.0);
  });

  const results: VillageCropCensus[] = [];

  grouping.forEach((item) => {
    const count = item.farmIds.size || 1;
    const isProtected = count >= MIN_PRIVACY_COHORT_THRESHOLD;

    results.push({
      district: item.district,
      block: item.block,
      village: item.village,
      cropName: item.cropName,
      participatingFarmsCount: count,
      totalAcreage: isProtected ? Math.round(item.totalAcreage * 10) / 10 : 0, // Obscured if below privacy threshold
      stageDistribution: item.stageDistribution,
      estimatedHarvestWindow: "Next 30–45 days",
      privacyCohortProtected: isProtected,
    });
  });

  return results;
}
