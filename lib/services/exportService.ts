import { collection, getDocs, query, where } from "firebase/firestore";
import { getFirebaseDb, isFirebaseConfigured } from "@/lib/firebase/config";
import { logAuditEvent } from "./auditLogService";
import type { FarmerDataExportPayload, UserProfile } from "@/types";

/**
 * Fetch and bundle all authenticated farmer data into a standardized export object.
 */
export async function generateFarmerDataExport(
  ownerId: string,
  profile: UserProfile | null,
  isDemoMode: boolean = false
): Promise<FarmerDataExportPayload> {
  const timestamp = new Date().toISOString();

  // Helper to fetch collection owned by ownerId
  async function fetchUserCollection(colName: string): Promise<any[]> {
    if (isDemoMode || !isFirebaseConfigured) {
      try {
        const demoData = localStorage.getItem(`agroguide_demo_${colName}_${ownerId}`);
        return demoData ? JSON.parse(demoData) : [];
      } catch {
        return [];
      }
    }

    const db = getFirebaseDb();
    if (!db) return [];

    try {
      const q = query(collection(db, colName), where("ownerId", "==", ownerId));
      const snapshot = await getDocs(q);
      return snapshot.docs.map((d) => {
        const data = d.data();
        // Redact any internal server timestamp fields
        const { serverTime, ...safeData } = data;
        return { id: d.id, ...safeData };
      });
    } catch {
      return [];
    }
  }

  const [
    farms,
    crops,
    soilReports,
    diseaseReports,
    irrigationLogs,
    tasks,
    expenses,
    revenues,
    harvests,
    sales,
    schemeApplications,
    diaryEntries,
    consents,
  ] = await Promise.all([
    fetchUserCollection("farms"),
    fetchUserCollection("crops"),
    fetchUserCollection("soil_reports"),
    fetchUserCollection("disease_reports"),
    fetchUserCollection("irrigation_logs"),
    fetchUserCollection("crop_tasks"),
    fetchUserCollection("expenses"),
    fetchUserCollection("revenues"),
    fetchUserCollection("harvest_records"),
    fetchUserCollection("produce_sales"),
    fetchUserCollection("scheme_applications"),
    fetchUserCollection("farm_diary"),
    fetchUserCollection("user_consents"),
  ]);

  // Clean profile to remove any auth tokens or internal keys
  const safeProfile = profile
    ? {
        uid: profile.uid,
        name: profile.name,
        phone: profile.phone,
        state: profile.state,
        district: profile.district,
        village: profile.location?.village || "",
        landAreaAcres: profile.landAreaAcres,
        preferredLanguage: profile.preferredLanguage,
        soilType: profile.soilType,
        irrigationType: profile.irrigationType,
        farmingType: profile.farmingType,
        experienceYears: profile.experienceYears,
        createdAt: profile.createdAt,
      }
    : null;

  const payload: FarmerDataExportPayload = {
    exportMetadata: {
      exportDate: timestamp,
      version: "2026.1",
      farmerUid: ownerId,
      farmerName: profile?.name || "AgroGuide Farmer",
      recordCounts: {
        farms: farms.length,
        crops: crops.length,
        soilReports: soilReports.length,
        diseaseReports: diseaseReports.length,
        irrigationLogs: irrigationLogs.length,
        tasks: tasks.length,
        expenses: expenses.length,
        revenues: revenues.length,
        harvests: harvests.length,
        sales: sales.length,
        schemeApplications: schemeApplications.length,
        diaryEntries: diaryEntries.length,
      },
    },
    profile: safeProfile,
    farms,
    crops,
    soilReports,
    diseaseReports,
    irrigationLogs,
    tasks,
    expenses,
    revenues,
    harvests,
    sales,
    schemeApplications,
    diaryEntries,
    consents,
  };

  // Log export in audit logs
  await logAuditEvent(
    ownerId,
    "DATA_EXPORT_INITIATED",
    "account",
    ownerId,
    { totalRecords: Object.values(payload.exportMetadata.recordCounts).reduce((a, b) => a + b, 0) },
    "web",
    isDemoMode
  );

  return payload;
}

/**
 * Triggers browser download of data payload in JSON format.
 */
export function downloadJsonExport(data: FarmerDataExportPayload, filenamePrefix = "agroguide_export"): void {
  const jsonStr = JSON.stringify(data, null, 2);
  const blob = new Blob([jsonStr], { type: "application/json;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const dateStr = new Date().toISOString().slice(0, 10);

  const link = document.createElement("a");
  link.href = url;
  link.download = `${filenamePrefix}_${dateStr}.json`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Convert array of objects to downloadable CSV format.
 */
export function convertToCsv<T extends Record<string, any>>(records: T[], columns: { key: keyof T; header: string }[]): string {
  if (!records || records.length === 0) {
    return columns.map((c) => `"${c.header}"`).join(",") + "\n";
  }

  const headerRow = columns.map((c) => `"${c.header.replace(/"/g, '""')}"`).join(",");
  const rows = records.map((r) =>
    columns
      .map((col) => {
        const val = r[col.key];
        if (val === undefined || val === null) return '""';
        const strVal = String(val).replace(/"/g, '""');
        return `"${strVal}"`;
      })
      .join(",")
  );

  return [headerRow, ...rows].join("\n");
}

/**
 * Triggers browser download of a CSV file.
 */
export function downloadCsvExport(csvContent: string, filename: string): void {
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
