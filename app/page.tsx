import Link from "next/link";

export default function DemoLauncher() {
  return (
    <main className="min-h-screen bg-[#f7fafc] flex flex-col items-center justify-center p-8">
      {/* Logo */}
      <div className="mb-12 text-center">
        <div className="inline-flex items-center gap-2.5 mb-3">
          <div className="w-9 h-9 rounded-xl bg-[#10b77f] flex items-center justify-center">
            <span className="material-symbols-outlined text-white text-xl">trending_up</span>
          </div>
          <span className="text-2xl font-bold text-[#181c1e]">Project Direct</span>
        </div>
        <p className="text-[#6c7a71] text-sm">B2B2C Investment Platform Demo</p>
      </div>

      {/* Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-2xl">
        {/* Wealth Manager */}
        <Link href="/wm/onboarding/register" className="group">
          <div className="bg-white rounded-2xl p-8 flex flex-col items-center text-center gap-5 hover:shadow-lg transition-all duration-200 group-hover:-translate-y-0.5 cursor-pointer">
            <div className="w-16 h-16 rounded-2xl bg-[#f1f4f6] flex items-center justify-center group-hover:bg-[#10b77f]/10 transition-colors">
              <span className="material-symbols-outlined text-[#10b77f] text-3xl">
                business_center
              </span>
            </div>
            <div>
              <h2 className="text-lg font-bold text-[#181c1e] mb-1.5">
                I&apos;m a Wealth Manager
              </h2>
              <p className="text-sm text-[#6c7a71] leading-relaxed">
                Create and publish direct indexing strategies for your clients
              </p>
            </div>
            <div className="flex items-center gap-1.5 text-sm font-semibold text-[#10b77f]">
              Open Portal
              <span className="material-symbols-outlined text-base">arrow_forward</span>
            </div>
          </div>
        </Link>

        {/* Investor */}
        <Link href="/invest" className="group">
          <div className="bg-white rounded-2xl p-8 flex flex-col items-center text-center gap-5 hover:shadow-lg transition-all duration-200 group-hover:-translate-y-0.5 cursor-pointer">
            <div className="w-16 h-16 rounded-2xl bg-[#f1f4f6] flex items-center justify-center group-hover:bg-[#10b77f]/10 transition-colors">
              <span className="material-symbols-outlined text-[#10b77f] text-3xl">
                savings
              </span>
            </div>
            <div>
              <h2 className="text-lg font-bold text-[#181c1e] mb-1.5">
                I&apos;m an Investor
              </h2>
              <p className="text-sm text-[#6c7a71] leading-relaxed">
                Browse strategies and invest with direct indexing tax benefits
              </p>
            </div>
            <div className="flex items-center gap-1.5 text-sm font-semibold text-[#10b77f]">
              Open App
              <span className="material-symbols-outlined text-base">arrow_forward</span>
            </div>
          </div>
        </Link>
      </div>

      {/* Footer hint */}
      <p className="mt-10 text-xs text-[#6c7a71] text-center max-w-sm">
        Demo only — no real trades, no real money. Open both on separate devices for the
        cross-device publishing moment.
      </p>
    </main>
  );
}
