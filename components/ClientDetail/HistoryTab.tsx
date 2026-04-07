import { HistoryEntry } from '@/lib/types'
import { formatDate, formatCurrency } from '@/lib/utils'

const ACTION_LABELS: Record<string, string> = {
  rebalance: 'Rebalance',
  add_instrument: 'Add Instrument',
  remove_instrument: 'Remove Instrument',
  deploy_capital: 'Deploy Capital',
  withdraw: 'Withdraw',
}

interface HistoryTabProps {
  history: HistoryEntry[]
}

export default function HistoryTab({ history }: HistoryTabProps) {
  if (history.length === 0) {
    return <p className="text-sm text-sage py-8 text-center">No history recorded.</p>
  }

  return (
    <div className="space-y-0">
      {history.map((entry, i) => (
        <div key={entry.id} className={`flex items-start gap-4 py-5 ${i < history.length - 1 ? 'border-b border-border/40' : ''}`}>
          <div className="flex-shrink-0 w-8 h-8 rounded-full bg-surface-container flex items-center justify-center mt-0.5">
            <span className="material-symbols-outlined text-sage text-[16px]">history</span>
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-baseline justify-between gap-4">
              <p className="font-medium text-text text-sm">{ACTION_LABELS[entry.actionType] ?? entry.actionType}</p>
              <p className="text-[11px] text-sage flex-shrink-0">{formatDate(entry.executedAt)}</p>
            </div>
            <div className="flex flex-wrap gap-2 mt-2">
              {entry.trades.map((t, j) => (
                <span
                  key={j}
                  className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-tighter ${
                    t.side === 'buy' ? 'bg-[#F5FFF8] text-[#2D6A4F]' : 'bg-[#FFF5F5] text-[#C0392B]'
                  }`}
                >
                  {t.side.toUpperCase()} {t.ticker} — {formatCurrency(t.amount)}
                </span>
              ))}
            </div>
            <p className="text-[11px] text-sage mt-2">
              Portfolio value at execution: <span className="font-medium text-text">{formatCurrency(entry.totalValue)}</span>
            </p>
          </div>
        </div>
      ))}
    </div>
  )
}
