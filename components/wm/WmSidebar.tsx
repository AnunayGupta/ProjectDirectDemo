"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV_ITEMS = [
  { href: "/wm/analytics", label: "Dashboard", icon: "dashboard" },
  { href: "/wm/strategies", label: "Strategies", icon: "insights" },
  { href: "/wm/broadcast", label: "Broadcast", icon: "campaign" },
  { href: "/wm/settings", label: "Settings", icon: "settings" },
];

export function WmSidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden lg:flex w-[240px] flex-col bg-white h-screen sticky top-0">
      {/* Logo + notification */}
      <div className="px-6 py-6 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-[#10b77f] flex items-center justify-center">
            <span className="material-symbols-outlined text-white text-lg">trending_up</span>
          </div>
          <span className="text-base font-bold text-[#181c1e]">ProjectDirect</span>
        </div>
        <button className="relative w-8 h-8 rounded-lg hover:bg-[#f1f4f6] flex items-center justify-center transition-colors">
          <span className="material-symbols-outlined text-[#6c7a71] text-xl">notifications</span>
          <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-[#a43a3b]" />
        </button>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 mt-2">
        <div className="flex flex-col gap-1">
          {NAV_ITEMS.map((item) => {
            const active = pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  active
                    ? "bg-[#10b77f]/10 text-[#006c49]"
                    : "text-[#6c7a71] hover:bg-[#f1f4f6] hover:text-[#181c1e]"
                }`}
              >
                <span
                  className={`material-symbols-outlined text-xl ${
                    active ? "text-[#10b77f]" : ""
                  }`}
                >
                  {item.icon}
                </span>
                {item.label}
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Footer */}
      <div className="px-5 py-5">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-[#ebeef0] flex items-center justify-center">
            <span className="material-symbols-outlined text-[#6c7a71] text-lg">person</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-[#181c1e] truncate">Alexandra Chen</p>
            <p className="text-xs text-[#6c7a71]">Elevate Capital</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
