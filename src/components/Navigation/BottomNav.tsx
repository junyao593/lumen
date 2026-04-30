"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

const tabs = [
  {
    href: "/",
    label: "首页",
    icon: (active: boolean) => (
      <svg width="22" height="22" viewBox="0 0 24 24" fill={active ? "currentColor" : "none"} stroke="currentColor" strokeWidth="1.8">
        <path d="M3 9.5L12 3l9 6.5V20a1 1 0 01-1 1H4a1 1 0 01-1-1V9.5z" strokeLinejoin="round" />
        <path d="M9 21V12h6v9" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    href: "/history",
    label: "历史",
    icon: (active: boolean) => (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <circle cx="12" cy="12" r="9" />
        <path d="M12 7v5l3 3" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    href: "/pattern",
    label: "脉络",
    icon: (active: boolean) => (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <circle cx="5" cy="12" r="2" fill={active ? "currentColor" : "none"} />
        <circle cx="12" cy="6" r="2" fill={active ? "currentColor" : "none"} />
        <circle cx="19" cy="12" r="2" fill={active ? "currentColor" : "none"} />
        <circle cx="12" cy="18" r="2" fill={active ? "currentColor" : "none"} />
        <path d="M7 12h3M14 12h3M12 8v3M12 15v1" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    href: "/profile",
    label: "我",
    icon: (active: boolean) => (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <circle cx="12" cy="8" r="4" fill={active ? "currentColor" : "none"} />
        <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" strokeLinecap="round" />
      </svg>
    ),
  },
];

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <nav
      style={{
        background: "var(--bg)",
        borderTop: "1px solid var(--border)",
        paddingBottom: "env(safe-area-inset-bottom)",
      }}
      className="flex-shrink-0"
    >
      <div className="flex items-center justify-around h-14">
        {tabs.map((tab) => {
          const active = pathname === tab.href;
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className="flex flex-col items-center gap-0.5 py-1 px-4"
              style={{ color: active ? "var(--accent)" : "var(--text-muted)" }}
            >
              {tab.icon(active)}
              <span className="text-[10px]">{tab.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
