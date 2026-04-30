"use client";
import { usePathname } from "next/navigation";
import BottomNav from "./BottomNav";

const NO_NAV = ["/onboarding", "/result"];

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const showNav = !NO_NAV.some((p) => pathname.startsWith(p));

  return (
    <div className="app-shell">
      <div className="page-scroll">{children}</div>
      {showNav && <BottomNav />}
    </div>
  );
}
