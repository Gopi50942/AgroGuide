import {
  collection,
  doc,
  setDoc,
  getDocs,
  query,
  where,
  orderBy,
  limit,
  serverTimestamp,
} from "firebase/firestore";
import { getFirebaseDb, isFirebaseConfigured } from "@/lib/firebase/config";
import type { AuditLogEntry, AuditActionType, AuditEntityType } from "@/types";

const AUDIT_COLLECTION = "audit_logs";

/**
 * Strips any sensitive fields (passwords, tokens, raw prompts, base64 data)
 * to ensure privacy and institutional compliance.
 */
export function sanitizeAuditMetadata(
  meta?: Record<string, any>
): Record<string, string | number | boolean> {
  if (!meta) return {};
  const clean: Record<string, string | number | boolean> = {};

  const SENSITIVE_KEYS = [
    "password",
    "token",
    "secret",
    "key",
    "prompt",
    "image",
    "base64",
    "aadhaar",
    "bank",
    "accountNumber",
    "auth",
  ];

  for (const [key, value] of Object.entries(meta)) {
    const isSensitive = SENSITIVE_KEYS.some((k) => key.toLowerCase().includes(k));
    if (isSensitive) continue;

    if (
      typeof value === "string" ||
      typeof value === "number" ||
      typeof value === "boolean"
    ) {
      // Limit string length to 200 chars to avoid memory/payload bloat
      clean[key] = typeof value === "string" ? value.slice(0, 200) : value;
    }
  }

  return clean;
}

/**
 * Record an immutable audit log entry for sensitive farmer operations.
 */
export async function logAuditEvent(
  ownerId: string,
  action: AuditActionType,
  entityType: AuditEntityType,
  entityId?: string,
  metadata?: Record<string, any>,
  source: "web" | "pwa" | "mobile" = "web",
  isDemoMode: boolean = false
): Promise<void> {
  if (!ownerId) return;

  const safeMeta = sanitizeAuditMetadata(metadata);
  const now = new Date().toISOString();

  if (isDemoMode || !isFirebaseConfigured) {
    try {
      const demoLogsKey = `agroguide_demo_audit_${ownerId}`;
      const existing = JSON.parse(localStorage.getItem(demoLogsKey) || "[]");
      const newEntry: AuditLogEntry = {
        id: `audit_demo_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
        ownerId,
        action,
        entityType,
        entityId,
        timestamp: now,
        source,
        metadataSafe: safeMeta,
      };
      existing.unshift(newEntry);
      localStorage.setItem(demoLogsKey, JSON.stringify(existing.slice(0, 50)));
    } catch {}
    return;
  }

  const db = getFirebaseDb();
  if (!db) return;

  try {
    const logRef = doc(collection(db, AUDIT_COLLECTION));
    await setDoc(logRef, {
      ownerId,
      action,
      entityType,
      entityId: entityId || null,
      timestamp: now,
      serverTime: serverTimestamp(),
      source,
      metadataSafe: safeMeta,
    });
  } catch (error) {
    // Non-blocking: audit failure should not break user-facing flows
    console.warn("Audit logging failed:", error);
  }
}

/**
 * Fetch recent audit logs for the authenticated farmer.
 */
export async function listAuditLogs(
  ownerId: string,
  maxEntries: number = 30,
  isDemoMode: boolean = false
): Promise<AuditLogEntry[]> {
  if (!ownerId) return [];

  if (isDemoMode || !isFirebaseConfigured) {
    try {
      const demoLogsKey = `agroguide_demo_audit_${ownerId}`;
      const existing = JSON.parse(localStorage.getItem(demoLogsKey) || "[]");
      return existing.slice(0, maxEntries);
    } catch {
      return [];
    }
  }

  const db = getFirebaseDb();
  if (!db) return [];

  try {
    const q = query(
      collection(db, AUDIT_COLLECTION),
      where("ownerId", "==", ownerId),
      orderBy("timestamp", "desc"),
      limit(maxEntries)
    );

    const snapshot = await getDocs(q);
    return snapshot.docs.map((d) => {
      const data = d.data();
      return {
        id: d.id,
        ownerId: data.ownerId,
        action: data.action,
        entityType: data.entityType,
        entityId: data.entityId,
        timestamp: data.timestamp,
        source: data.source || "web",
        metadataSafe: data.metadataSafe || {},
      };
    });
  } catch {
    return [];
  }
}
