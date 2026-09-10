"use client";

import { useEffect, useState } from "react";
import { Bell, Menu, MapPin } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useLanguage } from "@/hooks/useLanguage";
import { getNotifications, markNotificationRead } from "@/lib/services/notificationService";
import type { NotificationItem } from "@/types";
import { Logo } from "@/components/ui/Logo";

export function TopBar({ onOpenDrawer }: { onOpenDrawer: () => void }) {
  const { profile } = useAuth();
  const { t } = useLanguage();
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!profile) return;
    getNotifications(profile.uid).then(setNotifications);
  }, [profile]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <header className="sticky top-0 z-30 bg-cream-100/90 backdrop-blur border-b border-forest-100/70">
      <div className="flex items-center justify-between px-4 sm:px-6 py-3.5">
        <div className="lg:hidden">
          <Logo />
        </div>
        <div className="hidden lg:flex items-center gap-2 text-sm text-ink-light">
          <MapPin size={15} className="text-forest-600" />
          {profile?.district ? `${profile.district}, ${profile.state}` : t("nav.setLocation")}
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <button
              onClick={() => setOpen((o) => !o)}
              className="relative p-2.5 rounded-full hover:bg-forest-50"
              aria-label="Notifications"
            >
              <Bell size={19} />
              {unreadCount > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-rust-500" />
              )}
            </button>
            {open && (
              <div className="absolute right-0 mt-2 w-80 max-w-[90vw] card p-2 max-h-96 overflow-y-auto">
                <p className="px-2 py-1.5 text-xs font-semibold text-ink-light uppercase tracking-wide">
                  {t("nav.notifications")}
                </p>
                {notifications.length === 0 && (
                  <p className="px-2 py-4 text-sm text-ink-light text-center">{t("nav.notifications.empty")}</p>
                )}
                {notifications.map((n) => (
                  <button
                    key={n.id}
                    onClick={() => {
                      markNotificationRead(n.id);
                      setNotifications((prev) =>
                        prev.map((x) => (x.id === n.id ? { ...x, read: true } : x))
                      );
                    }}
                    className={`w-full text-left px-2.5 py-2.5 rounded-lg text-sm hover:bg-forest-50 ${!n.read ? "bg-forest-50/60" : ""}`}
                  >
                    <p className="font-semibold">{n.title}</p>
                    <p className="text-ink-light text-xs mt-0.5">{n.message}</p>
                  </button>
                ))}
              </div>
            )}
          </div>
          <button
            onClick={onOpenDrawer}
            className="lg:hidden p-2.5 rounded-full hover:bg-forest-50"
            aria-label="Open menu"
          >
            <Menu size={19} />
          </button>
        </div>
      </div>
    </header>
  );
}
