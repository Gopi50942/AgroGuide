// ─────────────────────────────────────────────
// Firestore write-safety helper.
//
// Firestore's setDoc/addDoc/updateDoc reject any field whose value
// is `undefined` (e.g. `phone: undefined`). Optional profile/form
// fields frequently end up `undefined` (e.g. `fbUser.phoneNumber ||
// undefined`), so every write in this app is passed through this
// helper first, which simply omits `undefined` keys instead of
// sending them. Required fields are never touched — only keys whose
// value is exactly `undefined` are dropped.
// ─────────────────────────────────────────────

/**
 * Recursively removes keys whose value is `undefined` so the result
 * is safe to pass to setDoc/addDoc/updateDoc. Arrays and nested
 * objects (plain objects only — not class instances, Dates, etc.)
 * are cleaned as well; everything else is left untouched.
 */
export function cleanFirestoreData<T>(data: T): T {
  if (data === undefined || data === null) return data;

  if (Array.isArray(data)) {
    return data.map((item) => cleanFirestoreData(item)) as unknown as T;
  }

  if (isPlainObject(data)) {
    const out: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(data as Record<string, unknown>)) {
      if (value === undefined) continue;
      out[key] = cleanFirestoreData(value);
    }
    return out as T;
  }

  return data;
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  if (typeof value !== "object" || value === null) return false;
  const proto = Object.getPrototypeOf(value);
  return proto === Object.prototype || proto === null;
}
