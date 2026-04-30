import type { Metadata, Viewport } from "next";
import "./globals.css";
import AppShell from "@/components/Navigation/AppShell";

export const metadata: Metadata = {
  title: "Lumen",
  description: "帮助你每天更清楚地看见自己一点",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Lumen",
  },
  icons: {
    apple: "/icons/icon-192.png",
    icon: "/icons/icon-192.png",
  },
};

export const viewport: Viewport = {
  themeColor: "#0f0f0f",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh" className="h-full">
      <body className="h-full antialiased">
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
