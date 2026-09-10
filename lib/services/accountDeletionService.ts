import {
  collection,
  getDocs,
  query,
  where,
  deleteDoc,
  doc,
  writeBatch,
} from "firebase/firestore";
import { deleteUser, type User } from "firebase/auth";
import { getFirebaseDb, isFirebaseConfigured } from "@/lib/firebase/config";
import { logAuditEvent } from "./auditLogService";

const USER_COLLECTIONS = [
  "farms",
  "farmer_loans",
  "crops",
  "crop_tasks",
  "soil_reports",
  "weather_preferences",
  "notifications",
  "chat_sessions",
  "chat_messages",
  "disease_reports",
  "expenses",
  "revenues",
  "farm_diary",
  "harvest_records",
  "produce_sales",
  "market_watchlists",
  "scheme_applications",
  "irrigation_logs",
  "user_consents",
  "audit_logs",
  "community_posts",
  "community_comments",
];

export interface DeletionResult {
  success: boolean;
  deletedCollections: string[];
  recordsDeleted: number;
  authDeleted: boolean;
  error?: string;
}

/**
 * Executes full cascading deletion of all private data owned by the authenticated farmer.
 */
export async function executeAccountDeletion(
  authUser: User | null,
  isDemoMode: boolean = false
): Promise<DeletionResult> {
  if (!authUser) {
    return {
      success: false,
      deletedCollections: [],
      recordsDeleted: 0,
      authDeleted: false,
      error: "No authenticated user session found.",
    };
  }

  const uid = authUser.uid;
  let totalDeleted = 0;
  const processedCollections: string[] = [];

  // Log deletion intention
  await logAuditEvent(uid, "ACCOUNT_DELETION_REQUESTED", "account", uid, {}, "web", isDemoMode);

  if (isDemoMode || !isFirebaseConfigured) {
    try {
      // Clear demo storage keys
      Object.keys(localStorage).forEach((key) => {
        if (key.includes(uid) || key.startsWith("agroguide_demo_")) {
          localStorage.removeItem(key);
          totalDeleted++;
        }
      });
      return {
        success: true,
        deletedCollections: ["local_demo_storage"],
        recordsDeleted: totalDeleted,
        authDeleted: true,
      };
    } catch (e: any) {
      return {
        success: false,
        deletedCollections: [],
        recordsDeleted: 0,
        authDeleted: false,
        error: e?.message || "Failed to clear demo data.",
      };
    }
  }

  const db = getFirebaseDb();
  if (!db) {
    return {
      success: false,
      deletedCollections: [],
      recordsDeleted: 0,
      authDeleted: false,
      error: "Database unavailable.",
    };
  }

  try {
    // 1. Delete documents from all owner-scoped collections in batches
    for (const colName of USER_COLLECTIONS) {
      try {
        const q = query(collection(db, colName), where("ownerId", "==", uid));
        const snapshot = await getDocs(q);

        if (!snapshot.empty) {
          const batch = writeBatch(db);
          snapshot.docs.forEach((d) => {
            batch.delete(d.ref);
            totalDeleted++;
          });
          await batch.commit();
          processedCollections.push(colName);
        }
      } catch (colErr) {
        console.warn(`Error deleting collection ${colName}:`, colErr);
      }
    }

    // 2. Delete main user profile document (/users/{uid})
    try {
      const userProfileRef = doc(db, "users", uid);
      await deleteDoc(userProfileRef);
      totalDeleted++;
      processedCollections.push("users");
    } catch {}

    // 3. Delete Firebase Auth account
    let authDeleted = false;
    try {
      await deleteUser(authUser);
      authDeleted = true;
    } catch (authErr: any) {
      // If requires-recent-login, bubble helpful error to user
      if (authErr?.code === "auth/requires-recent-login") {
        return {
          success: false,
          deletedCollections: processedCollections,
          recordsDeleted: totalDeleted,
          authDeleted: false,
          error: "REAUTH_REQUIRED",
        };
      }
      throw authErr;
    }

    return {
      success: true,
      deletedCollections: processedCollections,
      recordsDeleted: totalDeleted,
      authDeleted,
    };
  } catch (error: any) {
    return {
      success: false,
      deletedCollections: processedCollections,
      recordsDeleted: totalDeleted,
      authDeleted: false,
      error: error?.message || "Failed to complete account deletion.",
    };
  }
}
