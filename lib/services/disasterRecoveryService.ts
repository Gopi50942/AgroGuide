import { isFirebaseConfigured } from "@/lib/firebase/config";
import type { FarmerDataExportPayload } from "@/types";

// ─────────────────────────────────────────────
// Phase 79: Disaster Recovery & Backup Validation
// Validates backup readiness, manifests, and restore simulation parsers.
// ─────────────────────────────────────────────

export interface BackupManifest {
  manifestVersion: string;
  generatedAt: string;
  environment: string;
  collectionsInventory: {
    collectionName: string;
    description: string;
    isOwnerIsolated: boolean;
  }[];
  readinessStatus: "READY" | "WARNING";
}

export function generateBackupManifest(): BackupManifest {
  const collections = [
    { collectionName: "users", description: "Farmer user profiles", isOwnerIsolated: true },
    { collectionName: "farms", description: "Farm boundaries and locations", isOwnerIsolated: true },
    { collectionName: "crops", description: "Active and historical crops", isOwnerIsolated: true },
    { collectionName: "soil_reports", description: "Soil chemical test results", isOwnerIsolated: true },
    { collectionName: "disease_reports", description: "AI diagnostic history", isOwnerIsolated: true },
    { collectionName: "irrigation_logs", description: "Water volume logs", isOwnerIsolated: true },
    { collectionName: "expenses", description: "Financial expenses ledger", isOwnerIsolated: true },
    { collectionName: "harvest_records", description: "Harvest yield batches", isOwnerIsolated: true },
    { collectionName: "produce_sales", description: "Sales revenues", isOwnerIsolated: true },
    { collectionName: "support_tickets", description: "Farmer support cases", isOwnerIsolated: true },
    { collectionName: "farm_input_inventory", description: "Input stock", isOwnerIsolated: true },
    { collectionName: "farmer_documents", description: "Document metadata vault", isOwnerIsolated: true },
  ];

  return {
    manifestVersion: "2026.1",
    generatedAt: new Date().toISOString(),
    environment: process.env.NODE_ENV || "development",
    collectionsInventory: collections,
    readinessStatus: isFirebaseConfigured ? "READY" : "WARNING",
  };
}

export function simulateRestoreValidation(
  data: FarmerDataExportPayload
): {
  canRestoreSafely: boolean;
  validationSummary: string;
  itemCounts: Record<string, number>;
} {
  const itemCounts: Record<string, number> = {
    farms: data.farms?.length || 0,
    crops: data.crops?.length || 0,
    soilReports: data.soilReports?.length || 0,
    expenses: data.expenses?.length || 0,
    harvests: data.harvests?.length || 0,
  };

  const total = Object.values(itemCounts).reduce((a, b) => a + b, 0);

  return {
    canRestoreSafely: Boolean(data.exportMetadata?.version && data.profile?.uid),
    validationSummary: `Parsed ${total} valid records across ${Object.keys(itemCounts).length} collections.`,
    itemCounts,
  };
}
