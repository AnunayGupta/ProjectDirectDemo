import Link from 'next/link'
import { Client, Advisor, AcceptedPortfolio } from '@/lib/types'
import { formatCurrency, formatPerformance, getDriftStatus, formatDate } from '@/lib/utils'

interface ClientTileProps {
  client: Client
  advisor?: Advisor
  portfolio?: AcceptedPortfolio
  isSelected: boolean
  reviewedAt: Date | null | undefined
  onToggle: (clientId: string) => void
  isFirst?: boolean
}

function reviewedLabel(date: Date): string {
  const diffMs = Date.now() - date.getTime()
  const days = Math.floor(diffMs / (1000 * 60 * 60 * 24))
  if (days === 0) return 'Reviewed today'
  if (days === 1) return 'Reviewed 1d ago'
  return `Reviewed ${days}d ago`
}

export default function ClientTile({ client, advisor, portfolio, isSelected, reviewedAt, onToggle, isFirst }: ClientTileProps) {
  const perf = formatPerformance(client.monthlyPerformance)
  const drift = getDriftStatus(client.draftStartedAt)
  const holdings = portfolio ? portfolio.holdings : []

  return (
    <Link
      href={`/actions/${client.id}`}
      {...(isFirst && { 'data-tour': 'client-tile-first' })}
      className={`relative block rounded-lg p-6 transition-all ${
        isSelected
          ? 'bg-[#FFFBF5] border-2 border-accent ring-1 ring-accent/20 shadow-sm'
          : 'bg-surface border border-border/50 shadow-sm hover:shadow-md hover:border-border group'
      }`}
    >
      {/* Checkbox — stops propagation so it doesn't navigate */}
      <div
        className="absolute top-6 right-6"
        onClick={(e) => { e.preventDefault(); e.stopPropagation(); onToggle(client.id) }}
      >
        <input
          type="checkbox"
          checked={isSelected}
          onChange={() => onToggle(client.id)}
          onClick={(e) => { e.stopPropagation() }}
          className="w-4 h-4 rounded border-border text-accent focus:ring-accent cursor-pointer"
        />
      </div>

      <div className="mb-4">
        <h3 className="font-heading text-xl text-text mb-1">{client.name}</h3>
        <p className="text-[11px] text-sage font-medium uppercase tracking-wider">
          {advisor ? `${advisor.name} — ${advisor.title}` : 'Loading...'}
        </p>
      </div>

      <div className="mb-6">
        <p className="font-body text-3xl font-bold tabular-nums text-text tracking-tight">
          {formatCurrency(client.totalValue)}
        </p>
        <div className={`flex items-center gap-1 mt-1 text-xs font-medium ${perf.isPositive ? 'text-[#2D6A4F]' : 'text-[#C0392B]'}`}>
          <span className="material-symbols-outlined text-sm">{perf.icon}</span>
          <span>{perf.text} this month</span>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 mb-6">
        {holdings.slice(0, 5).map(h => (
          <span key={h.ticker} className="px-2 py-0.5 bg-border/30 rounded text-[10px] font-bold text-sage uppercase tracking-tighter">
            {h.ticker}
          </span>
        ))}
      </div>

      <div className="flex items-center justify-between border-t border-border/30 pt-4 text-[10px] text-sage">
        <span>Last rebalanced {formatDate(client.lastRebalanced)}</span>
        <div className="flex items-center gap-1.5">
          <div className={`w-2 h-2 rounded-full ${drift.color} ${drift.status === 'amber' ? 'animate-pulse' : ''}`} />
          <span className={`font-medium ${drift.status === 'green' ? 'text-[#2D6A4F]' : drift.status === 'amber' ? 'text-[#D4800A]' : 'text-[#C0392B]'}`}>
            {drift.label}
          </span>
        </div>
        <div className="flex items-center gap-1">
          {reviewedAt ? (
            <span className="inline-flex items-center gap-1 text-[#2D6A4F] font-semibold">
              <span className="material-symbols-outlined text-[13px]">check_circle</span>
              {reviewedLabel(reviewedAt)}
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 text-sage/60">
              <span className="material-symbols-outlined text-[13px]">radio_button_unchecked</span>
              Never reviewed
            </span>
          )}
        </div>
      </div>
    </Link>
  )
}
