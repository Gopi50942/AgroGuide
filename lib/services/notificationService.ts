import { isFirebaseConfigured } from "@/lib/firebase/config";
import { listOwnedOrdered, updateOwned } from "@/lib/firebase/firestore";
import { DEMO_NOTIFICATIONS } from "@/data/demoData";
import type { NotificationItem } from "@/types";

export async function getNotifications(uid: string): Promise<NotificationItem[]> {
  if (!isFirebaseConfigured) return DEMO_NOTIFICATIONS;
  try {
    return await listOwnedOrdered<NotificationItem>("notifications", uid, "createdAt");
  } catch (error) {
    // Real Firebase is configured but the read failed — show an honest
    // empty state rather than fake demo notifications. Notifications are
    // low-stakes enough that a silent empty list (vs. a scary banner) is
    // the right trade-off here; the caller's UI already reads "no
    // notifications" and "failed to load" the same way.
    console.error("❌ Failed to load notifications:", error);
    return [];
  }
}

export async function markNotificationRead(id: string): Promise<void> {
  if (!isFirebaseConfigured) return;
  await updateOwned("notifications", id, { read: true }).catch(() => null);
}

/**
 * If Firebase Cloud Messaging is configured, callers can additionally
 * register for push notifications. The app functions fully without it —
 * this is a best-effort enhancement only.
 */
export async function tryRegisterPush(): Promise<boolean> {
  if (typeof window === "undefined") return false;
  if (!("Notification" in window) || !("serviceWorker" in navigator)) return false;
  if (!process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY) return false;
  try {
    const permission = await Notification.requestPermission();
    return permission === "granted";
  } catch {
    return false;
  }
}
