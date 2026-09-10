"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu } from "lucide-react";
import { NAV_ITEMS } from "@/data/navigation";
import { useLanguage } from "@/hooks/useLanguage";

export function BottomNav({ onOpenDrawer }: { onOpenDrawer: () => void }) {
  const pathname = usePathname();
  const { t } = useLanguage();
  const primaryItems = NAV_ITEMS.filter((i) => i.primary).slice(0, 4);

  return (
    <nav className="lg:hidden fixed bottom-0 inset-x-0 z-40 bg-cream-50/95 backdrop-blur border-t border-forest-100 pb-[env(safe-area-inset-bottom)]">
      <div className="grid grid-cols-5">
        {primaryItems.map((item) => {
          const active = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center gap-1 py-2.5 text-[11px] font-medium ${
                active ? "text-forest-700" : "text-ink-light"
              }`}
            >
              <Icon size={20} strokeWidth={active ? 2.4 : 2} />
              {t(item.labelKey).split(" ")[0]}
            </Link>
          );
        })}
        <button
          onClick={onOpenDrawer}
          className="flex flex-col items-center gap-1 py-2.5 text-[11px] font-medium text-ink-light"
        >
          <Menu size={20} />
          {t("nav.more")}
        </button>
      </div>
    </nav>
  );
}
