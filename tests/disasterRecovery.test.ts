import { describe, it, expect } from "vitest";
import {
  generateBackupManifest,
  simulateRestoreValidation,
} from "@/lib/services/disasterRecoveryService";
import type { FarmerDataExportPayload } from "@/types";

describe("Phase 79 — Disaster Recovery & Backup Validation", () => {
  it("generates structured backup manifest with owner-isolated collection inventories", () => {
    const manifest = generateBackupManifest();
    expect(manifest.manifestVersion).toBe("2026.1");
    expect(manifest.collectionsInventory.length).toBeGreaterThanOrEqual(10);
    expect(manifest.collectionsInventory.every((c) => c.isOwnerIsolated)).toBe(true);
  });

  it("validates safe restore simulation for complete export payloads", () => {
    const payload: FarmerDataExportPayload = {
      exportMetadata: {
        exportDate: "2026-06-25",
        version: "2026.1",
        farmerUid: "uid_001",
        farmerName: "Farmer Kumar",
        recordCounts: { farms: 2, crops: 3 },
      },
      profile: { uid: "uid_001", name: "Farmer Kumar" } as any,
      farms: [{ id: "f1" }, { id: "f2" }] as any,
      crops: [{ id: "c1" }, { id: "c2" }, { id: "c3" }] as any,
      soilReports: [],
      diseaseReports: [],
      irrigationLogs: [],
      tasks: [],
      expenses: [],
      revenues: [],
      harvests: [],
      sales: [],
      schemeApplications: [],
      diaryEntries: [],
      consents: [],
    };

    const res = simulateRestoreValidation(payload);
    expect(res.canRestoreSafely).toBe(true);
    expect(res.itemCounts.farms).toBe(2);
    expect(res.itemCounts.crops).toBe(3);
  });
});
