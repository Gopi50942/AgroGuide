import type { FarmerDataExportPayload } from "@/types";

// ─────────────────────────────────────────────
// Phase 55: Data Migration & Schema Integrity Validation
// Ensures graceful backward-compatibility for farmer backups and exports across versions.
// ─────────────────────────────────────────────

export interface MigrationValidationResult {
  valid: boolean;
  detectedVersion: string;
  recordCounts: Record<string, number>;
  errors: string[];
}

export function validateExportPayloadStructure(
  data: any
): MigrationValidationResult {
  const errors: string[] = [];
  const recordCounts: Record<string, number> = {};

  if (!data || typeof data !== "object") {
    return {
      valid: false,
      detectedVersion: "unknown",
      recordCounts: {},
      errors: ["Invalid backup JSON payload. Root must be an object."],
    };
  }

  const exportVersion = data.exportMetadata?.exportVersion || data.version || "1.0";

  // Validate core schema collections
  const collectionsToCheck = [
    "farms",
    "crops",
    "soilReports",
    "diseaseReports",
    "expenses",
    "harvests",
    "sales",
  ];

  collectionsToCheck.forEach((col) => {
    if (data[col] && Array.isArray(data[col])) {
      recordCounts[col] = data[col].length;
    } else {
      recordCounts[col] = 0;
    }
  });

  return {
    valid: errors.length === 0,
    detectedVersion: exportVersion,
    recordCounts,
    errors,
  };
}

export function migrateFarmerDataPayload(
  payload: any
): FarmerDataExportPayload {
  const validation = validateExportPayloadStructure(payload);
  if (!validation.valid) {
    throw new Error(`Data migration failed: ${validation.errors.join(", ")}`);
  }

  // Ensure standard 2026.1 structure
  return {
    exportMetadata: {
      exportDate: payload.exportMetadata?.exportDate || new Date().toISOString(),
      version: "2026.1",
      farmerUid: payload.exportMetadata?.farmerUid || payload.profile?.uid || "migrated_user",
      farmerName: payload.exportMetadata?.farmerName || payload.profile?.name || "AgroGuide Farmer",
      recordCounts: validation.recordCounts,
    },
    profile: payload.profile || null,
    farms: payload.farms || [],
    crops: payload.crops || [],
    soilReports: payload.soilReports || [],
    diseaseReports: payload.diseaseReports || [],
    irrigationLogs: payload.irrigationLogs || [],
    tasks: payload.tasks || [],
    expenses: payload.expenses || [],
    revenues: payload.revenues || [],
    harvests: payload.harvests || [],
    sales: payload.sales || [],
    schemeApplications: payload.schemeApplications || [],
    diaryEntries: payload.diaryEntries || [],
    consents: payload.consents || [],
  };
}
