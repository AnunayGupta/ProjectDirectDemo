'use client'
import { useEffect, useState } from 'react'
import { Holding } from '@/lib/types'
import { formatCurrency } from '@/lib/utils'

interface ClientPhonePreviewProps {
  clientName: string
  holdings: Holding[]
  totalValue: number
  onClose: () => void
}

export default function ClientPhonePreview({ clientName, holdings, totalValue, onClose }: ClientPhonePreviewProps) {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const id = requestAnimationFrame(() => setVisible(true))
    return () => cancelAnimationFrame(id)
  }, [])

  const firstName = clientName.split(' ')[0]

  const trades = holdings
    .map(h => ({ ...h, delta: ((h.targetWeighting - h.currentWeighting) / 100) * totalValue }))
    .filter(t => Math.abs(t.delta) > 1)
    .sort((a, b) => b.delta - a.delta)

  const handleClose = () => {
    setVisible(false)
    setTimeout(onClose, 400)
  }

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col items-center justify-center transition-colors duration-500"
      style={{ backgroundColor: visible ? 'rgba(0,0,0,0.75)' : 'rgba(0,0,0,0)' }}
    >
      {/* Phone + label wrapper */}
      <div
        className="flex flex-col items-center transition-all duration-500 ease-out"
        style={{ transform: visible ? 'translateY(0)' : 'translateY(80px)', opacity: visible ? 1 : 0 }}
      >
        {/* Tooltip */}
        <div className="mb-4 px-4 py-1.5 rounded-full text-xs text-white/80 bg-white/10 backdrop-blur-sm">
          This is what {firstName} sees on their phone
        </div>

        {/* Phone frame */}
        <div
          className="relative bg-[#111] rounded-[44px] shadow-2xl"
          style={{ width: 300, padding: '12px 10px' }}
        >
          {/* Dynamic island */}
          <div
            className="absolute left-1/2 -translate-x-1/2 bg-[#111] rounded-full z-10"
            style={{ top: 12, width: 90, height: 24 }}
          />

          {/* Screen */}
          <div className="bg-[#FAFAFA] rounded-[36px] overflow-hidden">
            {/* Status bar */}
            <div className="flex items-end justify-between px-6 pt-8 pb-2">
              <span className="text-[11px] font-semibold text-[#1A1A1A]">9:41</span>
              <div className="flex items-center gap-1 text-[#1A1A1A]">
                <span className="material-symbols-outlined" style={{ fontSize: 12 }}>signal_cellular_4_bar</span>
                <span className="material-symbols-outlined" style={{ fontSize: 12 }}>wifi</span>
                <span className="material-symbols-outlined" style={{ fontSize: 12 }}>battery_full</span>
              </div>
            </div>

            <div className="px-3 pb-5 space-y-3">
              {/* Push notification banner */}
              <div className="bg-white rounded-2xl px-3 py-2.5 shadow-sm flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-[#004750] flex items-center justify-center flex-shrink-0">
                  <span className="material-symbols-outlined text-[#A67959]" style={{ fontSize: 14 }}>account_balance</span>
                </div>
                <div className="min-w-0">
                  <p className="text-[11px] font-bold text-[#1A1A1A] leading-tight">Portfolio Update</p>
                  <p className="text-[10px] text-[#888] leading-tight truncate">
                    Your advisor has proposed adjustments
                  </p>
                </div>
              </div>

              {/* Main card */}
              <div className="bg-white rounded-2xl overflow-hidden shadow-sm">
                {/* Greeting */}
                <div className="px-4 pt-4 pb-3 border-b border-[#F0EDE8]">
                  <p className="text-lg font-bold text-[#1A1A1A] leading-snug">Hello, {firstName}</p>
                  <p className="text-[11px] text-[#888] mt-0.5 leading-relaxed">
                    Review the proposed adjustments to your portfolio.
                  </p>
                </div>

                {/* Trades */}
                <div className="px-4 py-3">
                  <p className="text-[9px] font-bold uppercase tracking-widest text-[#AAA] mb-2">
                    Proposed Changes
                  </p>
                  <div className="space-y-0">
                    {trades.map(t => {
                      const isBuy = t.delta > 0
                      return (
                        <div
                          key={t.ticker}
                          className="flex items-center justify-between py-2 border-b border-[#F5F3EF] last:border-0"
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            <span
                              className={`text-[8px] font-bold px-1.5 py-0.5 rounded uppercase flex-shrink-0 ${
                                isBuy ? 'bg-[#2D6A4F] text-white' : 'bg-[#C0392B] text-white'
                              }`}
                            >
                              {isBuy ? 'Buy' : 'Sell'}
                            </span>
                            <div className="min-w-0">
                              <p className="text-[11px] font-bold text-[#1A1A1A] leading-none">{t.ticker}</p>
                              <p className="text-[9px] text-[#AAA] truncate">{t.name}</p>
                            </div>
                          </div>
                          <span
                            className={`text-[11px] font-bold tabular-nums flex-shrink-0 ${
                              isBuy ? 'text-[#2D6A4F]' : 'text-[#C0392B]'
                            }`}
                          >
                            {isBuy ? '+' : '-'}{formatCurrency(Math.abs(t.delta))}
                          </span>
                        </div>
                      )
                    })}
                  </div>
                </div>

                {/* Actions */}
                <div className="px-4 pb-4 pt-1 space-y-2">
                  <button className="w-full py-2.5 bg-[#A67959] text-white rounded-xl font-bold text-[12px] tracking-wide">
                    Approve Changes
                  </button>
                  <button className="w-full py-1.5 text-[#AAA] text-[11px]">
                    Decline Proposal
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Close pill */}
      <button
        onClick={handleClose}
        className="mt-6 flex items-center gap-1.5 px-5 py-2.5 rounded-full text-xs text-white bg-white/10 hover:bg-white/20 backdrop-blur-sm transition-all"
        style={{
          opacity: visible ? 1 : 0,
          transform: visible ? 'translateY(0)' : 'translateY(8px)',
          transitionDuration: '400ms',
          transitionDelay: visible ? '200ms' : '0ms',
        }}
      >
        <span className="material-symbols-outlined" style={{ fontSize: 14 }}>close</span>
        Close Preview
      </button>
    </div>
  )
}
