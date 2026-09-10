"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Sidebar } from "@/components/layout/Sidebar";
import { TopBar } from "@/components/layout/TopBar";
import { BottomNav } from "@/components/layout/BottomNav";
import { MobileDrawer } from "@/components/layout/MobileDrawer";
import { ConnectivityBanner } from "@/components/ui/ConnectivityBanner";
import { useAuth } from "@/hooks/useAuth";
import { LocationProvider } from "@/hooks/useLocationContext";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { profile, loading, isDemoMode } = useAuth();
  const router = useRouter();
  const [drawerOpen, setDrawerOpen] = useState(false);

  useEffect(() => {
    if (!loading && !profile) {
      router.push("/login");
    }
  }, [loading, profile, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-forest-200 border-t-forest-600 animate-spin" />
      </div>
    );
  }

  if (!profile) return null;

  return (
    <LocationProvider>
      <div className="flex h-screen overflow-hidden bg-cream-100">
        <Sidebar />
        <div className="flex-1 min-w-0 flex flex-col h-screen overflow-y-auto">
          <ConnectivityBanner />
          {isDemoMode && (
            <div className="bg-wheat-300 text-ink text-center text-xs sm:text-sm font-semibold py-1.5 px-4 shrink-0">
              Demo mode — showing sample data for Gopi&rsquo;s farm. Connect Firebase to use your own account.
            </div>
          )}
          <TopBar onOpenDrawer={() => setDrawerOpen(true)} />
          <main className="flex-1 px-4 sm:px-6 py-6 pb-28 lg:pb-8 max-w-6xl w-full mx-auto min-w-0">
            {children}
          </main>
          <BottomNav onOpenDrawer={() => setDrawerOpen(true)} />
        </div>
        <MobileDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} />
      </div>
    </LocationProvider>
  );
}
