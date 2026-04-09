import { Holding } from '@/lib/types'
import { formatCurrency, formatWeighting } from '@/lib/utils'

interface ImpactPreviewProps {
  holdings: Holding[]
  totalValue: number
}

export default function ImpactPreview({ holdings, totalValue }: ImpactPreviewProps) {
  const trades = holdings
    .map(h => {
      const currentValue = (h.currentWeighting / 100) * totalValue
      const targetValue = (h.targetWeighting / 100) * totalValue
      const delta = targetValue - currentValue
      return { ...h, currentValue, targetValue, delta }
    })
    .filter(t => Math.abs(t.delta) > 1)
    .sort((a, b) => b.delta - a.delta) // buys first, then sells

  const buys = trades.filter(t => t.delta > 0)
  const sells = trades.filter(t => t.delta < 0)
  const totalBuy = buys.reduce((s, t) => s + t.delta, 0)
  const totalSell = sells.reduce((s, t) => s + Math.abs(t.delta), 0)

  const cashHolding = holdings.find(h => h.ticker === 'CASH')
  const cashCurrent = cashHolding ? (cashHolding.currentWeighting / 100) * totalValue : 0
  const cashTarget = cashHolding ? (cashHolding.targetWeighting / 100) * totalValue : 0
  const cashDelta = cashTarget - cashCurrent

  return (
    <div className="flex flex-col h-full bg-surface">
      {/* Header */}
      <div className="px-8 py-5 border-b border-border/40">
        <h2 className="font-heading text-xl text-text">Impact Preview</h2>
        <p className="text-[11px] text-sage mt-0.5">Live trade preview — no trades placed until approved</p>
      </div>

      {/* Cash position hero card */}
      <div className="mx-8 mt-5 px-5 py-4 rounded-lg border border-border/50 bg-[#FAFAFA]">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[10px] font-bold uppercase tracking-wider text-sage">Cash Position</span>
          {Math.abs(cashDelta) > 1 && (
            <span className={`text-xs font-bold tabular-nums ${cashDelta > 0 ? 'text-[#2D6A4F]' : 'text-[#C0392B]'}`}>
              {cashDelta > 0 ? '+' : ''}{formatCurrency(cashDelta)}
            </span>
          )}
        </div>
        <div className="flex items-end justify-between">
          <div>
            <p className="text-2xl font-bold tabular-nums text-text">{formatCurrency(cashTarget)}</p>
            {Math.abs(cashDelta) > 1 && (
              <p className="text-[10px] text-sage mt-0.5 tabular-nums">
                was {formatCurrency(cashCurrent)}
              </p>
            )}
          </div>
          <span className={`text-sm font-bold tabular-nums ${
            cashHolding && cashHolding.targetWeighting > cashHolding.currentWeighting
              ? 'text-[#2D6A4F]'
              : cashHolding && cashHolding.targetWeighting < cashHolding.currentWeighting
              ? 'text-[#C0392B]'
              : 'text-sage'
          }`}>
            {cashHolding ? formatWeighting(cashHolding.targetWeighting) : '0.0%'}
          </span>
        </div>
      </div>

      {/* Trade list */}
      <div className="flex-1 overflow-auto px-8 py-4">
        {trades.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-32 gap-2">
            <span className="material-symbols-outlined text-sage text-[32px]">check_circle</span>
            <p className="text-sm text-sage">No changes — portfolio matches current state</p>
          </div>
        ) : (
          <>
            {/* Buys */}
            {buys.length > 0 && (
              <div className="mb-4">
                <h3 className="text-[9px] font-bold uppercase tracking-[0.15em] text-[#2D6A4F] mb-2">
                  Buy ({buys.length} trade{buys.length > 1 ? 's' : ''})
                </h3>
                <div className="space-y-0 rounded border border-[#2D6A4F]/15 overflow-hidden">
                  {buys.map(t => (
                    <div
                      key={t.ticker}
                      className="flex items-center justify-between px-4 py-3 border-b border-[#2D6A4F]/10 last:border-0 bg-[#F5FFF8]"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-[#2D6A4F] text-white uppercase">
                            Buy
                          </span>
                          <span className="font-medium text-text text-sm">{t.ticker}</span>
                          <span className="text-[10px] text-sage">{t.name}</span>
                        </div>
                        <p className="text-[9px] text-sage mt-0.5 ml-10 tabular-nums">
                          {formatWeighting(t.currentWeighting)} → {formatWeighting(t.targetWeighting)}
                        </p>
                      </div>
                      <p className="font-bold tabular-nums text-sm text-[#2D6A4F]">
                        +{formatCurrency(t.delta)}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Sells */}
            {sells.length > 0 && (
              <div className="mb-4">
                <h3 className="text-[9px] font-bold uppercase tracking-[0.15em] text-[#C0392B] mb-2">
                  Sell ({sells.length} trade{sells.length > 1 ? 's' : ''})
                </h3>
                <div className="space-y-0 rounded border border-[#C0392B]/15 overflow-hidden">
                  {sells.map(t => (
                    <div
                      key={t.ticker}
                      className="flex items-center justify-between px-4 py-3 border-b border-[#C0392B]/10 last:border-0 bg-[#FFF5F5]"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-[#C0392B] text-white uppercase">
                            Sell
                          </span>
                          <span className="font-medium text-text text-sm">{t.ticker}</span>
                          <span className="text-[10px] text-sage">{t.name}</span>
                        </div>
                        <p className="text-[9px] text-sage mt-0.5 ml-10 tabular-nums">
                          {formatWeighting(t.currentWeighting)} → {formatWeighting(t.targetWeighting)}
                        </p>
                      </div>
                      <p className="font-bold tabular-nums text-sm text-[#C0392B]">
                        -{formatCurrency(Math.abs(t.delta))}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Summary footer */}
      {trades.length > 0 && (
        <div className="px-8 py-5 border-t border-border/40 space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-sage">Total buys</span>
            <span className="font-bold text-[#2D6A4F] tabular-nums">+{formatCurrency(totalBuy)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-sage">Total sells</span>
            <span className="font-bold text-[#C0392B] tabular-nums">-{formatCurrency(totalSell)}</span>
          </div>
          <div className="flex justify-between text-sm border-t border-border/40 pt-2 mt-2">
            <span className="text-sage font-medium">Net movement</span>
            <span className={`font-bold tabular-nums ${totalBuy - totalSell >= 0 ? 'text-[#2D6A4F]' : 'text-[#C0392B]'}`}>
              {totalBuy - totalSell >= 0 ? '+' : ''}{formatCurrency(totalBuy - totalSell)}
            </span>
          </div>
        </div>
      )}
    </div>
  )
}
