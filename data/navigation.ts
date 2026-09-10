import {
  LayoutDashboard,
  Sun,
  Sprout,
  Stethoscope,
  CloudSun,
  TrendingUp,
  Droplets,
  Bot,
  FlaskConical,
  Landmark,
  Wallet,
  CalendarDays,
  Camera,
  Users,
  Siren,
  Settings,
  LifeBuoy,
  Milk,
  type LucideIcon,
} from "lucide-react";
import type { TranslationKey } from "@/lib/i18n/translations";

export interface NavItem {
  href: string;
  label: string;
  /** Translation key — used by the language-aware nav components. */
  labelKey: TranslationKey;
  icon: LucideIcon;
  primary?: boolean; // shown in mobile bottom nav
}

// Ordered by importance to an everyday farmer (Equipment removed — not
// needed for this app; Crop Doctor added as a first-class feature).
export const NAV_ITEMS: NavItem[] = [
  { href: "/dashboard", label: "Dashboard", labelKey: "nav.dashboard", icon: LayoutDashboard, primary: true },
  { href: "/today", label: "Today", labelKey: "nav.today", icon: Sun, primary: true },
  { href: "/farm", label: "My Farm", labelKey: "nav.farm", icon: Sprout, primary: true },
  { href: "/crop-doctor", label: "Crop Doctor", labelKey: "nav.cropDoctor", icon: Stethoscope, primary: true },
  { href: "/weather", label: "Weather", labelKey: "nav.weather", icon: CloudSun, primary: true },
  { href: "/market", label: "Market", labelKey: "nav.market", icon: TrendingUp },
  { href: "/irrigation", label: "Irrigation", labelKey: "nav.irrigation", icon: Droplets },
  { href: "/ai", label: "AgroGuide AI", labelKey: "nav.ai", icon: Bot },
  { href: "/soil", label: "Soil Health", labelKey: "nav.soil", icon: FlaskConical },
  { href: "/livestock", label: "Livestock", labelKey: "nav.livestock", icon: Milk },
  { href: "/calendar", label: "Crop Calendar", labelKey: "nav.calendar", icon: CalendarDays },
  { href: "/government", label: "Government Services", labelKey: "nav.government", icon: Landmark },
  { href: "/finance", label: "Finance", labelKey: "nav.finance", icon: Wallet },
  { href: "/diary", label: "Farm Diary", labelKey: "nav.diary", icon: Camera },
  { href: "/community", label: "Community", labelKey: "nav.community", icon: Users },
  { href: "/help", label: "Help Center", labelKey: "nav.help", icon: LifeBuoy },
  { href: "/emergency", label: "Emergency", labelKey: "nav.emergency", icon: Siren },
  { href: "/settings", label: "Settings", labelKey: "nav.settings", icon: Settings },
];
