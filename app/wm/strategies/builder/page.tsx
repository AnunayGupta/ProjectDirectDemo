"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAppStore, type Holding } from "@/lib/store";
import { DEMO_FIRM_ID } from "@/lib/mock-data";
import { StockSearch } from "@/components/wm/StockSearch";
import { STOCKS, type Stock } from "@/lib/stocks";

const RISK_OPTIONS = [
  { value: "conservative", label: "Conservative" },
  { value: "balanced", label: "Balanced" },
  { value: "growth", label: "Growth" },
  { value: "aggressive", label: "Aggressive" },
];

const STEPS = ["Identity", "Allocation", "Preview"];

const CHECKLIST = [
  { id: "compliance", label: "Firm compliance verified", check: (d: Partial<Record<string, unknown>>) => true }, // auto-pass for demo
  { id: "brand", label: "Brand profile complete", check: (d: Partial<Record<string, unknown>>) => !!(d.name as string) && !!(d.description as string) },
  { id: "weightings", label: "Weightings total 100%", check: (d: Partial<Record<string, unknown>>) => {
    const h = (d.holdings ?? []) as Array<{ weighting: number }>;
    return h.reduce((s, x) => s + x.weighting, 0) === 100;
  }},
  { id: "diversification", label: "Diversification requirements met", check: (d: Partial<Record<string, unknown>>) => ((d.holdings ?? []) as unknown[]).length >= 2 },
  { id: "description", label: "Strategy description added", check: (d: Partial<Record<string, unknown>>) => ((d.description as string) ?? "").length >= 10 },
];

function getStockPrice(ticker: string): Stock | undefined {
  return STOCKS.find((s) => s.ticker === ticker);
}

// Mock price changes (deterministic per ticker)
function getMockChange(ticker: string): number {
  const hash = ticker.split("").reduce((a, c) => a + c.charCodeAt(0), 0);
  return +(((hash % 7) - 3) * 0.42).toFixed(2);
}

export default function StrategyBuilder() {
  const router = useRouter();
  const { draftStrategy, setDraftStrategy, builderStep: step, setBuilderStep: setStep, clearDraftStrategy, isPublishing, setIsPublishing } = useAppStore();
  const [published, setPublished] = useState(false);

  const holdings = (draftStrategy.holdings ?? []) as Holding[];
  const totalWeight = holdings.reduce((sum, h) => sum + h.weighting, 0);
  const allChecksPassed = CHECKLIST.every((c) => c.check(draftStrategy as Record<string, unknown>));

  function addStock(stock: Stock) {
    const remaining = 100 - totalWeight;
    const defaultWeight = Math.min(
      Math.round(remaining / Math.max(1, 30 - holdings.length)),
      remaining
    );
    setDraftStrategy({
      holdings: [...holdings, { ticker: stock.ticker, name: stock.name, weighting: defaultWeight }],
    });
  }

  function removeStock(ticker: string) {
    setDraftStrategy({ holdings: holdings.filter((h) => h.ticker !== ticker) });
  }

  function updateWeight(ticker: string, weight: number) {
    setDraftStrategy({
      holdings: holdings.map((h) => (h.ticker === ticker ? { ...h, weighting: weight } : h)),
    });
  }

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
    } catch {
      // still proceed for demo
    } finally {
      setPublished(true);
      clearDraftStrategy();
      setIsPublishing(false);
    }
  }

  function handleNext() {
    if (step < 2) setStep(step + 1);
  }

  return (
    <div className="p-6 lg:p-10 max-w-5xl">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-[#6c7a71] mb-6">
        <Link href="/wm/strategies" className="hover:text-[#181c1e]">Strategies</Link>
        <span className="material-symbols-outlined text-xs">chevron_right</span>
        <span className="text-[#181c1e] font-medium">New Strategy</span>
        <span className="material-symbols-outlined text-xs">chevron_right</span>
        <span className="text-[#181c1e] font-medium">{STEPS[step]}</span>
      </div>

      {/* Step indicator */}
      <div className="flex items-center gap-3 mb-8">
        {STEPS.map((label, i) => (
          <button
            key={label}
            onClick={() => setStep(i)}
            className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              i === step
                ? "bg-[#10b77f] text-white"
                : i < step
                ? "bg-[#b7ebce] text-[#006c49]"
                : "bg-[#ebeef0] text-[#6c7a71]"
            }`}
          >
            <span className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center text-xs font-bold">
              {i < step ? "✓" : i + 1}
            </span>
            {label}
          </button>
        ))}
      </div>

      {/* Step 0: Identity */}
      {step === 0 && (
        <div className="flex flex-col lg:flex-row gap-6">
          <div className="bg-white rounded-2xl p-8 flex-1 max-w-lg">
            <h2 className="text-xl font-bold text-[#181c1e] mb-1">Strategy Identity</h2>
            <p className="text-sm text-[#6c7a71] mb-6">Define your strategy&apos;s core attributes.</p>

            <div className="flex flex-col gap-5">
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-semibold text-[#181c1e]">Strategy Name</label>
                <input
                  value={draftStrategy.name ?? ""}
                  onChange={(e) => setDraftStrategy({ name: e.target.value })}
                  placeholder="e.g. Elevate US Prime 30"
                  className="bg-[#f1f4f6] rounded-lg px-4 py-3 text-[#181c1e] placeholder:text-[#6c7a71] focus:ring-2 focus:ring-[#10b77f] outline-none text-sm border-0"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-semibold text-[#181c1e]">Description</label>
                <textarea
                  value={draftStrategy.description ?? ""}
                  onChange={(e) => setDraftStrategy({ description: e.target.value })}
                  placeholder="Describe your strategy's investment thesis…"
                  rows={3}
                  maxLength={240}
                  className="bg-[#f1f4f6] rounded-lg px-4 py-3 text-[#181c1e] placeholder:text-[#6c7a71] focus:ring-2 focus:ring-[#10b77f] outline-none text-sm border-0 resize-none"
                />
                <span className="text-xs text-[#6c7a71] self-end">
                  {(draftStrategy.description ?? "").length} / 240
                </span>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-semibold text-[#181c1e]">Risk Category</label>
                <select
                  value={draftStrategy.riskCategory ?? "growth"}
                  onChange={(e) =>
                    setDraftStrategy({ riskCategory: e.target.value as "conservative" | "balanced" | "growth" | "aggressive" })
                  }
                  className="bg-[#f1f4f6] rounded-lg px-4 py-3 text-[#181c1e] focus:ring-2 focus:ring-[#10b77f] outline-none text-sm border-0 appearance-none cursor-pointer"
                >
                  {RISK_OPTIONS.map((o) => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                  ))}
                </select>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-semibold text-[#181c1e]">Min. Investment</label>
                <div className="flex items-center bg-[#f1f4f6] rounded-lg overflow-hidden">
                  <span className="pl-4 text-sm font-semibold text-[#6c7a71]">€</span>
                  <input
                    type="number"
                    value={draftStrategy.minInvestment ?? 1000}
                    onChange={(e) => setDraftStrategy({ minInvestment: Number(e.target.value) })}
                    min={100}
                    step={100}
                    className="flex-1 bg-transparent px-2 py-3 text-[#181c1e] focus:ring-0 outline-none text-sm border-0"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Right: Security info panel */}
          <div className="lg:w-72 flex-shrink-0">
            <div className="bg-white rounded-2xl p-5">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-[#10b77f]/10 flex items-center justify-center">
                  <span className="material-symbols-outlined text-[#10b77f] text-xl">lock</span>
                </div>
                <p className="text-sm font-bold text-[#181c1e]">Institutional Grade Security</p>
              </div>
              <p className="text-xs text-[#6c7a71] leading-relaxed mb-4">
                All strategies are created within a FINRA-compliant framework. Your data is encrypted at rest and in transit.
              </p>
              <div className="flex flex-col gap-2.5">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[#10b77f] text-sm">check_circle</span>
                  <span className="text-xs text-[#3f4c43]">Bank-grade encryption</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[#10b77f] text-sm">check_circle</span>
                  <span className="text-xs text-[#3f4c43]">CBI regulatory compliance</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[#10b77f] text-sm">check_circle</span>
                  <span className="text-xs text-[#3f4c43]">Audit trail enabled</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Step 1: Allocation */}
      {step === 1 && (
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Left: search + holdings */}
          <div className="flex-1">
            <div className="bg-white rounded-2xl p-6">
              <h2 className="text-xl font-bold text-[#181c1e] mb-1">Allocation</h2>
              <p className="text-sm text-[#6c7a71] mb-5">
                Search and add stocks, then set target weightings.
              </p>

              <StockSearch
                onAdd={addStock}
                excludeTickers={holdings.map((h) => h.ticker)}
              />

              {/* Holdings list */}
              <div className="mt-5">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-xs font-semibold text-[#6c7a71] uppercase tracking-widest">
                    {holdings.length} Assets Selected
                  </p>
                  <span
                    className={`text-sm font-bold ${
                      totalWeight === 100 ? "text-[#10b77f]" : totalWeight > 100 ? "text-[#a43a3b]" : "text-[#6c7a71]"
                    }`}
                  >
                    {totalWeight}% Allocated
                  </span>
                </div>

                {totalWeight !== 100 && (
                  <div className={`rounded-lg px-4 py-2.5 mb-3 text-xs font-medium ${
                    totalWeight > 100 ? "bg-[#ffdad6] text-[#a43a3b]" : "bg-[#f1f4f6] text-[#6c7a71]"
                  }`}>
                    {totalWeight > 100
                      ? `Over-allocated by ${totalWeight - 100}%. Remove weight to reach 100%.`
                      : `Strategy requires 100% total weight to publish. ${100 - totalWeight}% remaining.`
                    }
                  </div>
                )}

                {/* Weight bar */}
                <div className="w-full h-2 bg-[#ebeef0] rounded-full mb-4 overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-300"
                    style={{
                      width: `${Math.min(totalWeight, 100)}%`,
                      background: totalWeight === 100 ? "#10b77f" : totalWeight > 100 ? "#a43a3b" : "#6c7a71",
                    }}
                  />
                </div>

                <div className="flex flex-col gap-2">
                  {holdings.map((h) => {
                    const stock = getStockPrice(h.ticker);
                    const change = getMockChange(h.ticker);
                    return (
                      <div
                        key={h.ticker}
                        className="flex items-center gap-3 bg-[#f7fafc] rounded-lg px-4 py-3"
                      >
                        <div className="w-8 h-8 rounded-lg bg-[#ebeef0] flex items-center justify-center flex-shrink-0">
                          <span className="text-xs font-bold text-[#3f4c43]">
                            {h.ticker.slice(0, 2)}
                          </span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-[#181c1e]">{h.ticker}</p>
                          <p className="text-xs text-[#6c7a71] truncate">{h.name}</p>
                        </div>
                        <div className="text-right mr-2 flex-shrink-0">
                          <p className="text-sm font-semibold text-[#181c1e]">${stock?.price.toFixed(2) ?? "—"}</p>
                          <p className={`text-xs font-medium ${change >= 0 ? "text-[#10b77f]" : "text-[#a43a3b]"}`}>
                            {change >= 0 ? "+" : ""}{change}%
                          </p>
                        </div>
                        <input
                          type="number"
                          value={h.weighting}
                          onChange={(e) => updateWeight(h.ticker, Math.max(0, Number(e.target.value)))}
                          min={0}
                          max={100}
                          className="w-16 bg-white rounded-lg px-2 py-1.5 text-sm text-center font-semibold text-[#181c1e] focus:ring-2 focus:ring-[#10b77f] outline-none border-0"
                        />
                        <span className="text-sm text-[#6c7a71]">%</span>
                        <button
                          onClick={() => removeStock(h.ticker)}
                          className="text-[#6c7a71] hover:text-[#a43a3b] transition-colors"
                        >
                          <span className="material-symbols-outlined text-lg">delete</span>
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* Right: summary */}
          <div className="lg:w-72 flex-shrink-0">
            <div className="bg-white rounded-2xl p-5 sticky top-6">
              <p className="text-xs font-semibold text-[#6c7a71] uppercase tracking-widest mb-4">
                Composition
              </p>
              <div className="flex flex-col gap-3">
                <div className="flex justify-between text-sm">
                  <span className="text-[#6c7a71]">Stocks</span>
                  <span className="font-semibold text-[#181c1e]">{holdings.length}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-[#6c7a71]">Total Weight</span>
                  <span className={`font-semibold ${totalWeight === 100 ? "text-[#10b77f]" : "text-[#a43a3b]"}`}>
                    {totalWeight}%
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-[#6c7a71]">Top Holding</span>
                  <span className="font-semibold text-[#181c1e]">
                    {holdings.length > 0
                      ? `${[...holdings].sort((a, b) => b.weighting - a.weighting)[0].ticker} (${[...holdings].sort((a, b) => b.weighting - a.weighting)[0].weighting}%)`
                      : "—"
                    }
                  </span>
                </div>
                <div className="h-px bg-[#f1f4f6]" />
                <div className="flex justify-between text-sm">
                  <span className="text-[#6c7a71]">Est. Volatility</span>
                  <span className="font-semibold text-[#181c1e]">14.2%</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-[#6c7a71]">Dividend Yield</span>
                  <span className="font-semibold text-[#181c1e]">1.28%</span>
                </div>
              </div>

              {/* Concentration risk warning */}
              {holdings.some((h) => h.weighting > 10) && (
                <div className="mt-4 bg-[#fef3c7] rounded-lg px-3 py-2.5 flex items-start gap-2">
                  <span className="material-symbols-outlined text-[#f59e0b] text-sm mt-0.5">warning</span>
                  <p className="text-xs text-[#92400e] leading-relaxed">
                    {holdings.filter((h) => h.weighting > 10).map((h) => h.ticker).join(" & ")} exceed{holdings.filter((h) => h.weighting > 10).length === 1 ? "s" : ""} 10% individual weighting
                  </p>
                </div>
              )}

              {/* Save Draft button */}
              <button
                onClick={() => router.push("/wm/strategies")}
                className="w-full mt-5 bg-[#f1f4f6] text-[#181c1e] font-semibold rounded-full py-2.5 text-sm hover:bg-[#ebeef0] transition-colors"
              >
                Save Draft
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Step 2: Preview + Publish */}
      {step === 2 && !published && (
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Left: Strategy preview card */}
          <div className="flex-1">
            <p className="text-xs font-semibold text-[#6c7a71] uppercase tracking-widest mb-4">
              Strategy Preview
            </p>
            <div className="bg-white rounded-2xl p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h2 className="text-xl font-bold text-[#181c1e]">
                    {draftStrategy.name || "Untitled Strategy"}
                  </h2>
                  <p className="text-sm text-[#6c7a71] capitalize mt-1">
                    {draftStrategy.riskCategory} · Min €{(draftStrategy.minInvestment ?? 0).toLocaleString()}
                  </p>
                </div>
                <span className="bg-[#ebeef0] text-[#6c7a71] text-xs font-semibold rounded-full px-3 py-1">
                  Draft
                </span>
              </div>

              <p className="text-sm text-[#3f4c43] leading-relaxed mb-6">
                {draftStrategy.description || "No description provided."}
              </p>

              {/* Mock performance metrics */}
              <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="bg-[#f7fafc] rounded-xl p-4">
                  <p className="text-xs text-[#6c7a71] mb-1">Est. Return</p>
                  <p className="text-lg font-bold text-[#10b77f]">+12.4%</p>
                </div>
                <div className="bg-[#f7fafc] rounded-xl p-4">
                  <p className="text-xs text-[#6c7a71] mb-1">Volatility</p>
                  <p className="text-lg font-bold text-[#181c1e]">14.2%</p>
                </div>
                <div className="bg-[#f7fafc] rounded-xl p-4">
                  <p className="text-xs text-[#6c7a71] mb-1">Holdings</p>
                  <p className="text-lg font-bold text-[#181c1e]">{holdings.length}</p>
                </div>
              </div>

              {/* Asset allocation summary */}
              <p className="text-xs font-semibold text-[#6c7a71] uppercase tracking-widest mb-3">
                Asset Allocation
              </p>
              <div className="flex flex-col gap-2">
                {holdings.slice(0, 6).map((h) => (
                  <div key={h.ticker} className="flex items-center gap-3">
                    <div className="w-7 h-7 rounded-md bg-[#ebeef0] flex items-center justify-center flex-shrink-0">
                      <span className="text-[10px] font-bold text-[#3f4c43]">{h.ticker.slice(0, 2)}</span>
                    </div>
                    <span className="text-sm font-medium text-[#181c1e] flex-1">{h.ticker}</span>
                    <div className="w-24 h-1.5 bg-[#ebeef0] rounded-full overflow-hidden">
                      <div className="h-full bg-[#10b77f] rounded-full" style={{ width: `${h.weighting}%` }} />
                    </div>
                    <span className="text-sm font-semibold text-[#181c1e] w-10 text-right">{h.weighting}%</span>
                  </div>
                ))}
                {holdings.length > 6 && (
                  <p className="text-xs text-[#6c7a71] text-center py-1">+{holdings.length - 6} more holdings</p>
                )}
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
                      <span className={`material-symbols-outlined text-lg ${passed ? "text-[#10b77f]" : "text-[#bbcabf]"}`}>
                        {passed ? "check_circle" : "radio_button_unchecked"}
                      </span>
                      <span className={`text-sm ${passed ? "text-[#181c1e]" : "text-[#6c7a71]"}`}>
                        {item.label}
                      </span>
                    </div>
                  );
                })}
              </div>

              {!allChecksPassed && (
                <div className="mt-4 bg-[#ffdad6] rounded-lg px-4 py-2.5 text-xs font-medium text-[#a43a3b] flex items-center gap-2">
                  <span className="material-symbols-outlined text-sm">warning</span>
                  Fix the unchecked items above to enable publishing.
                </div>
              )}
            </div>

            {/* Publish actions */}
            <div className="flex flex-col gap-3">
              <button
                onClick={handlePublish}
                disabled={!allChecksPassed || isPublishing}
                className="w-full bg-[#10b77f] text-white font-semibold rounded-full py-3.5 text-sm hover:bg-[#006c49] transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isPublishing ? (
                  <>
                    <span className="material-symbols-outlined text-lg animate-spin">refresh</span>
                    Publishing…
                  </>
                ) : (
                  <>
                    <span className="material-symbols-outlined text-lg">rocket_launch</span>
                    Publish to Marketplace
                  </>
                )}
              </button>
              <div className="flex gap-3">
                <button
                  onClick={() => setStep(1)}
                  className="flex-1 bg-white text-[#181c1e] font-semibold rounded-full py-3 text-sm hover:bg-[#f1f4f6] transition-colors"
                >
                  Edit Strategy
                </button>
                <button
                  onClick={() => router.push("/wm/strategies")}
                  className="flex-1 bg-white text-[#6c7a71] font-semibold rounded-full py-3 text-sm hover:bg-[#f1f4f6] transition-colors"
                >
                  Save as Draft
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Published success state */}
      {published && (
        <div className="flex items-center justify-center min-h-[50vh]">
          <div className="text-center max-w-md">
            <div className="w-20 h-20 rounded-full bg-[#10b77f]/10 flex items-center justify-center mx-auto mb-6">
              <span className="material-symbols-outlined text-[#10b77f] text-4xl">rocket_launch</span>
            </div>
            <h2 className="text-2xl font-bold text-[#181c1e] mb-2">Strategy Published!</h2>
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
              <button
                onClick={() => { setPublished(false); setStep(0); }}
                className="bg-[#f1f4f6] text-[#181c1e] font-semibold rounded-full px-6 py-3 text-sm hover:bg-[#ebeef0] transition-colors"
              >
                Create Another
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Navigation buttons (steps 0 and 1 only) */}
      {step < 2 && (
        <div className="flex items-center justify-between mt-8">
          {step > 0 ? (
            <button
              onClick={() => setStep(step - 1)}
              className="text-sm font-medium text-[#6c7a71] hover:text-[#181c1e] flex items-center gap-1 transition-colors"
            >
              <span className="material-symbols-outlined text-base">arrow_back</span>
              Back
            </button>
          ) : (
            <Link
              href="/wm/strategies"
              className="text-sm font-medium text-[#6c7a71] hover:text-[#181c1e] transition-colors"
            >
              Cancel
            </Link>
          )}

          <button
            onClick={handleNext}
            className="bg-[#10b77f] text-white font-semibold rounded-full px-6 py-2.5 text-sm hover:bg-[#006c49] transition-colors flex items-center gap-2"
          >
            Next: {STEPS[step + 1]}
            <span className="material-symbols-outlined text-base">arrow_forward</span>
          </button>
        </div>
      )}

    </div>
  );
}
