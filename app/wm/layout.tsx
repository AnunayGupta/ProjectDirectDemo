"use client";

import { usePathname } from "next/navigation";
import { WmSidebar } from "@/components/wm/WmSidebar";
import { WmBottomTabs } from "@/components/wm/WmBottomTabs";

export default function WmLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isOnboarding = pathname.startsWith("/wm/onboarding");

  if (isOnboarding) {
    return <>{children}</>;
  }

  return (
    <div className="flex min-h-screen bg-[#f7fafc]">
      <WmSidebar />
      <main className="flex-1 min-w-0 pb-20 lg:pb-0">{children}</main>
      <WmBottomTabs />
    </div>
  );
}
