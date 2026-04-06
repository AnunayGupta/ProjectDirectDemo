import Link from "next/link";

const STEPS = [
  { label: "Submitted", icon: "check_circle", done: true },
  { label: "Review", icon: "check_circle", done: true },
  { label: "Approved", icon: "verified", done: true },
];

export default function ApprovalStatus() {
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
          <Link href="/" className="hover:text-[#181c1e] transition-colors">Logout</Link>
        </div>
      </header>

      {/* Content with hero gradient */}
      <main className="flex-1 flex items-center justify-center px-4 py-16" style={{ background: "linear-gradient(135deg, #006c4910, #10b77f18, #006c4908)" }}>
        <div className="w-full max-w-md text-center">
          {/* Icon */}
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-white/80 shadow-sm mb-6">
            <span className="material-symbols-outlined text-[#10b77f] text-4xl">verified</span>
          </div>

          <h1 className="text-3xl font-bold text-[#181c1e] mb-3">You&apos;re approved.</h1>
          <p className="text-[#3f4c43] mb-10 leading-relaxed">
            Welcome to Project Direct. Your firm profile is ready for institutional strategy creation.
          </p>

          {/* Progress tracker */}
          <div className="flex items-center justify-center gap-0 mb-10">
            {STEPS.map((step, i) => (
              <div key={step.label} className="flex items-center">
                <div className="flex flex-col items-center gap-1.5">
                  <div className="w-10 h-10 rounded-full bg-[#10b77f] flex items-center justify-center shadow-sm">
                    <span className="material-symbols-outlined text-white text-xl">{step.icon}</span>
                  </div>
                  <span className="text-xs font-semibold text-[#10b77f]">{step.label}</span>
                </div>
                {i < STEPS.length - 1 && (
                  <div className="w-16 h-0.5 bg-[#10b77f] mx-1 mb-5" />
                )}
              </div>
            ))}
          </div>

          {/* Application summary */}
          <div className="bg-white rounded-2xl p-6 text-left mb-8">
            <p className="text-xs font-semibold text-[#6c7a71] uppercase tracking-widest mb-4">
              Application Summary
            </p>
            <div className="flex flex-col gap-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-[#6c7a71]">Firm</span>
                <span className="text-sm font-semibold text-[#181c1e]">Elevate Capital Management</span>
              </div>
              <div className="h-px bg-[#f1f4f6]" />
              <div className="flex justify-between items-center">
                <span className="text-sm text-[#6c7a71]">CBI Reference</span>
                <span className="text-sm font-semibold text-[#181c1e]">CBI-8829-QX-2024</span>
              </div>
              <div className="h-px bg-[#f1f4f6]" />
              <div className="flex justify-between items-center">
                <span className="text-sm text-[#6c7a71]">Status</span>
                <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#386850] bg-[#b7ebce] rounded-full px-3 py-1">
                  <span className="material-symbols-outlined text-sm">check</span>
                  Approved
                </span>
              </div>
            </div>
          </div>

          {/* CTAs */}
          <div className="flex flex-col gap-3">
            <Link
              href="/wm/strategies"
              className="w-full bg-[#10b77f] text-white font-semibold rounded-full py-3.5 hover:bg-[#006c49] transition-colors flex items-center justify-center gap-2"
            >
              Create Your First Strategy
              <span className="material-symbols-outlined text-lg">arrow_forward</span>
            </Link>
            <a
              href="#"
              className="w-full bg-white text-[#181c1e] font-semibold rounded-full py-3.5 hover:bg-[#f1f4f6] transition-colors flex items-center justify-center gap-2"
            >
              Explore Documentation
              <span className="material-symbols-outlined text-lg">open_in_new</span>
            </a>
          </div>
        </div>
      </main>

      <footer className="flex items-center justify-center gap-4 py-6 text-xs text-[#6c7a71]">
        <a href="#" className="hover:text-[#181c1e]">Privacy Policy</a>
        <span>·</span>
        <a href="#" className="hover:text-[#181c1e]">Terms of Service</a>
        <span>·</span>
        <a href="#" className="hover:text-[#181c1e]">Contact Support</a>
      </footer>
    </div>
  );
}
