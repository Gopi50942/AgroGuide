import type { Metadata, Viewport } from "next";
import "./globals.css";
import { AuthProvider } from "@/hooks/useAuth";
import { LanguageProvider } from "@/hooks/useLanguage";
import { ToastProvider } from "@/components/ui/Toast";
import { PwaManager } from "@/components/pwa/PwaManager";

export const metadata: Metadata = {
  title: "AgroGuide — Intelligence for Every Stage of Farming",
  description:
    "AgroGuide is an AI-powered digital farming companion helping farmers plan, grow, protect, harvest and sell — with weather insight, crop guidance, soil health, market intelligence and official government services in one place.",
  manifest: "/manifest.json",
  keywords: [
    "AgroGuide",
    "smart farming",
    "farmer app",
    "crop advisory",
    "government schemes for farmers",
    "Tamil Nadu agriculture",
  ],
  icons: {
    icon: "/favicon.svg",
    apple: "/favicon.svg",
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "AgroGuide",
  },
  other: {
    "mobile-web-app-capable": "yes",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#2C4C38",
};

import { RuntimeIndicator } from "@/components/diagnostics/RuntimeIndicator";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,500;9..144,600;9..144,700&family=Inter:wght@400;500;600;700;800&family=JetBrains+Mono:wght@500&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <AuthProvider>
          <LanguageProvider>
            <ToastProvider>
              {children}
              <PwaManager />
              <RuntimeIndicator />
            </ToastProvider>
          </LanguageProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
