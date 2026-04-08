'use client'
import { useState, useEffect, useCallback } from 'react'
import { PieChart, Pie, Cell } from 'recharts'
import { firmConfig } from '@/lib/firm-config'
import { ReportStatus, Holding } from '@/lib/types'
import { PORTFOLIOS } from '@/lib/seed-data'
import { formatCurrency, formatWeighting } from '@/lib/utils'

const DONUT_COLORS: Record<string, string> = {
  equity: firmConfig.colors.primary,
  etf: firmConfig.colors.accent,
  bond: firmConfig.colors.sage,
  cash: firmConfig.colors.rose,
}

interface ReportClient {
  id: string
  name: string
  advisorId: string
  advisorName: string
  advisorTitle: string
  totalValue: number
  monthlyPerformance: number
  lastRebalanced: string
  reportStatus: ReportStatus
}

// Deterministic mock YTD and inception returns based on client ID hash
function mockReturn(id: string, multiplier: number): number {
  let hash = 0
  for (const ch of id) hash = (hash * 31 + ch.charCodeAt(0)) & 0xffffffff
  const base = (Math.abs(hash) % 150) / 10 // 0.0 – 15.0
  return Math.round((base * multiplier + multiplier * 2) * 10) / 10
}

export default function ReportsPage() {
  const [clients, setClients] = useState<ReportClient[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedId, setSelectedId] = useState<string>('client_001')
  const [generating, setGenerating] = useState(false)
  const [downloadingPdf, setDownloadingPdf] = useState(false)
  const [toast, setToast] = useState<string | null>(null)

  const handleDownloadPdf = () => {
    if (!selectedId || downloadingPdf) return
    // Direct navigation triggers the browser's native download via Content-Disposition: attachment
    window.open(`/api/reports/${selectedId}/pdf`, '_blank')
  }

  const fetchClients = useCallback(async () => {
    try {
      const res = await fetch('/api/reports')
      if (res.ok) {
        const data = await res.json()
        setClients(data)
        // Default to Seán O'Brien
        if (data.find((c: ReportClient) => c.id === 'client_001')) {
          setSelectedId('client_001')
        } else if (data.length > 0) {
          setSelectedId(data[0].id)
        }
      }
    } catch (e) {
      console.error('Failed to fetch reports:', e)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchClients()
  }, [fetchClients])

  const handleGenerateAll = async () => {
    setGenerating(true)
    try {
      const res = await fetch('/api/reports/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ clientIds: [] }),
      })
      if (res.ok) {
        // Optimistically mark all as generated
        setClients(prev => prev.map(c => ({
          ...c,
          reportStatus: {
            status: 'generated' as const,
            generatedAt: new Date().toISOString(),
            month: '2026-03',
          }
        })))
        setToast('Reports generated for all 200 clients')
        setTimeout(() => setToast(null), 3000)
      }
    } catch (e) {
      console.error('Failed to generate reports:', e)
    } finally {
      setGenerating(false)
    }
  }

  const selected = clients.find(c => c.id === selectedId)
  const portfolio = selectedId ? PORTFOLIOS[selectedId] : null

  // Donut chart data for selected client
  const donutData = portfolio
    ? Object.entries(
        portfolio.holdings.reduce<Record<string, number>>((acc, h) => {
          acc[h.assetClass] = (acc[h.assetClass] ?? 0) + h.currentWeighting
          return acc
        }, {})
      ).map(([assetClass, value]) => ({ assetClass, value }))
    : []

  const generatedCount = clients.filter(c => c.reportStatus.status === 'generated').length
  const pendingCount = clients.length - generatedCount

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-background">
        {/* Header */}
        <header className="flex items-center justify-between px-10 py-6 bg-surface border-b border-border flex-shrink-0">
          <div>
            <h1 className="font-heading text-3xl font-light text-text">Reports</h1>
            <p className="text-sage text-sm mt-0.5">March 2026 — Monthly Portfolio Reports</p>
          </div>
          <div className="flex items-center gap-4">
            {/* Stats */}
            <div className="flex items-center gap-6 mr-4 text-sm">
              <span className="text-sage">
                <span className="font-semibold text-text">{generatedCount}</span> Generated
              </span>
              <span className="text-sage">
                <span className="font-semibold text-text">{pendingCount}</span> Pending
              </span>
            </div>
            <button
              data-tour="reports-generate-all"
              onClick={handleGenerateAll}
              disabled={generating}
              className="bg-accent text-white px-6 py-2.5 text-sm font-semibold hover:bg-accent/90 transition-all duration-200 disabled:opacity-60 flex items-center gap-2"
            >
              {generating ? (
                <>
                  <span className="material-symbols-outlined animate-spin text-sm">progress_activity</span>
                  Generating...
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined text-sm">description</span>
                  Generate Reports for All Clients
                </>
              )}
            </button>
          </div>
        </header>

        {/* Two-column workspace */}
        <div className="flex flex-1 overflow-hidden">
          {/* LEFT: Client list */}
          <div data-tour="reports-client-list" className="w-[360px] flex-shrink-0 border-r border-border flex flex-col overflow-hidden bg-surface">
            <div className="px-6 py-4 border-b border-border flex items-center justify-between flex-shrink-0">
              <h2 className="font-heading text-lg text-text">Client Reports</h2>
              <span className="text-xs text-sage">{clients.length} clients</span>
            </div>
            <div className="flex-1 overflow-y-auto">
              {loading ? (
                <div className="p-6 space-y-3">
                  {[...Array(8)].map((_, i) => (
                    <div key={i} className="h-16 bg-background animate-pulse rounded" />
                  ))}
                </div>
              ) : (
                clients.map(client => (
                  <button
                    key={client.id}
                    onClick={() => setSelectedId(client.id)}
                    className={`w-full text-left px-6 py-4 border-b border-border transition-all duration-150 ${
                      selectedId === client.id
                        ? 'bg-primary/5 border-l-4 border-l-accent'
                        : 'hover:bg-background border-l-4 border-l-transparent'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0 flex-1">
                        <p className="font-heading text-sm font-medium text-text truncate">{client.name}</p>
                        <p className="text-[11px] text-sage mt-0.5 truncate">
                          {client.advisorName} — {client.advisorTitle}
                        </p>
                      </div>
                      <div className="flex-shrink-0 text-right">
                        {client.reportStatus.status === 'generated' ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-green-50 text-green-700 rounded">
                            <span className="material-symbols-outlined text-[10px]">check_circle</span>
                            Generated
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-border text-sage rounded">
                            Pending
                          </span>
                        )}
                        <p className="text-xs font-medium text-text/60 mt-1">
                          {formatCurrency(client.totalValue)}
                        </p>
                      </div>
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>

          {/* RIGHT: Report preview */}
          <div className="flex-1 flex flex-col overflow-hidden">
            {selected && portfolio ? (
              <>
                {/* Preview controls */}
                <div className="px-8 py-4 border-b border-border bg-surface flex items-center justify-between flex-shrink-0">
                  <h2 className="font-heading text-lg text-text">Report Preview</h2>
                  <button
                    data-tour="reports-download"
                    onClick={handleDownloadPdf}
                    disabled={downloadingPdf}
                    className="flex items-center gap-2 px-4 py-2 border border-primary text-primary hover:bg-primary/5 transition-all text-xs font-semibold disabled:opacity-50 disabled:cursor-wait"
                  >
                    {downloadingPdf ? (
                      <>
                        <span className="material-symbols-outlined text-sm animate-spin">progress_activity</span>
                        Generating PDF...
                      </>
                    ) : (
                      <>
                        <span className="material-symbols-outlined text-sm">picture_as_pdf</span>
                        Download PDF
                      </>
                    )}
                  </button>
                </div>

                {/* PDF document */}
                <div data-tour="reports-preview" className="flex-1 overflow-y-auto px-8 py-8">
                  <div className="bg-white shadow-2xl max-w-3xl mx-auto border border-border min-h-full">
                    {/* PDF Header */}
                    <div
                      className="flex items-end justify-between px-10 py-8"
                      style={{ backgroundColor: firmConfig.colors.primary }}
                    >
                      <div>
                        <div
                          className="text-xl font-heading font-bold tracking-[0.15em]"
                          style={{ color: firmConfig.colors.accent }}
                        >
                          CLINCH
                        </div>
                        <div className="text-[9px] uppercase tracking-[0.4em] text-white/50 mt-0.5">
                          Wealth Management
                        </div>
                      </div>
                      <div className="text-right">
                        <h3 className="font-heading text-lg text-white">Monthly Portfolio Report</h3>
                        <p className="text-xs text-white/60 uppercase tracking-widest mt-1">March 2026</p>
                      </div>
                    </div>

                    <div className="px-10 py-8">
                      {/* Client details */}
                      <div className="mb-8">
                        <p className="text-[10px] uppercase tracking-widest text-sage mb-1">Prepared for</p>
                        <h4 className="font-heading text-2xl text-text mb-1">{selected.name}</h4>
                        <p className="text-xs text-sage italic">
                          Relationship Manager: {selected.advisorName} — {selected.advisorTitle}
                        </p>
                      </div>

                      {/* Metrics grid */}
                      <div className="grid grid-cols-4 divide-x divide-border border-y border-border py-5 mb-8">
                        <div className="px-4 first:pl-0">
                          <p className="text-[9px] uppercase tracking-wider text-sage mb-1">Portfolio Value</p>
                          <p className="text-lg font-heading">{formatCurrency(selected.totalValue)}</p>
                        </div>
                        <div className="px-4">
                          <p className="text-[9px] uppercase tracking-wider text-sage mb-1">Monthly Return</p>
                          <p className={`text-lg font-heading ${selected.monthlyPerformance >= 0 ? 'text-green-700' : 'text-red-600'}`}>
                            {selected.monthlyPerformance >= 0 ? '↑' : '↓'} {Math.abs(selected.monthlyPerformance).toFixed(1)}%
                          </p>
                        </div>
                        <div className="px-4">
                          <p className="text-[9px] uppercase tracking-wider text-sage mb-1">YTD Return</p>
                          <p className="text-lg font-heading text-green-700">
                            ↑ {mockReturn(selected.id, 3.2)}%
                          </p>
                        </div>
                        <div className="px-4 last:pr-0">
                          <p className="text-[9px] uppercase tracking-wider text-sage mb-1">Since Inception</p>
                          <p className="text-lg font-heading text-green-700">
                            ↑ {mockReturn(selected.id, 8.5)}%
                          </p>
                        </div>
                      </div>

                      {/* Holdings + Donut */}
                      <div className="flex gap-8">
                        {/* Holdings table */}
                        <div className="flex-[2]">
                          <h5 className="text-[10px] font-bold uppercase tracking-[0.2em] mb-4 text-sage">
                            Holdings
                          </h5>
                          <table className="w-full text-left text-xs">
                            <thead className="border-b border-border">
                              <tr>
                                <th className="pb-2 text-[9px] font-bold text-sage uppercase">Holding</th>
                                <th className="pb-2 text-[9px] font-bold text-sage uppercase text-right">Value</th>
                                <th className="pb-2 text-[9px] font-bold text-sage uppercase text-right">Weight</th>
                                <th className="pb-2 text-[9px] font-bold text-sage uppercase text-right">MoM</th>
                              </tr>
                            </thead>
                            <tbody className="text-text">
                              {portfolio.holdings.map((h: Holding) => {
                                const value = Math.round((h.currentWeighting / 100) * selected.totalValue)
                                return (
                                  <tr key={h.ticker} className="border-b border-border/50">
                                    <td className="py-2 font-medium">{h.name}</td>
                                    <td className="py-2 text-right tabular-nums">{formatCurrency(value)}</td>
                                    <td className="py-2 text-right tabular-nums">{formatWeighting(h.currentWeighting)}</td>
                                    <td className={`py-2 text-right tabular-nums ${h.performance >= 0 ? 'text-green-700' : 'text-red-600'}`}>
                                      {h.performance >= 0 ? '+' : ''}{h.performance.toFixed(1)}%
                                    </td>
                                  </tr>
                                )
                              })}
                            </tbody>
                            <tfoot>
                              <tr className="font-bold border-t border-border">
                                <td className="pt-3 text-xs uppercase">Total</td>
                                <td className="pt-3 text-xs text-right tabular-nums">{formatCurrency(selected.totalValue)}</td>
                                <td className="pt-3 text-xs text-right">100.0%</td>
                                <td className={`pt-3 text-xs text-right ${selected.monthlyPerformance >= 0 ? 'text-green-700' : 'text-red-600'}`}>
                                  {selected.monthlyPerformance >= 0 ? '+' : ''}{selected.monthlyPerformance.toFixed(1)}%
                                </td>
                              </tr>
                            </tfoot>
                          </table>
                        </div>

                        {/* Donut chart */}
                        <div className="flex-1">
                          <h5 className="text-[10px] font-bold uppercase tracking-[0.2em] mb-4 text-sage">
                            Allocation
                          </h5>
                          <PieChart width={140} height={140}>
                            <Pie
                              data={donutData}
                              cx={70}
                              cy={70}
                              innerRadius={42}
                              outerRadius={62}
                              paddingAngle={2}
                              dataKey="value"
                              strokeWidth={0}
                              isAnimationActive={false}
                            >
                              {donutData.map(entry => (
                                <Cell
                                  key={entry.assetClass}
                                  fill={DONUT_COLORS[entry.assetClass] ?? '#ccc'}
                                />
                              ))}
                            </Pie>
                          </PieChart>
                          <ul className="mt-2 space-y-2">
                            {donutData.map(e => (
                              <li key={e.assetClass} className="flex items-center gap-2 text-[10px] text-sage">
                                <div
                                  className="w-2 h-2 rounded-full flex-shrink-0"
                                  style={{ backgroundColor: DONUT_COLORS[e.assetClass] ?? '#ccc' }}
                                />
                                <span className="capitalize">{e.assetClass}</span>
                                <span className="ml-auto font-medium text-text">{formatWeighting(e.value)}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>

                      {/* Footer */}
                      <div className="mt-12 pt-6 border-t border-border">
                        <p className="text-[8px] text-sage leading-relaxed mb-3">
                          {firmConfig.reportingDisclaimer}
                        </p>
                        <div className="flex items-center justify-between text-[8px] text-sage/60">
                          <span>{firmConfig.name} | Dublin 2, Ireland</span>
                          <span>Prepared by {selected.advisorName}</span>
                          <span>Page 1 of 1</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center text-sage">
                <div className="text-center">
                  <span className="material-symbols-outlined text-4xl text-border mb-3 block">description</span>
                  <p className="text-sm">Select a client to preview their report</p>
                </div>
              </div>
            )}
          </div>{/* end right panel */}
        </div>{/* end two-column workspace */}

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-6 right-6 bg-primary text-white px-5 py-3 text-sm font-medium shadow-xl z-50 flex items-center gap-2">
          <span className="material-symbols-outlined text-sm text-accent">check_circle</span>
          {toast}
        </div>
      )}
    </div>
  )
}
