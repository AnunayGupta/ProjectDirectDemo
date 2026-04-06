"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const TABS = [
  { href: "/wm/strategies", label: "Strategies", icon: "insights" },
  { href: "/wm/analytics", label: "Analytics", icon: "monitoring" },
  { href: "/wm/broadcast", label: "Broadcast", icon: "podcasts" },
  { href: "/wm/settings", label: "Settings", icon: "settings" },
];

export function WmBottomTabs() {
  const pathname = usePathname();

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white z-50 flex items-center justify-around px-2 py-2 safe-bottom">
      {TABS.map((tab) => {
        const active = pathname.startsWith(tab.href);
        return (
          <Link
            key={tab.href}
            href={tab.href}
            className={`flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl transition-colors ${
              active ? "text-[#10b77f]" : "text-[#6c7a71]"
            }`}
          >
            <span className="material-symbols-outlined text-xl">{tab.icon}</span>
            <span className="text-[10px] font-medium">{tab.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
