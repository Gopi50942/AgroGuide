import { describe, it, expect } from "vitest";
import {
  validateExportPayloadStructure,
  migrateFarmerDataPayload,
} from "@/lib/services/dataMigrationService";

describe("Phase 55 — Data Migration & Schema Integrity", () => {
  it("validates well-formed backup payloads and extracts record tallies", () => {
    const payload = {
      exportMetadata: { exportVersion: "1.0", farmerUid: "uid_123" },
      profile: { name: "Farmer Murugan" },
      farms: [{ id: "f1", name: "North Farm" }],
      crops: [{ id: "c1", name: "Tomato" }],
      soilReports: [],
      diseaseReports: [],
      expenses: [{ id: "e1", amount: 1500 }],
      harvests: [],
      sales: [],
    };

    const val = validateExportPayloadStructure(payload);
    expect(val.valid).toBe(true);
    expect(val.recordCounts.farms).toBe(1);
    expect(val.recordCounts.crops).toBe(1);
    expect(val.recordCounts.expenses).toBe(1);
  });

  it("migrates legacy export payload into standardized 2026.1 structure", () => {
    const legacy = {
      profile: { uid: "user_777", name: "Legacy User" },
      farms: [{ id: "farm_01", name: "Old Farm" }],
    };

    const migrated = migrateFarmerDataPayload(legacy);
    expect(migrated.exportMetadata.version).toBe("2026.1");
    expect(migrated.farms.length).toBe(1);
    expect(Array.isArray(migrated.soilReports)).toBe(true);
    expect(Array.isArray(migrated.expenses)).toBe(true);
  });
});
