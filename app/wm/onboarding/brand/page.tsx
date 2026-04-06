"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { DEMO_FIRM_ID } from "@/lib/mock-data";

const ACCENT_PRESETS = [
  "#10b77f", "#006c49", "#3b82f6", "#8b5cf6",
  "#f59e0b", "#ef4444", "#0ea5e9", "#ec4899",
];

export default function BrandStudio() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    displayName: "Elevate Capital",
    bio: "We believe every investor deserves institutional-grade portfolio construction.",
    accentColor: "#10b77f",
    advisorName: "Alexandra Chen",
    advisorTitle: "Chief Investment Officer",
  });

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      await fetch(`/api/firms/${DEMO_FIRM_ID}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      router.push("/wm/onboarding/status");
    } catch {
      router.push("/wm/onboarding/status");
    }
  }

  return (
    <div className="min-h-screen bg-[#f7fafc] flex flex-col">
      {/* Header */}
      <header className="bg-white px-8 py-5 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: form.accentColor }}>
            <span className="material-symbols-outlined text-white text-lg">trending_up</span>
          </div>
          <span className="text-lg font-bold text-[#181c1e]">{form.displayName || "Your Firm"}</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-[#6c7a71]">
          <span className="material-symbols-outlined text-base">looks_two</span>
          Step 2 of 3
        </div>
      </header>

      <main className="flex-1 flex gap-0">
        {/* Left Panel — Edit */}
        <div className="w-full max-w-lg flex-shrink-0 p-8 overflow-y-auto">
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-[#181c1e] mb-1.5">Brand Studio</h1>
            <p className="text-[#6c7a71] text-sm">Customise how your firm appears to investors.</p>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            {/* Display name */}
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-semibold text-[#181c1e]">Display name</label>
              <input
                name="displayName"
                value={form.displayName}
                onChange={handleChange}
                required
                placeholder="e.g. Elevate Capital"
                className="bg-[#f1f4f6] rounded-lg px-4 py-3 text-[#181c1e] placeholder:text-[#6c7a71] focus:ring-2 focus:ring-[#10b77f] outline-none text-sm border-0"
              />
            </div>

            {/* Bio */}
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-semibold text-[#181c1e]">Firm bio</label>
              <textarea
                name="bio"
                value={form.bio}
                onChange={handleChange}
                rows={3}
                placeholder="Describe your investment philosophy…"
                className="bg-[#f1f4f6] rounded-lg px-4 py-3 text-[#181c1e] placeholder:text-[#6c7a71] focus:ring-2 focus:ring-[#10b77f] outline-none text-sm border-0 resize-none"
              />
            </div>

            {/* Accent color */}
            <div className="flex flex-col gap-2">
              <label className="text-sm font-semibold text-[#181c1e]">Accent colour</label>
              <div className="flex items-center gap-3">
                <div className="flex gap-2 flex-wrap">
                  {ACCENT_PRESETS.map((color) => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => setForm((p) => ({ ...p, accentColor: color }))}
                      className="w-8 h-8 rounded-full transition-transform hover:scale-110"
                      style={{
                        background: color,
                        outline: form.accentColor === color ? `2px solid ${color}` : "none",
                        outlineOffset: "2px",
                      }}
                    />
                  ))}
                </div>
                <label className="flex items-center gap-2 cursor-pointer text-sm text-[#6c7a71]">
                  <input
                    type="color"
                    value={form.accentColor}
                    onChange={(e) => setForm((p) => ({ ...p, accentColor: e.target.value }))}
                    className="w-8 h-8 rounded cursor-pointer border-0 bg-transparent p-0"
                  />
                  Custom
                </label>
              </div>
            </div>

            {/* Advisor */}
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-semibold text-[#181c1e]">Lead advisor name</label>
                <input
                  name="advisorName"
                  value={form.advisorName}
                  onChange={handleChange}
                  placeholder="Full name"
                  className="bg-[#f1f4f6] rounded-lg px-4 py-3 text-[#181c1e] placeholder:text-[#6c7a71] focus:ring-2 focus:ring-[#10b77f] outline-none text-sm border-0"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-semibold text-[#181c1e]">Advisor title</label>
                <input
                  name="advisorTitle"
                  value={form.advisorTitle}
                  onChange={handleChange}
                  placeholder="e.g. CIO"
                  className="bg-[#f1f4f6] rounded-lg px-4 py-3 text-[#181c1e] placeholder:text-[#6c7a71] focus:ring-2 focus:ring-[#10b77f] outline-none text-sm border-0"
                />
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full text-white font-semibold rounded-full py-3.5 hover:opacity-90 transition-opacity disabled:opacity-60 flex items-center justify-center gap-2"
                style={{ background: form.accentColor }}
              >
                {loading ? (
                  <>
                    <span className="material-symbols-outlined text-lg animate-spin">refresh</span>
                    Saving…
                  </>
                ) : (
                  <>
                    Save & Continue
                    <span className="material-symbols-outlined text-lg">arrow_forward</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Right Panel — Live Preview */}
        <div className="flex-1 bg-[#ebeef0] flex items-center justify-center p-12 hidden lg:flex">
          <div className="w-full max-w-sm">
            <p className="text-xs font-semibold text-[#6c7a71] uppercase tracking-widest mb-4">
              Investor preview
            </p>

            {/* Firm card preview */}
            <div className="bg-white rounded-2xl overflow-hidden shadow-sm">
              {/* Banner */}
              <div className="h-20 w-full" style={{ background: `linear-gradient(135deg, ${form.accentColor}33, ${form.accentColor}11)` }}>
                <div className="h-full flex items-end px-5 pb-3">
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center shadow-md"
                    style={{ background: form.accentColor }}>
                    <span className="material-symbols-outlined text-white text-2xl">trending_up</span>
                  </div>
                </div>
              </div>

              <div className="p-5">
                <h3 className="text-lg font-bold text-[#181c1e] mb-0.5">
                  {form.displayName || "Your Firm"}
                </h3>
                <p className="text-xs text-[#6c7a71] mb-3">
                  {form.advisorName ? `${form.advisorName}${form.advisorTitle ? ` · ${form.advisorTitle}` : ""}` : "Your Name · Your Title"}
                </p>
                <p className="text-sm text-[#3f4c43] leading-relaxed mb-4">
                  {form.bio || "Your firm bio will appear here."}
                </p>

                {/* Mock strategy card */}
                <div className="bg-[#f1f4f6] rounded-xl p-3.5 flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
                    style={{ background: `${form.accentColor}22` }}>
                    <span className="material-symbols-outlined text-base" style={{ color: form.accentColor }}>bar_chart</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-[#181c1e] truncate">Elevate US Prime 30</p>
                    <p className="text-xs text-[#6c7a71]">Growth · Min €1,000</p>
                  </div>
                  <span className="text-sm font-bold" style={{ color: form.accentColor }}>+14.7%</span>
                </div>
              </div>
            </div>

            {/* Accent pill */}
            <div className="mt-4 flex items-center gap-2">
              <div className="w-3 h-3 rounded-full" style={{ background: form.accentColor }} />
              <span className="text-xs text-[#6c7a71]">Accent: {form.accentColor}</span>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
