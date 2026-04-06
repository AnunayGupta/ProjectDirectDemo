"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAppStore } from "@/lib/store";
import { DEMO_FIRM_ID } from "@/lib/mock-data";
import { SlideToConfirm } from "@/components/shared/SlideToConfirm";

const CHECKLIST = [
  { id: "name", label: "Strategy name is set", check: (d: Record<string, unknown>) => !!d.name },
  { id: "desc", label: "Description provided", check: (d: Record<string, unknown>) => !!d.description },
  { id: "risk", label: "Risk category selected", check: (d: Record<string, unknown>) => !!d.riskCategory },
  { id: "min", label: "Min. investment defined", check: (d: Record<string, unknown>) => (d.minInvestment as number) > 0 },
  {
    id: "weight",
    label: "Allocation totals 100%",
    check: (d: Record<string, unknown>) => {
      const h = (d.holdings ?? []) as Array<{ weighting: number }>;
      return h.reduce((s, x) => s + x.weighting, 0) === 100;
    },
  },
  {
    id: "stocks",
    label: "At least 2 holdings",
    check: (d: Record<string, unknown>) => ((d.holdings ?? []) as unknown[]).length >= 2,
  },
];

export default function StrategyPreview() {
  const router = useRouter();
  const { draftStrategy, clearDraftStrategy, isPublishing, setIsPublishing } = useAppStore();
  const [published, setPublished] = useState(false);

  const holdings = draftStrategy.holdings ?? [];
  const allPassed = CHECKLIST.every((c) => c.check(draftStrategy as Record<string, unknown>));

  async function handlePublish() {
    setIsPublishing(true);
    try {
      await fetch(`/api/firms/${DEMO_FIRM_ID}/strategies`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: draftStrategy.name,
          description: draftStrategy.description,
          riskCategory: draftStrategy.riskCategory,
          minInvestment: draftStrategy.minInvestment,
          holdings: draftStrategy.holdings,
          status: "live",
        }),
      });
      setPublished(true);
      clearDraftStrategy();
    } catch {
      // fallback — still clear and redirect
      setPublished(true);
      clearDraftStrategy();
    } finally {
      setIsPublishing(false);
    }
  }

  if (published) {
    return (
      <div className="p-6 lg:p-10 flex items-center justify-center min-h-[60vh]">
        <div className="text-center max-w-md">
          <div className="w-20 h-20 rounded-full bg-[#10b77f]/10 flex items-center justify-center mx-auto mb-6">
            <span className="material-symbols-outlined text-[#10b77f] text-4xl">rocket_launch</span>
          </div>
          <h1 className="text-2xl font-bold text-[#181c1e] mb-2">Strategy Published!</h1>
          <p className="text-[#6c7a71] mb-8">
            Your strategy is now live on the marketplace. Investors can discover and invest in it immediately.
          </p>
          <div className="flex gap-3 justify-center">
            <Link
              href="/wm/strategies"
              className="bg-[#10b77f] text-white font-semibold rounded-full px-6 py-3 text-sm hover:bg-[#006c49] transition-colors"
            >
              View My Strategies
            </Link>
            <Link
              href="/wm/strategies/builder"
              className="bg-[#f1f4f6] text-[#181c1e] font-semibold rounded-full px-6 py-3 text-sm hover:bg-[#ebeef0] transition-colors"
            >
              Create Another
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-10">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-[#6c7a71] mb-6">
        <Link href="/wm/strategies" className="hover:text-[#181c1e]">Strategies</Link>
        <span className="material-symbols-outlined text-xs">chevron_right</span>
        <Link href="/wm/strategies/builder" className="hover:text-[#181c1e]">Builder</Link>
        <span className="material-symbols-outlined text-xs">chevron_right</span>
        <span className="text-[#181c1e] font-medium">Preview & Publish</span>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Left: Phone frame preview */}
        <div className="flex-1 flex justify-center">
          <div className="w-[375px]">
            <p className="text-xs font-semibold text-[#6c7a71] uppercase tracking-widest mb-4">
              Investor Preview
            </p>
            <div className="bg-[#181c1e] rounded-[2.5rem] p-3 shadow-2xl">
              <div className="bg-white rounded-[2rem] overflow-hidden min-h-[600px]">
                {/* Mini phone status bar */}
                <div className="flex items-center justify-between px-6 pt-3 pb-2">
                  <span className="text-xs font-semibold text-[#181c1e]">9:41</span>
                  <div className="flex gap-1">
                    <span className="material-symbols-outlined text-xs text-[#181c1e]">signal_cellular_alt</span>
                    <span className="material-symbols-outlined text-xs text-[#181c1e]">battery_full</span>
                  </div>
                </div>

                {/* Strategy card inside phone */}
                <div className="px-5 py-4">
                  <div className="flex items-center gap-2 mb-4">
                    <span className="material-symbols-outlined text-[#6c7a71] text-lg">arrow_back</span>
                    <span className="text-sm text-[#6c7a71]">Back</span>
                  </div>

                  <h2 className="text-xl font-bold text-[#181c1e] mb-1">
                    {draftStrategy.name || "Untitled Strategy"}
                  </h2>
                  <p className="text-xs text-[#6c7a71] mb-4 capitalize">
                    {draftStrategy.riskCategory} · Min €{(draftStrategy.minInvestment ?? 0).toLocaleString()}
                  </p>
                  <p className="text-sm text-[#3f4c43] leading-relaxed mb-5">
                    {draftStrategy.description || "No description provided."}
                  </p>

                  {/* Mock chart placeholder */}
                  <div className="bg-[#f1f4f6] rounded-xl h-32 flex items-center justify-center mb-5">
                    <span className="material-symbols-outlined text-[#bbcabf] text-3xl">show_chart</span>
                  </div>

                  {/* Holdings in phone */}
                  <p className="text-xs font-semibold text-[#6c7a71] uppercase tracking-widest mb-3">
                    Holdings ({holdings.length})
                  </p>
                  <div className="flex flex-col gap-2">
                    {holdings.slice(0, 5).map((h) => (
                      <div key={h.ticker} className="flex items-center justify-between py-1.5">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-md bg-[#ebeef0] flex items-center justify-center">
                            <span className="text-[10px] font-bold text-[#3f4c43]">{h.ticker.slice(0, 2)}</span>
                          </div>
                          <div>
                            <p className="text-xs font-semibold text-[#181c1e]">{h.ticker}</p>
                            <p className="text-[10px] text-[#6c7a71]">{h.name}</p>
                          </div>
                        </div>
                        <span className="text-xs font-semibold text-[#181c1e]">{h.weighting}%</span>
                      </div>
                    ))}
                    {holdings.length > 5 && (
                      <p className="text-xs text-[#6c7a71] text-center py-1">
                        +{holdings.length - 5} more holdings
                      </p>
                    )}
                  </div>

                  {/* Invest button in phone */}
                  <button className="w-full mt-6 bg-[#10b77f] text-white font-semibold rounded-full py-3 text-sm">
                    Invest Now
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Checklist + Publish */}
        <div className="lg:w-96 flex-shrink-0">
          <div className="bg-white rounded-2xl p-6 mb-6">
            <h2 className="text-lg font-bold text-[#181c1e] mb-1">Publishing Checklist</h2>
            <p className="text-sm text-[#6c7a71] mb-5">
              All items must pass before you can publish.
            </p>

            <div className="flex flex-col gap-3">
              {CHECKLIST.map((item) => {
                const passed = item.check(draftStrategy as Record<string, unknown>);
                return (
                  <div key={item.id} className="flex items-center gap-3">
                    <span
                      className={`material-symbols-outlined text-lg ${
                        passed ? "text-[#10b77f]" : "text-[#bbcabf]"
                      }`}
                    >
                      {passed ? "check_circle" : "radio_button_unchecked"}
                    </span>
                    <span
                      className={`text-sm ${
                        passed ? "text-[#181c1e]" : "text-[#6c7a71]"
                      }`}
                    >
                      {item.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Slide to publish */}
          <div className="bg-white rounded-2xl p-6">
            <p className="text-sm text-[#6c7a71] mb-4">
              {allPassed
                ? "All checks passed. Slide to publish your strategy to the marketplace."
                : "Complete all checklist items to enable publishing."}
            </p>
            <div className={`${!allPassed || isPublishing ? "opacity-40 pointer-events-none" : ""}`}>
              <SlideToConfirm
                label="Slide to publish"
                onConfirm={handlePublish}
                disabled={!allPassed || isPublishing}
              />
            </div>
          </div>

          {/* Back to builder */}
          <Link
            href="/wm/strategies/builder"
            className="flex items-center gap-1.5 text-sm font-medium text-[#6c7a71] hover:text-[#181c1e] transition-colors mt-4"
          >
            <span className="material-symbols-outlined text-base">arrow_back</span>
            Back to Builder
          </Link>
        </div>
      </div>
    </div>
  );
}
