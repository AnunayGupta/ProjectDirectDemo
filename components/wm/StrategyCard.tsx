import Link from "next/link";
import type { Strategy } from "@/lib/store";

const STATUS_STYLES = {
  live: { bg: "bg-[#b7ebce]", text: "text-[#386850]", label: "Live" },
  draft: { bg: "bg-[#ebeef0]", text: "text-[#6c7a71]", label: "Draft" },
  paused: { bg: "bg-[#ffdad6]", text: "text-[#a43a3b]", label: "Paused" },
};

const STATUS_NOTES: Record<string, string> = {
  paused: "Strategy under internal review",
  draft: "Awaiting compliance approval",
};

function getRebalanceDaysAgo(dateStr: string): number {
  const diff = Date.now() - new Date(dateStr).getTime();
  return Math.floor(diff / (1000 * 60 * 60 * 24));
}

function getRebalanceStyle(daysAgo: number) {
  if (daysAgo > 30) return { icon: "error", color: "text-[#a43a3b]", bg: "bg-[#ffdad6]" };
  if (daysAgo > 14) return { icon: "warning", color: "text-[#f59e0b]", bg: "bg-[#fef3c7]" };
  return { icon: "schedule", color: "text-[#6c7a71]", bg: "" };
}

// Simple SVG sparkline from mock data
function Sparkline({ positive }: { positive: boolean }) {
  const points = positive
    ? "0,20 8,18 16,15 24,16 32,12 40,10 48,11 56,7 64,5 72,3"
    : "0,5 8,7 16,10 24,8 32,12 40,14 48,13 56,16 64,18 72,20";
  const color = positive ? "#10b77f" : "#a43a3b";
  return (
    <svg viewBox="0 0 72 24" className="w-20 h-6" fill="none">
      <polyline points={points} stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function StrategyCard({ strategy }: { strategy: Strategy }) {
  const status = STATUS_STYLES[strategy.status];
  const perfColor = strategy.ytdPerformance >= 0 ? "text-[#10b77f]" : "text-[#a43a3b]";
  const perfSign = strategy.ytdPerformance >= 0 ? "+" : "";
  const daysAgo = getRebalanceDaysAgo(strategy.lastRebalanced);
  const rebalanceStyle = getRebalanceStyle(daysAgo);
  const statusNote = STATUS_NOTES[strategy.status];

  return (
    <div className="bg-white rounded-xl p-5 flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="text-base font-bold text-[#181c1e] truncate">
              {strategy.name}
            </h3>
            <span className={`${status.bg} ${status.text} text-xs font-semibold rounded-full px-2.5 py-0.5`}>
              {status.label}
            </span>
          </div>
          <p className="text-xs text-[#6c7a71]">
            {strategy.description ? strategy.description.slice(0, 60) + (strategy.description.length > 60 ? "…" : "") : "—"}
          </p>
        </div>
        <div className="flex items-center gap-3 flex-shrink-0">
          <Sparkline positive={strategy.ytdPerformance >= 0} />
          <span className={`text-lg font-bold ${perfColor}`}>
            {perfSign}{strategy.ytdPerformance}%
          </span>
        </div>
      </div>

      {/* Metrics row */}
      <div className="flex items-center gap-6">
        <div>
          <p className="text-xs text-[#6c7a71]">AUM</p>
          <p className="text-sm font-semibold text-[#181c1e]">
            €{strategy.aum >= 1_000_000 ? `${(strategy.aum / 1_000_000).toFixed(1)}M` : strategy.aum === 0 ? "€0" : `${(strategy.aum / 1000).toFixed(0)}k`}
          </p>
        </div>
        <div>
          <p className="text-xs text-[#6c7a71]">Subscribers</p>
          <p className="text-sm font-semibold text-[#181c1e]">
            {strategy.subscribers.toLocaleString()}
          </p>
        </div>
        <div>
          <p className="text-xs text-[#6c7a71]">YTD Return</p>
          <p className={`text-sm font-semibold ${perfColor}`}>
            {perfSign}{strategy.ytdPerformance}%
          </p>
        </div>
        <div>
          <p className="text-xs text-[#6c7a71]">Last Rebalanced</p>
          <div className="flex items-center gap-1">
            <span className={`material-symbols-outlined text-sm ${rebalanceStyle.color}`}>
              {rebalanceStyle.icon}
            </span>
            <p className={`text-sm font-semibold ${rebalanceStyle.color}`}>
              {daysAgo === 0 ? "Today" : `${daysAgo} days ago`}
            </p>
          </div>
        </div>
      </div>

      {/* Status note for paused/draft */}
      {statusNote && (
        <div className={`rounded-lg px-3 py-2 text-xs font-medium flex items-center gap-2 ${
          strategy.status === "paused" ? "bg-[#ffdad6] text-[#a43a3b]" : "bg-[#f1f4f6] text-[#6c7a71]"
        }`}>
          <span className="material-symbols-outlined text-sm">
            {strategy.status === "paused" ? "pause_circle" : "draft"}
          </span>
          {statusNote}
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center gap-3 pt-1">
        <Link
          href={`/wm/analytics/${strategy.id}`}
          className="text-sm font-semibold text-[#10b77f] hover:text-[#006c49] transition-colors flex items-center gap-1"
        >
          {strategy.status === "live" ? "View Analytics" : strategy.status === "draft" ? "Continue Setup" : "Review Details"}
          <span className="material-symbols-outlined text-base">chevron_right</span>
        </Link>
        {strategy.status === "live" && (
          <Link
            href={`/wm/rebalance?strategyId=${strategy.id}`}
            className="text-sm font-medium text-[#6c7a71] hover:text-[#181c1e] transition-colors"
          >
            Rebalance
          </Link>
        )}
      </div>
    </div>
  );
}
