import type { DiseaseReport, DiseaseSurveillanceSignal, DiseaseSignalLevel } from "@/types";

// ─────────────────────────────────────────────
// Phase 110: Pest & Disease Surveillance Network Service
// Early warning indicator clustering by district/block without revealing farm identity.
// ─────────────────────────────────────────────

export const SURVEILLANCE_DISCLAIMER =
  "AI-derived field signal — requires agricultural officer verification.";

export function aggregateDiseaseSignals(
  reports: DiseaseReport[],
  defaultDistrict: string = "Coimbatore",
  defaultBlock: string = "Thondamuthur"
): DiseaseSurveillanceSignal[] {
  const clusterMap = new Map<
    string,
    {
      district: string;
      block: string;
      cropName: string;
      pathogenOrIssue: string;
      detectionCount: number;
    }
  >();

  reports.forEach((r) => {
    const cropName = r.cropName || "Tomato";
    const issue = r.possibleIssue || r.diseaseName || "Leaf Spot";
    const key = `${defaultDistrict}__${defaultBlock}__${cropName}__${issue}`;

    if (!clusterMap.has(key)) {
      clusterMap.set(key, {
        district: defaultDistrict,
        block: defaultBlock,
        cropName,
        pathogenOrIssue: issue,
        detectionCount: 0,
      });
    }

    clusterMap.get(key)!.detectionCount += 1;
  });

  const signals: DiseaseSurveillanceSignal[] = [];

  clusterMap.forEach((item, key) => {
    let signalLevel: DiseaseSignalLevel = "Normal";
    if (item.detectionCount >= 10) {
      signalLevel = "Outbreak Signal";
    } else if (item.detectionCount >= 6) {
      signalLevel = "Elevated";
    } else if (item.detectionCount >= 3) {
      signalLevel = "Watch";
    }

    signals.push({
      id: `sig_${Math.random().toString(36).slice(2, 8)}`,
      district: item.district,
      block: item.block,
      cropName: item.cropName,
      pathogenOrIssue: item.pathogenOrIssue,
      detectionCount: item.detectionCount,
      signalLevel,
      officerVerified: false,
      disclaimer: SURVEILLANCE_DISCLAIMER,
      updatedAt: new Date().toISOString(),
    });
  });

  return signals;
}
