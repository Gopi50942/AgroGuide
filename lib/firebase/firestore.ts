// ─────────────────────────────────────────────
// Thin Firestore data-access layer.
// All reads/writes are scoped by the current user's uid so a
// farmer can never read or write another farmer's private data
// (enforced again server-side by firestore.rules).
// ─────────────────────────────────────────────
import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  addDoc,
  updateDoc,
  type UpdateData,
  deleteDoc,
  query,
  where,
  orderBy,
  serverTimestamp,
  Timestamp,
} from "firebase/firestore";
import { db, auth, isFirebaseConfigured } from "./config";
import { cleanFirestoreData } from "./cleanData";
import type { FarmerProfile } from "@/types";

function requireDb() {
  if (!isFirebaseConfigured || !db) {
    throw new Error(
      "Firebase is not configured. Set the NEXT_PUBLIC_FIREBASE_* environment variables to enable live data, or continue using demo mode."
    );
  }
  return db;
}

/**
 * Server-written `createdAt`/`updatedAt` fields come back from Firestore
 * as Timestamp instances, but our types (e.g. CropTask.dueDate,
 * NotificationItem.createdAt, CommunityPost.createdAt) declare them as
 * ISO strings for simplicity in the UI. This converts any Timestamp
 * fields on a plain document object to ISO strings so callers get what
 * their types promise, instead of a Timestamp silently failing
 * `new Date(...)` or breaking string comparisons/sorts downstream.
 */
function normalizeTimestamps<T extends Record<string, unknown>>(data: T): T {
  const out: Record<string, unknown> = { ...data };
  for (const [key, value] of Object.entries(out)) {
    if (value instanceof Timestamp) {
      out[key] = value.toDate().toISOString();
    }
  }
  return out as T;
}

// Deduplication set to avoid flooding console with identical diagnostic errors
const loggedErrors = new Set<string>();

function logDiagnosticError(details: {
  operation: string;
  collection: string;
  docId?: string;
  queryOwnerId?: string;
  orderField?: string;
  error: unknown;
}) {
  const errorObj = details.error as { code?: string; message?: string };
  const currentAuth = auth?.currentUser;
  const key = `${details.operation}:${details.collection}:${details.docId ?? details.queryOwnerId ?? ""}:${errorObj?.code ?? ""}`;
  
  if (loggedErrors.has(key)) return;
  loggedErrors.add(key);

  console.error("🔥 Firebase Diagnostic:", {
    operation: details.operation,
    collection: details.collection,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ?? "unknown",
    authenticatedUidExists: Boolean(currentAuth?.uid),
    currentAuthUid: currentAuth?.uid ?? "unauthenticated",
    docId: details.docId,
    queryOwnerId: details.queryOwnerId,
    orderField: details.orderField,
    errorCode: errorObj?.code ?? "unknown",
    errorMessage: errorObj?.message ?? String(details.error),
  });
}

export async function getFarmerProfile(uid: string): Promise<FarmerProfile | null> {
  const database = requireDb();
  try {
    const snap = await getDoc(doc(database, "users", uid));
    return snap.exists() ? (snap.data() as FarmerProfile) : null;
  } catch (err: unknown) {
    logDiagnosticError({
      operation: "users:read",
      collection: "users",
      docId: uid,
      error: err,
    });
    return null;
  }
}

export async function saveFarmerProfile(profile: FarmerProfile): Promise<void> {
  const database = requireDb();
  try {
    await setDoc(doc(database, "users", profile.uid), cleanFirestoreData(profile), { merge: true });
  } catch (err: unknown) {
    logDiagnosticError({
      operation: "users:write",
      collection: "users",
      docId: profile.uid,
      error: err,
    });
    throw err;
  }
}

// Generic scoped collection helpers, reused by farms/crops/expenses/etc.
export async function listOwned<T>(collectionName: string, ownerId: string): Promise<T[]> {
  if (!ownerId) return [];
  const database = requireDb();
  try {
    const q = query(collection(database, collectionName), where("ownerId", "==", ownerId));
    const snap = await getDocs(q);
    return snap.docs.map((d) => normalizeTimestamps({ id: d.id, ...d.data() }) as T);
  } catch (err: unknown) {
    logDiagnosticError({
      operation: "listOwned",
      collection: collectionName,
      queryOwnerId: ownerId,
      error: err,
    });
    return [];
  }
}

export async function createOwned<T extends Record<string, unknown>>(
  collectionName: string,
  ownerId: string,
  data: T
): Promise<string> {
  const database = requireDb();
  try {
    const ref = await addDoc(
      collection(database, collectionName),
      cleanFirestoreData({
        ...data,
        ownerId,
        createdAt: serverTimestamp(),
      })
    );
    return ref.id;
  } catch (err: unknown) {
    logDiagnosticError({
      operation: "createOwned",
      collection: collectionName,
      queryOwnerId: ownerId,
      error: err,
    });
    throw err;
  }
}

export async function updateOwned(
  collectionName: string,
  id: string,
  data: Record<string, unknown>
): Promise<void> {
  const database = requireDb();
  try {
    await updateDoc(
      doc(database, collectionName, id),
      cleanFirestoreData(data) as unknown as UpdateData<Record<string, unknown>>
    );
  } catch (err: unknown) {
    logDiagnosticError({
      operation: "updateOwned",
      collection: collectionName,
      docId: id,
      error: err,
    });
    throw err;
  }
}

export async function removeOwned(collectionName: string, id: string): Promise<void> {
  const database = requireDb();
  try {
    await deleteDoc(doc(database, collectionName, id));
  } catch (err: unknown) {
    logDiagnosticError({
      operation: "removeOwned",
      collection: collectionName,
      docId: id,
      error: err,
    });
    throw err;
  }
}

export async function listOwnedOrdered<T>(
  collectionName: string,
  ownerId: string,
  orderField: string
): Promise<T[]> {
  if (!ownerId) return [];
  const database = requireDb();
  try {
    const q = query(
      collection(database, collectionName),
      where("ownerId", "==", ownerId),
      orderBy(orderField, "desc")
    );
    const snap = await getDocs(q);
    return snap.docs.map((d) => normalizeTimestamps({ id: d.id, ...d.data() }) as T);
  } catch (err: unknown) {
    logDiagnosticError({
      operation: "listOwnedOrdered",
      collection: collectionName,
      queryOwnerId: ownerId,
      orderField,
      error: err,
    });
    return [];
  }
}

export async function listAllOrdered<T>(collectionName: string, orderField: string): Promise<T[]> {
  const database = requireDb();
  try {
    const q = query(collection(database, collectionName), orderBy(orderField, "desc"));
    const snap = await getDocs(q);
    return snap.docs.map((d) => normalizeTimestamps({ id: d.id, ...d.data() }) as T);
  } catch (err: unknown) {
    logDiagnosticError({
      operation: "listAllOrdered",
      collection: collectionName,
      orderField,
      error: err,
    });
    return [];
  }
}

export async function listByField<T>(
  collectionName: string,
  fieldName: string,
  fieldValue: unknown
): Promise<T[]> {
  if (fieldValue === undefined || fieldValue === null) return [];
  const database = requireDb();
  try {
    const q = query(collection(database, collectionName), where(fieldName, "==", fieldValue));
    const snap = await getDocs(q);
    return snap.docs.map((d) => normalizeTimestamps({ id: d.id, ...d.data() }) as T);
  } catch (err: unknown) {
    logDiagnosticError({
      operation: "listByField",
      collection: collectionName,
      error: err,
    });
    return [];
  }
}
