'use client'
import { useState, useMemo } from 'react'
import { Holding } from '@/lib/types'
import { formatCurrency } from '@/lib/utils'

interface RaiseCashModalProps {
  holdings: Holding[]
  totalValue: number
  onConfirm: (updatedHoldings: Holding[]) => void
  onCancel: () => void
}

export default function RaiseCashModal({
  holdings,
  totalValue,
  onConfirm,
  onCancel,
}: RaiseCashModalProps) {
  const [targetAmount, setTargetAmount] = useState(10000)
  const nonCashHoldings = holdings.filter(h => h.ticker !== 'CASH' && h.targetWeighting > 0)
  const cashHolding = holdings.find(h => h.ticker === 'CASH')

  // Track which holdings to sell from (all enabled by default)
  const [excluded, setExcluded] = useState<Set<string>>(new Set())

  const sellableHoldings = nonCashHoldings.filter(h => !excluded.has(h.ticker))
  const totalSellableWeight = sellableHoldings.reduce((s, h) => s + h.targetWeighting, 0)
  const maxRaisable = (totalSellableWeight / 100) * totalValue

  const isValid = targetAmount > 0 && targetAmount <= maxRaisable + 0.01

  // Compute per-holding sell amounts proportionally
  const sellBreakdown = useMemo(() => {
    return sellableHoldings.map(h => {
      const relWeight = totalSellableWeight > 0 ? h.targetWeighting / totalSellableWeight : 0
      const sellAmount = relWeight * targetAmount
      const sellWeightPct = (sellAmount / totalValue) * 100
      return { ...h, sellAmount, sellWeightPct }
    })
  }, [sellableHoldings, totalSellableWeight, targetAmount, totalValue])

  const handleConfirm = () => {
    const updated = holdings.map(h => {
      if (h.ticker === 'CASH') {
        const cashAddPct = (targetAmount / totalValue) * 100
        return { ...h, targetWeighting: h.targetWeighting + cashAddPct }
      }
      const sell = sellBreakdown.find(s => s.ticker === h.ticker)
      if (sell) {
        return { ...h, targetWeighting: Math.max(0, h.targetWeighting - sell.sellWeightPct) }
      }
      return h
    })
    onConfirm(updated)
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ backgroundColor: 'rgba(26,26,26,0.6)' }}
    >
      <div className="bg-surface rounded-lg shadow-2xl w-full max-w-[560px] mx-4 animate-[fadeIn_0.2s_ease-out]">
        {/* Header */}
        <div className="px-8 pt-8 pb-5 border-b border-border/40">
          <h2 className="font-heading text-2xl text-text">Raise Cash</h2>
          <p className="text-sm text-sage mt-1">Sell positions proportionally to raise a target cash amount</p>
        </div>

        {/* Body */}
        <div className="px-8 py-6 space-y-6">
          {/* Amount input */}
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-sage mb-2">Target amount to raise</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-lg font-bold text-sage">€</span>
              <input
                type="text"
                className={`w-full bg-background border rounded pl-10 pr-4 py-3 text-xl font-bold tabular-nums outline-none transition-all ${
                  !isValid && targetAmount > 0
                    ? 'border-[#C0392B] text-[#C0392B]'
                    : 'border-border focus:border-accent text-text'
                }`}
                value={targetAmount.toLocaleString()}
                onChange={e => setTargetAmount(Number(e.target.value.replace(/,/g, '')) || 0)}
                autoFocus
              />
            </div>
            {!isValid && targetAmount > 0 && (
              <p className="text-[10px] text-[#C0392B] font-bold mt-1.5">
                Maximum raisable from selected positions: {formatCurrency(maxRaisable)}
              </p>
            )}
            {cashHolding && (
              <p className="text-[10px] text-sage mt-1.5">
                Current cash: {formatCurrency((cashHolding.targetWeighting / 100) * totalValue)}
                {' → '}
                After: {formatCurrency(((cashHolding.targetWeighting / 100) * totalValue) + targetAmount)}
              </p>
            )}
          </div>

          {/* Holdings to sell from */}
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-sage mb-3">Sell from these positions</label>
            <div className="space-y-0 rounded border border-border/50 overflow-hidden">
              {nonCashHoldings.map(h => {
                const isExcluded = excluded.has(h.ticker)
                const sellInfo = sellBreakdown.find(s => s.ticker === h.ticker)
                const holdingValue = (h.targetWeighting / 100) * totalValue
                return (
                  <div
                    key={h.ticker}
                    className={`flex items-center gap-3 px-4 py-3 border-b border-border/30 last:border-0 transition-colors ${
                      isExcluded ? 'bg-background/50 opacity-50' : ''
                    }`}
                  >
                    <button
                      onClick={() => {
                        const next = new Set(excluded)
                        isExcluded ? next.delete(h.ticker) : next.add(h.ticker)
                        setExcluded(next)
                      }}
                      className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors flex-shrink-0 ${
                        isExcluded
                          ? 'border-border bg-background'
                          : 'border-accent bg-accent/10'
                      }`}
                    >
                      {!isExcluded && (
                        <span className="material-symbols-outlined text-accent text-[14px]">check</span>
                      )}
                    </button>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-text">{h.ticker}</span>
                        <span className="text-[10px] text-sage truncate">{h.name}</span>
                      </div>
                      <span className="text-[10px] text-sage">
                        {h.targetWeighting.toFixed(1)}% ({formatCurrency(holdingValue)})
                      </span>
                    </div>
                    {sellInfo && !isExcluded && (
                      <span className="text-xs font-bold text-[#C0392B] tabular-nums flex-shrink-0">
                        -{formatCurrency(sellInfo.sellAmount)}
                      </span>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-8 pb-8 flex items-center justify-between">
          <div className="text-xs text-sage">
            {sellableHoldings.length} of {nonCashHoldings.length} positions selected
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={onCancel}
              className="px-5 py-2.5 text-sm font-medium text-sage hover:text-text transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleConfirm}
              disabled={!isValid}
              className="px-6 py-2.5 bg-accent text-[#1A241B] rounded font-body font-bold text-sm
                hover:brightness-110 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Apply — Raise {formatCurrency(targetAmount)}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
