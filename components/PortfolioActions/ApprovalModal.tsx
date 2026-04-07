'use client'
import { Holding } from '@/lib/types'
import { formatCurrency } from '@/lib/utils'
import { firmConfig } from '@/lib/firm-config'

interface ApprovalModalProps {
  clientName: string
  clientId: string
  totalValue: number
  holdings: Holding[]
  onConfirm: () => void
  onCancel: () => void
  isSubmitting: boolean
}

export default function ApprovalModal({
  clientName,
  clientId,
  totalValue,
  holdings,
  onConfirm,
  onCancel,
  isSubmitting,
}: ApprovalModalProps) {
  const trades = holdings
    .map(h => {
      const delta = ((h.targetWeighting - h.currentWeighting) / 100) * totalValue
      return { ...h, delta }
    })
    .filter(t => Math.abs(t.delta) > 1)

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ backgroundColor: 'rgba(26,26,26,0.6)' }}
    >
      <div
        className="bg-surface rounded-lg shadow-2xl w-full max-w-[520px] mx-4 animate-[fadeIn_0.2s_ease-out]"
        style={{ animationFillMode: 'both' }}
      >
        {/* Header */}
        <div className="px-8 pt-8 pb-6 border-b border-border/40">
          <h2 className="font-heading text-2xl text-text mb-1">Send for Approval</h2>
          <p className="text-sm text-sage">{clientName}</p>
        </div>

        {/* Body */}
        <div className="px-8 py-6">
          <p className="text-sm text-text mb-5">
            This will generate trade instructions for <strong>{clientName}</strong> and send them for client approval.
            This action cannot be undone.
          </p>

          {/* Proposed trades */}
          {trades.length > 0 && (
            <div className="space-y-0 rounded border border-border/50 overflow-hidden mb-6">
              {trades.map(t => {
                const isBuy = t.delta > 0
                return (
                  <div key={t.ticker} className={`flex items-center justify-between px-4 py-3 border-b border-border/30 last:border-0 ${
                    isBuy ? 'bg-[#F5FFF8]' : 'bg-[#FFF5F5]'
                  }`}>
                    <div className="flex items-center gap-2">
                      <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded uppercase ${
                        isBuy ? 'bg-[#2D6A4F] text-white' : 'bg-[#C0392B] text-white'
                      }`}>
                        {isBuy ? 'BUY' : 'SELL'}
                      </span>
                      <span className="font-medium text-sm text-text">{t.ticker}</span>
                      <span className="text-xs text-sage">{t.name}</span>
                    </div>
                    <span className={`font-bold tabular-nums text-sm ${isBuy ? 'text-[#2D6A4F]' : 'text-[#C0392B]'}`}>
                      {isBuy ? '+' : '-'}{formatCurrency(Math.abs(t.delta))}
                    </span>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-8 pb-8 flex items-center justify-end gap-3">
          <button
            onClick={onCancel}
            disabled={isSubmitting}
            className="px-5 py-2.5 text-sm font-medium text-sage hover:text-text transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={isSubmitting}
            className="px-6 py-2.5 bg-accent text-[#1A241B] rounded font-body font-bold text-sm hover:brightness-110 active:scale-95 transition-all disabled:opacity-50"
          >
            {isSubmitting ? 'Sending...' : 'Confirm & Send'}
          </button>
        </div>
      </div>
    </div>
  )
}
