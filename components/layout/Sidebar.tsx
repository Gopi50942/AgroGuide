"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LogOut } from "lucide-react";
import { Logo } from "@/components/ui/Logo";
import { NAV_ITEMS } from "@/data/navigation";
import { useAuth } from "@/hooks/useAuth";
import { useLanguage } from "@/hooks/useLanguage";
import { useRouter } from "next/navigation";

export function Sidebar() {
  const pathname = usePathname();
  const { signOut, profile } = useAuth();
  const { t } = useLanguage();
  const router = useRouter();

  return (
    <aside className="hidden lg:flex flex-col w-64 shrink-0 h-screen sticky top-0 border-r border-forest-100 bg-cream-50/60 px-4 py-5 no-scrollbar">
      <div className="px-2 mb-6">
        <Logo />
      </div>
      <nav className="flex-1 space-y-0.5 overflow-y-auto no-scrollbar">
        {NAV_ITEMS.map((item) => {
          const active = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                active
                  ? "bg-forest-600 text-cream-50"
                  : "text-ink-light hover:bg-forest-50 hover:text-ink"
              }`}
            >
              <Icon size={18} />
              {t(item.labelKey)}
            </Link>
          );
        })}
      </nav>
      <div className="mt-4 pt-4 border-t border-forest-100">
        <div className="flex items-center gap-3 px-2 mb-3">
          <div className="w-9 h-9 rounded-full bg-forest-100 flex items-center justify-center text-forest-700 font-semibold text-sm">
            {profile?.name?.[0]?.toUpperCase() ?? "F"}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold truncate">{profile?.name ?? "Farmer"}</p>
            <p className="text-xs text-ink-light truncate">{profile?.district || t("nav.setLocation")}</p>
          </div>
        </div>
        <button
          onClick={async () => {
            await signOut();
            router.push("/login");
          }}
          className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm text-ink-light hover:bg-forest-50 w-full"
        >
          <LogOut size={16} /> {t("nav.logout")}
        </button>
      </div>
    </aside>
  );
}
