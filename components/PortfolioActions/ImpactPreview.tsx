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

  const totalBuy  = trades.filter(t => t.delta > 0).reduce((s, t) => s + t.delta, 0)
  const totalSell = trades.filter(t => t.delta < 0).reduce((s, t) => s + Math.abs(t.delta), 0)

  return (
    <div className="flex flex-col h-full border-l border-border/40">
      <div className="px-8 py-4 border-b border-border/40">
        <h2 className="text-sm font-medium text-text uppercase tracking-wider">Impact Preview</h2>
        <p className="text-[11px] text-sage mt-0.5">Updates live as you edit — no trades placed until approved</p>
      </div>

      <div className="flex-1 overflow-auto px-8 py-4">
        {trades.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-32 gap-2">
            <span className="material-symbols-outlined text-sage text-[32px]">check_circle</span>
            <p className="text-sm text-sage">No changes — all weightings match current</p>
          </div>
        ) : (
          <div className="space-y-0">
            {trades.map(t => {
              const isBuy = t.delta > 0
              return (
                <div
                  key={t.ticker}
                  className={`flex items-center justify-between py-3 border-b border-border/30 ${
                    isBuy ? 'bg-[#F5FFF8]' : 'bg-[#FFF5F5]'
                  } -mx-2 px-2 rounded`}
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded uppercase ${
                        isBuy ? 'bg-[#2D6A4F] text-white' : 'bg-[#C0392B] text-white'
                      }`}>
                        {isBuy ? 'BUY' : 'SELL'}
                      </span>
                      <span className="font-medium text-text text-sm">{t.ticker}</span>
                    </div>
                    <p className="text-[10px] text-sage mt-0.5 ml-10">
                      {formatWeighting(t.currentWeighting)} → {formatWeighting(t.targetWeighting)}
                    </p>
                  </div>
                  <p className={`font-bold tabular-nums text-sm ${isBuy ? 'text-[#2D6A4F]' : 'text-[#C0392B]'}`}>
                    {isBuy ? '+' : '-'}{formatCurrency(Math.abs(t.delta))}
                  </p>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Summary footer */}
      {trades.length > 0 && (
        <div className="px-8 py-5 border-t border-border/40 bg-surface space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-sage">Total buys</span>
            <span className="font-bold text-[#2D6A4F] tabular-nums">+{formatCurrency(totalBuy)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-sage">Total sells</span>
            <span className="font-bold text-[#C0392B] tabular-nums">-{formatCurrency(totalSell)}</span>
          </div>
          <div className="flex justify-between text-sm border-t border-border/40 pt-2 mt-2">
            <span className="text-sage">Net movement</span>
            <span className={`font-bold tabular-nums ${totalBuy - totalSell >= 0 ? 'text-[#2D6A4F]' : 'text-[#C0392B]'}`}>
              {totalBuy - totalSell >= 0 ? '+' : ''}{formatCurrency(totalBuy - totalSell)}
            </span>
          </div>
        </div>
      )}
    </div>
  )
}
