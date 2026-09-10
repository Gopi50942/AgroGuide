import type { NotificationItem } from "@/types";

// ─────────────────────────────────────────────
// Phase 68: Advanced Notification Inbox & Category Filter Engine
// ─────────────────────────────────────────────

export interface EnhancedNotificationItem extends NotificationItem {
  category: "weather" | "market" | "crop" | "task" | "government" | "finance" | "community" | "system";
  isArchived?: boolean;
  actionRoute?: string;
  source?: string;
}

export function filterNotificationInbox(
  items: EnhancedNotificationItem[],
  categoryFilter: string = "all",
  showArchived: boolean = false
): EnhancedNotificationItem[] {
  return items.filter((item) => {
    if (!showArchived && item.isArchived) return false;
    if (showArchived && !item.isArchived) return false;
    if (categoryFilter !== "all" && item.category !== categoryFilter) return false;
    return true;
  });
}

export function markAllNotificationsRead(
  items: EnhancedNotificationItem[]
): EnhancedNotificationItem[] {
  return items.map((i) => ({ ...i, read: true }));
}

export function toggleNotificationArchive(
  items: EnhancedNotificationItem[],
  targetId: string
): EnhancedNotificationItem[] {
  return items.map((i) => (i.id === targetId ? { ...i, isArchived: !i.isArchived } : i));
}
