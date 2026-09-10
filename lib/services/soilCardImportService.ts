import type { SoilReport } from "@/types";

// ─────────────────────────────────────────────
// Phase 46: Soil Health Card File Import & Validation Service
// Parses and validates laboratory CSV/JSON reports into persistent Soil Reports
// ─────────────────────────────────────────────

export interface RawSoilCardPayload {
  farmId: string;
  farmName?: string;
  sampleDate?: string;
  ph?: number | string;
  nitrogen?: number | string;
  phosphorus?: number | string;
  potassium?: number | string;
  ec?: number | string;
  organicCarbon?: number | string;
  soilType?: string;
  testingLabName?: string;
  notes?: string;
}

export interface SoilImportResult {
  success: boolean;
  importedReport?: SoilReport;
  validationErrors: string[];
}

export function parseAndValidateSoilCard(
  ownerId: string,
  raw: RawSoilCardPayload
): SoilImportResult {
  const errors: string[] = [];

  const phNum = raw.ph !== undefined && raw.ph !== "" ? Number(raw.ph) : undefined;
  if (phNum !== undefined && (isNaN(phNum) || phNum < 3.0 || phNum > 11.0)) {
    errors.push("pH value must be between 3.0 and 11.0");
  }

  const nNum = raw.nitrogen !== undefined && raw.nitrogen !== "" ? Number(raw.nitrogen) : undefined;
  if (nNum !== undefined && (isNaN(nNum) || nNum < 0 || nNum > 2000)) {
    errors.push("Nitrogen (N) must be between 0 and 2000 ppm (or kg/ha)");
  }

  const pNum = raw.phosphorus !== undefined && raw.phosphorus !== "" ? Number(raw.phosphorus) : undefined;
  if (pNum !== undefined && (isNaN(pNum) || pNum < 0 || pNum > 1000)) {
    errors.push("Phosphorus (P) must be between 0 and 1000 ppm");
  }

  const kNum = raw.potassium !== undefined && raw.potassium !== "" ? Number(raw.potassium) : undefined;
  if (kNum !== undefined && (isNaN(kNum) || kNum < 0 || kNum > 2500)) {
    errors.push("Potassium (K) must be between 0 and 2500 ppm");
  }

  const ocNum = raw.organicCarbon !== undefined && raw.organicCarbon !== "" ? Number(raw.organicCarbon) : undefined;
  if (ocNum !== undefined && (isNaN(ocNum) || ocNum < 0 || ocNum > 10.0)) {
    errors.push("Organic Carbon (OC) must be between 0% and 10.0%");
  }

  if (errors.length > 0) {
    return { success: false, validationErrors: errors };
  }

  const report: SoilReport = {
    id: `soil_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
    ownerId,
    farmId: raw.farmId || "farm_main",
    farmName: raw.farmName || "Imported Lab Sample",
    sampleDate: raw.sampleDate || new Date().toISOString().slice(0, 10),
    ph: phNum,
    nitrogen: nNum,
    phosphorus: pNum,
    potassium: kNum,
    ec: raw.ec !== undefined ? Number(raw.ec) : undefined,
    organicCarbon: ocNum,
    soilType: raw.soilType || "Loamy",
    notes: `Imported from Lab: ${raw.testingLabName || "Government Soil Testing Laboratory"}. ${raw.notes || ""}`.trim(),
    recommendationSummary: [
      phNum && phNum < 6.0 ? "Apply agricultural lime to raise soil pH." : "Maintain current balanced fertigation.",
      ocNum && ocNum < 0.5 ? "Incorporate 5 tonnes/acre of well-decomposed farmyard manure." : "Soil organic matter is in good range.",
    ],
    createdAt: new Date().toISOString(),
  };

  return {
    success: true,
    importedReport: report,
    validationErrors: [],
  };
}

export function parseCsvSoilCardString(
  ownerId: string,
  farmId: string,
  csvText: string
): SoilImportResult {
  try {
    const lines = csvText.trim().split("\n");
    if (lines.length < 2) {
      return { success: false, validationErrors: ["CSV file is empty or missing data rows."] };
    }

    const headers = lines[0].split(",").map((h) => h.trim().toLowerCase().replace(/['"]/g, ""));
    const values = lines[1].split(",").map((v) => v.trim().replace(/['"]/g, ""));

    const raw: RawSoilCardPayload = { farmId };
    headers.forEach((h, idx) => {
      const val = values[idx];
      if (!val) return;
      if (h === "ph" || h === "soil_ph" || h === "soil ph") {
        raw.ph = val;
      } else if (h.includes("phos") || h === "p") {
        raw.phosphorus = val;
      } else if (h.includes("nitr") || h === "n") {
        raw.nitrogen = val;
      } else if (h.includes("potas") || h === "k") {
        raw.potassium = val;
      } else if (h === "ec" || h.includes("conduct")) {
        raw.ec = val;
      } else if (h.includes("carbon") || h === "oc") {
        raw.organicCarbon = val;
      } else if (h.includes("date")) {
        raw.sampleDate = val;
      } else if (h.includes("lab")) {
        raw.testingLabName = val;
      }
    });

    return parseAndValidateSoilCard(ownerId, raw);
  } catch (e: any) {
    return { success: false, validationErrors: [`Failed to parse CSV: ${e?.message || "Invalid structure"}`] };
  }
}
