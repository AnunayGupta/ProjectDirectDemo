'use client'
import { PieChart, Pie, Cell } from 'recharts'
import { Holding, AcceptedPortfolio, DraftPortfolio } from '@/lib/types'
import { formatCurrency, formatWeighting } from '@/lib/utils'
import { firmConfig } from '@/lib/firm-config'

const DONUT_COLORS: Record<string, string> = {
  equity: firmConfig.colors.primary,
  etf:    firmConfig.colors.accent,
  bond:   firmConfig.colors.sage,
  cash:   firmConfig.colors.rose,
}

interface HoldingsTableProps {
  accepted: AcceptedPortfolio
  proposed: DraftPortfolio | null
  view: 'current' | 'proposed'
}

export default function HoldingsTable({ accepted, proposed, view }: HoldingsTableProps) {
  const holdings: Holding[] = view === 'proposed' && proposed
    ? proposed.holdings
    : accepted.holdings

  const totalValue = accepted.totalValue

  // Build donut chart data by asset class
  const chartData = Object.entries(
    holdings.reduce<Record<string, number>>((acc, h) => {
      acc[h.assetClass] = (acc[h.assetClass] ?? 0) + h.currentWeighting
      return acc
    }, {})
  ).map(([assetClass, value]) => ({ assetClass, value }))

  return (
    <div className="flex gap-8">
      {/* Donut Chart */}
      <div className="flex-shrink-0 flex flex-col items-center gap-3">
        <PieChart width={180} height={180}>
          <Pie
            data={chartData}
            cx={90}
            cy={90}
            innerRadius={55}
            outerRadius={80}
            paddingAngle={2}
            dataKey="value"
            strokeWidth={0}
            isAnimationActive={false}
          >
            {chartData.map((entry) => (
              <Cell key={entry.assetClass} fill={DONUT_COLORS[entry.assetClass] ?? '#ccc'} />
            ))}
          </Pie>
        </PieChart>
        {/* Legend */}
        <div className="flex flex-col gap-1.5">
          {chartData.map(e => (
            <div key={e.assetClass} className="flex items-center gap-2 text-[11px] text-sage">
              <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: DONUT_COLORS[e.assetClass] ?? '#ccc' }} />
              <span className="capitalize">{e.assetClass}</span>
              <span className="font-medium text-text ml-auto pl-4">{formatWeighting(e.value)}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Holdings Table */}
      <div className="flex-1 overflow-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left text-[10px] font-medium text-sage uppercase tracking-wider pb-3">Holding</th>
              <th className="text-right text-[10px] font-medium text-sage uppercase tracking-wider pb-3">Current</th>
              <th className="text-right text-[10px] font-medium text-sage uppercase tracking-wider pb-3">Target</th>
              <th className="text-right text-[10px] font-medium text-sage uppercase tracking-wider pb-3">Value</th>
            </tr>
          </thead>
          <tbody>
            {holdings.map((h, i) => {
              const delta = h.targetWeighting - h.currentWeighting
              const isIncrease = delta > 0.1
              const isDecrease = delta < -0.1
              
              const displayValue = view === 'proposed'
                ? (h.targetWeighting / 100) * totalValue
                : (h.currentWeighting / 100) * totalValue

              return (
                <tr
                  key={h.ticker}
                  className={`border-b border-border/40 ${
                    view === 'proposed'
                      ? isIncrease ? 'bg-[#F5FFF8]' : isDecrease ? 'bg-[#FFF5F5]' : ''
                      : ''
                  }`}
                >
                  <td className="py-3 pr-4">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-text">{h.ticker}</span>
                      <span className="text-[11px] text-sage truncate max-w-[160px]">{h.name}</span>
                    </div>
                  </td>
                  <td className="py-3 text-right tabular-nums text-text">{formatWeighting(h.currentWeighting)}</td>
                  <td className={`py-3 text-right tabular-nums font-medium ${
                    isIncrease ? 'text-[#2D6A4F]' : isDecrease ? 'text-[#C0392B]' : 'text-text'
                  }`}>
                    {formatWeighting(h.targetWeighting)}
                    {isIncrease && <span className="ml-1 text-[10px]">↑</span>}
                    {isDecrease && <span className="ml-1 text-[10px]">↓</span>}
                  </td>
                  <td className="py-3 text-right tabular-nums text-text">{formatCurrency(displayValue)}</td>
                </tr>
              )
            })}
          </tbody>
          <tfoot>
            <tr className="border-t-2 border-border">
              <td colSpan={3} className="pt-3 text-[11px] font-medium text-sage uppercase tracking-wider">Total Portfolio Value</td>
              <td className="pt-3 text-right tabular-nums font-bold text-text text-base">{formatCurrency(totalValue)}</td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  )
}
