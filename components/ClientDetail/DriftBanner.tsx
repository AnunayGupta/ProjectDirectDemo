import { getDriftStatus } from '@/lib/utils'

interface DriftBannerProps {
  draftStartedAt: string | null
  sentForApprovalAt: string | null
}

export default function DriftBanner({ draftStartedAt, sentForApprovalAt }: DriftBannerProps) {
  if (sentForApprovalAt) {
    return (
      <div className="flex items-start gap-3 px-5 py-4 rounded border border-[#D4800A]/30 bg-[#FFF8F0] mb-6">
        <span className="material-symbols-outlined text-[#D4800A] text-[18px] mt-px">schedule</span>
        <div>
          <p className="text-sm font-medium text-[#D4800A]">Awaiting Client Approval</p>
          <p className="text-xs text-[#D4800A]/70 mt-0.5">Proposed changes have been sent. Trades will execute once the client approves.</p>
        </div>
      </div>
    )
  }

  if (!draftStartedAt) return null

  const drift = getDriftStatus(draftStartedAt)
  if (drift.status === 'green') return null

  const isRed = drift.status === 'red'

  return (
    <div className={`flex items-start gap-3 px-5 py-4 rounded border mb-6 ${
      isRed
        ? 'border-red-300 bg-[#FFF5F5]'
        : 'border-[#D4800A]/30 bg-[#FFF8F0]'
    }`}>
      <span className={`material-symbols-outlined text-[18px] mt-px ${isRed ? 'text-red-600' : 'text-[#D4800A]'}`}>
        {isRed ? 'error' : 'warning'}
      </span>
      <div>
        <p className={`text-sm font-medium ${isRed ? 'text-red-700' : 'text-[#D4800A]'}`}>
          Target Drift Status — {drift.label}
        </p>
        <p className={`text-xs mt-0.5 ${isRed ? 'text-red-600/70' : 'text-[#D4800A]/70'}`}>
          Current allocation has diverged from mandate. Proposed changes are pending — send for client approval to execute trades.
        </p>
      </div>
    </div>
  )
}
