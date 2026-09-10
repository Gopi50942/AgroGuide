"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { X, LogOut } from "lucide-react";
import { Logo } from "@/components/ui/Logo";
import { NAV_ITEMS } from "@/data/navigation";
import { useAuth } from "@/hooks/useAuth";
import { useLanguage } from "@/hooks/useLanguage";

export function MobileDrawer({ open, onClose }: { open: boolean; onClose: () => void }) {
  const pathname = usePathname();
  const { signOut } = useAuth();
  const { t } = useLanguage();
  const router = useRouter();

  if (!open) return null;

  return (
    <div className="lg:hidden fixed inset-0 z-50">
      <div className="absolute inset-0 bg-ink/40" onClick={onClose} />
      <div className="absolute right-0 top-0 bottom-0 w-72 bg-cream-50 p-5 overflow-y-auto animate-fade-up">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display text-lg font-semibold">{t("nav.menu")}</h2>
          <button onClick={onClose} aria-label="Close menu" className="p-1.5 rounded-full hover:bg-forest-50">
            <X size={20} />
          </button>
        </div>
        <nav className="space-y-0.5">
          {NAV_ITEMS.map((item) => {
            const active = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium ${
                  active ? "bg-forest-600 text-cream-50" : "text-ink-light hover:bg-forest-50"
                }`}
              >
                <Icon size={18} />
                {t(item.labelKey)}
              </Link>
            );
          })}
        </nav>
        <button
          onClick={async () => {
            await signOut();
            router.push("/login");
          }}
          className="flex items-center gap-2 px-3 py-2.5 mt-3 rounded-xl text-sm text-ink-light hover:bg-forest-50 w-full border-t border-forest-100 pt-4"
        >
          <LogOut size={16} /> {t("nav.logout")}
        </button>
      </div>
    </div>
  );
}
