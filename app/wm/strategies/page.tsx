"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { DEMO_FIRM_ID } from "@/lib/mock-data";
import { StrategyCard } from "@/components/wm/StrategyCard";
import type { Strategy } from "@/lib/store";
import { StatCard } from "@/components/shared/StatCard";

export default function MyStrategies() {
  const [strategies, setStrategies] = useState<Strategy[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/firms/${DEMO_FIRM_ID}/strategies`)
      .then((r) => r.json())
      .then(setStrategies)
      .finally(() => setLoading(false));
  }, []);

  const liveStrategies = strategies.filter((s) => s.status === "live");
  const totalAum = strategies.reduce((sum, s) => sum + s.aum, 0);
  const totalSubs = strategies.reduce((sum, s) => sum + s.subscribers, 0);

  return (
    <div className="p-6 lg:p-10 max-w-5xl">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-[#181c1e] mb-1">My Strategies</h1>
          <p className="text-sm text-[#6c7a71]">
            Oversee your investment models and track aggregate performance.
          </p>
        </div>
        <Link
          href="/wm/strategies/builder"
          className="bg-[#10b77f] text-white font-semibold rounded-full px-5 py-2.5 text-sm hover:bg-[#006c49] transition-colors flex items-center gap-2 flex-shrink-0"
        >
          <span className="material-symbols-outlined text-lg">add</span>
          New Strategy
        </Link>
      </div>

      {/* KPI row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard
          label="Total AUM"
          value={`€${(totalAum / 1_000_000).toFixed(1)}M`}
          subValue="+2.1% this month"
          trend="up"
          icon="account_balance"
        />
        <StatCard
          label="Subscribers"
          value={totalSubs.toLocaleString()}
          subValue="+158 direct"
          trend="up"
          icon="group"
        />
        <StatCard
          label="Revenue MTD"
          value="€18.5k"
          subValue="+5.4% fees"
          trend="up"
          icon="payments"
        />
        <StatCard
          label="Active Strategies"
          value={String(liveStrategies.length)}
          subValue="Stable"
          trend="neutral"
          icon="insights"
        />
      </div>

      {/* Strategy list */}
      {loading ? (
        <div className="flex items-center justify-center py-20 text-[#6c7a71]">
          <span className="material-symbols-outlined animate-spin mr-2">refresh</span>
          Loading strategies…
        </div>
      ) : strategies.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center">
          <div className="w-16 h-16 rounded-2xl bg-[#10b77f]/10 flex items-center justify-center mx-auto mb-4">
            <span className="material-symbols-outlined text-[#10b77f] text-3xl">
              add_chart
            </span>
          </div>
          <h2 className="text-lg font-bold text-[#181c1e] mb-2">
            Build your first strategy
          </h2>
          <p className="text-sm text-[#6c7a71] mb-6 max-w-sm mx-auto">
            Create a stock basket, set weightings, and publish it to the marketplace
            for investors to discover.
          </p>
          <Link
            href="/wm/strategies/builder"
            className="inline-flex items-center gap-2 bg-[#10b77f] text-white font-semibold rounded-full px-6 py-3 text-sm hover:bg-[#006c49] transition-colors"
          >
            <span className="material-symbols-outlined text-lg">add</span>
            Create Strategy
          </Link>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          <p className="text-xs font-semibold text-[#6c7a71] uppercase tracking-widest">
            {strategies.length} {strategies.length === 1 ? "strategy" : "strategies"}
          </p>
          {strategies.map((s) => (
            <StrategyCard key={s.id} strategy={s} />
          ))}

          {/* CTA to create more */}
          <Link href="/wm/strategies/builder" className="group">
            <div className="bg-white rounded-xl p-5 flex items-center gap-4 hover:shadow-sm transition-shadow">
              <div className="w-10 h-10 rounded-xl bg-[#10b77f]/10 flex items-center justify-center group-hover:bg-[#10b77f]/20 transition-colors">
                <span className="material-symbols-outlined text-[#10b77f] text-xl">add</span>
              </div>
              <div>
                <p className="text-sm font-semibold text-[#181c1e]">Build your next strategy</p>
                <p className="text-xs text-[#6c7a71]">
                  Institutional controls with automated rebalancing
                </p>
              </div>
            </div>
          </Link>
        </div>
      )}
    </div>
  );
}
