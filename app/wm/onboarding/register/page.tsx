"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { DEMO_FIRM_ID } from "@/lib/mock-data";

export default function FirmRegistration() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [confirmed, setConfirmed] = useState(false);
  const [form, setForm] = useState({
    legalName: "",
    cbiReference: "",
    contactName: "",
    contactEmail: "",
    website: "",
    regulatoryStatus: "",
  });

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      await fetch(`/api/firms/${DEMO_FIRM_ID}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          legalName: form.legalName,
          displayName: form.legalName,
          advisorName: form.contactName,
          status: "approved", // auto-approve for demo
        }),
      });
      router.push("/wm/onboarding/brand");
    } catch {
      router.push("/wm/onboarding/brand");
    }
  }

  return (
    <div className="min-h-screen bg-[#f7fafc] flex flex-col">
      {/* Header */}
      <header className="bg-white px-8 py-5 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-[#10b77f] flex items-center justify-center">
            <span className="material-symbols-outlined text-white text-lg">trending_up</span>
          </div>
          <span className="text-lg font-bold text-[#181c1e]">Project Direct</span>
        </div>
        <div className="flex items-center gap-6 text-sm text-[#6c7a71]">
          <Link href="#" className="hover:text-[#181c1e] transition-colors">Support</Link>
          <Link href="/" className="hover:text-[#181c1e] transition-colors">Back to Home</Link>
        </div>
      </header>

      {/* Content */}
      <main className="flex-1 flex items-start justify-center px-4 py-12">
        <div className="w-full max-w-lg">
          {/* Title */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-[#181c1e] mb-2">Register your firm</h1>
            <p className="text-[#6c7a71]">Only CBI-regulated entities may publish strategies.</p>
          </div>

          {/* Trust badges */}
          <div className="flex gap-3 mb-8">
            <div className="flex items-center gap-2 bg-white rounded-xl px-4 py-2.5">
              <span className="material-symbols-outlined text-[#10b77f] text-base">verified_user</span>
              <span className="text-xs font-medium text-[#3f4c43]">Secure Portal — Bank-grade encryption</span>
            </div>
            <div className="flex items-center gap-2 bg-white rounded-xl px-4 py-2.5">
              <span className="material-symbols-outlined text-[#10b77f] text-base">account_balance</span>
              <span className="text-xs font-medium text-[#3f4c43]">CBI Compliant — Regulatory standard flow</span>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="bg-white rounded-2xl p-8 flex flex-col gap-5">
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-semibold text-[#181c1e]">
                Firm legal name <span className="text-[#a43a3b]">*</span>
              </label>
              <input
                name="legalName"
                value={form.legalName}
                onChange={handleChange}
                required
                placeholder="e.g. Elevate Capital Management Ltd."
                className="bg-[#f1f4f6] rounded-lg px-4 py-3 text-[#181c1e] placeholder:text-[#6c7a71] focus:ring-2 focus:ring-[#10b77f] outline-none text-sm border-0"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-semibold text-[#181c1e]">
                CBI Reference Number <span className="text-[#a43a3b]">*</span>
              </label>
              <input
                name="cbiReference"
                value={form.cbiReference}
                onChange={handleChange}
                required
                placeholder="e.g. CBI-8829-QX-2024"
                className="bg-[#f1f4f6] rounded-lg px-4 py-3 text-[#181c1e] placeholder:text-[#6c7a71] focus:ring-2 focus:ring-[#10b77f] outline-none text-sm border-0"
              />
              <a href="#" className="text-xs text-[#10b77f] font-medium hover:underline self-start">
                Find your CBI reference →
              </a>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-semibold text-[#181c1e]">Principal contact name</label>
                <input
                  name="contactName"
                  value={form.contactName}
                  onChange={handleChange}
                  placeholder="Full name"
                  className="bg-[#f1f4f6] rounded-lg px-4 py-3 text-[#181c1e] placeholder:text-[#6c7a71] focus:ring-2 focus:ring-[#10b77f] outline-none text-sm border-0"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-semibold text-[#181c1e]">Principal contact email</label>
                <input
                  name="contactEmail"
                  value={form.contactEmail}
                  onChange={handleChange}
                  type="email"
                  placeholder="you@firm.com"
                  className="bg-[#f1f4f6] rounded-lg px-4 py-3 text-[#181c1e] placeholder:text-[#6c7a71] focus:ring-2 focus:ring-[#10b77f] outline-none text-sm border-0"
                />
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-semibold text-[#181c1e]">Firm website</label>
              <input
                name="website"
                value={form.website}
                onChange={handleChange}
                placeholder="https://yourfirm.com"
                className="bg-[#f1f4f6] rounded-lg px-4 py-3 text-[#181c1e] placeholder:text-[#6c7a71] focus:ring-2 focus:ring-[#10b77f] outline-none text-sm border-0"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-semibold text-[#181c1e]">
                Regulatory status <span className="text-[#a43a3b]">*</span>
              </label>
              <select
                name="regulatoryStatus"
                value={form.regulatoryStatus}
                onChange={handleChange}
                required
                className="bg-[#f1f4f6] rounded-lg px-4 py-3 text-[#181c1e] focus:ring-2 focus:ring-[#10b77f] outline-none text-sm border-0 appearance-none cursor-pointer"
              >
                <option value="">Select regulatory status…</option>
                <option value="investment-intermediary">Investment Intermediary</option>
                <option value="investment-business-firm">Investment Business Firm</option>
                <option value="mifid-firm">MIFID Firm</option>
              </select>
            </div>

            {/* Confirmation checkbox */}
            <label className="flex items-start gap-3 cursor-pointer pt-1">
              <input
                type="checkbox"
                checked={confirmed}
                onChange={(e) => setConfirmed(e.target.checked)}
                className="mt-0.5 w-4 h-4 rounded accent-[#10b77f]"
              />
              <span className="text-xs text-[#3f4c43] leading-relaxed">
                I confirm this firm is authorised by the Central Bank of Ireland and all information provided is accurate.
              </span>
            </label>

            <div className="pt-2">
              <button
                type="submit"
                disabled={loading || !confirmed}
                className="w-full bg-[#10b77f] text-white font-semibold rounded-full py-3.5 hover:bg-[#006c49] transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <span className="material-symbols-outlined text-lg animate-spin">refresh</span>
                    Submitting…
                  </>
                ) : (
                  "Submit for Review"
                )}
              </button>
              <p className="text-xs text-[#6c7a71] text-center mt-3">
                Your application will be reviewed within 2 business days.
              </p>
            </div>
          </form>

          {/* Footer */}
          <div className="flex flex-col items-center gap-3 mt-8">
            <div className="flex items-center justify-center gap-4 text-xs text-[#6c7a71]">
              <a href="#" className="hover:text-[#181c1e]">Privacy Policy</a>
              <span>·</span>
              <a href="#" className="hover:text-[#181c1e]">Terms of Service</a>
              <span>·</span>
              <a href="#" className="hover:text-[#181c1e]">Regulatory Disclosures</a>
              <span>·</span>
              <a href="#" className="hover:text-[#181c1e]">Cookie Policy</a>
            </div>
            <p className="text-xs text-[#bbcabf]">© 2024 Project Direct. All rights reserved.</p>
          </div>
        </div>
      </main>
    </div>
  );
}
