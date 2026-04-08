'use client'

import { useState, useEffect, use } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Header from '@/components/Header'
import DriftBanner from '@/components/ClientDetail/DriftBanner'
import HoldingsTable from '@/components/ClientDetail/HoldingsTable'
import HistoryTab from '@/components/ClientDetail/HistoryTab'
import NotesTab from '@/components/ClientDetail/NotesTab'
import { Client, Note, HistoryEntry, PortfolioResponse } from '@/lib/types'
import { firmConfig } from '@/lib/firm-config'
import { formatCurrency, formatPerformance, getDriftStatus, formatDate } from '@/lib/utils'

type Tab = 'portfolio' | 'history' | 'notes'
type PortfolioView = 'current' | 'proposed'

interface ClientDetailData {
  client: Client
  portfolio: PortfolioResponse
  notes: Note[]
  history: HistoryEntry[]
}

export default function ClientDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const [data, setData] = useState<ClientDetailData | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<Tab>('portfolio')
  const [portfolioView, setPortfolioView] = useState<PortfolioView>('current')
  const router = useRouter()

  useEffect(() => {
    async function fetchClient() {
      try {
        const res = await fetch(`/api/clients/${id}`)
        if (res.status === 404) { router.push('/'); return }
        const json = await res.json()
        setData(json)
      } catch {
        router.push('/')
      } finally {
        setLoading(false)
      }
    }
    fetchClient()
  }, [id, router])

  if (loading) {
    return (
      <>
        <Header title="Client Detail" />
        <div className="p-8 animate-pulse">
          <div className="h-8 bg-border/50 rounded w-48 mb-4" />
          <div className="h-4 bg-border/50 rounded w-32" />
        </div>
      </>
    )
  }

  if (!data) return null

  const { client, portfolio, notes } = data
  const proposed = portfolio.proposed

  // Synthesize a pending history entry when a rebalance has been sent for approval
  const proposedHistoryEntry: import('@/lib/types').HistoryEntry | null =
    proposed?.status === 'pending_approval'
      ? {
          id: `proposed_${client.id}`,
          clientId: client.id,
          actionType: 'rebalance_proposed',
          advisorId: proposed.advisorId,
          executedAt: proposed.sentForApprovalAt ?? proposed.draftStartedAt,
          totalValue: portfolio.accepted.totalValue,
          trades: proposed.holdings
            .map(h => {
              const accepted = portfolio.accepted.holdings.find(a => a.ticker === h.ticker)
              const delta = ((h.targetWeighting - (accepted?.targetWeighting ?? 0)) / 100) * portfolio.accepted.totalValue
              return Math.abs(delta) > 1
                ? { side: (delta > 0 ? 'buy' : 'sell') as 'buy' | 'sell', ticker: h.ticker, name: h.name, amount: Math.abs(delta) }
                : null
            })
            .filter(Boolean) as import('@/lib/types').HistoryEntry['trades'],
        }
      : null

  const history = [
    ...(proposedHistoryEntry ? [proposedHistoryEntry] : []),
    ...data.history,
  ]
  const advisor = firmConfig.advisors.find(a => a.id === client.advisorId)
  const drift = getDriftStatus(client.draftStartedAt)
  const perf = formatPerformance(client.monthlyPerformance)
  const hasProposed = !!portfolio.proposed

  return (
    <>
      <Header title={client.name} />
      <div className="p-8 pb-16">

        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-[11px] text-sage mb-6">
          <Link href="/" className="hover:text-text transition-colors">Client Book</Link>
          <span className="material-symbols-outlined text-[14px]">chevron_right</span>
          <span className="text-text font-medium">{client.name}</span>
        </div>

        {/* Client Header card */}
        <div className="bg-surface rounded border border-border/50 shadow-sm px-8 py-6 mb-6">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="font-heading text-3xl text-text mb-1">{client.name}</h1>
              <p className="text-[11px] text-sage font-medium uppercase tracking-wider">
                {advisor ? `${advisor.name} — ${advisor.title}` : ''}
              </p>
            </div>
            <div className="text-right">
              <p className="font-body text-3xl font-bold tabular-nums text-text">{formatCurrency(client.totalValue)}</p>
              <div className={`flex items-center justify-end gap-1 mt-1 text-xs font-medium ${perf.isPositive ? 'text-[#2D6A4F]' : 'text-[#C0392B]'}`}>
                <span className="material-symbols-outlined text-sm">{perf.icon}</span>
                <span>{perf.text} this month</span>
              </div>
            </div>
          </div>

          {/* Stats row */}
          <div className="flex items-center gap-8 mt-6 pt-6 border-t border-border/40">
            <div>
              <p className="text-[10px] text-sage uppercase tracking-wider font-medium mb-1">Last Rebalanced</p>
              <p className="text-sm font-medium text-text">{formatDate(client.lastRebalanced)}</p>
            </div>
            <div>
              <p className="text-[10px] text-sage uppercase tracking-wider font-medium mb-1">Drift Status</p>
              <div className="flex items-center gap-1.5">
                <div className={`w-2 h-2 rounded-full ${drift.color}`} />
                <p className={`text-sm font-medium ${drift.status === 'green' ? 'text-[#2D6A4F]' : drift.status === 'amber' ? 'text-[#D4800A]' : 'text-[#C0392B]'}`}>
                  {drift.label}
                </p>
              </div>
            </div>
            <div>
              <p className="text-[10px] text-sage uppercase tracking-wider font-medium mb-1">Notes</p>
              <p className="text-sm font-medium text-text">{client.noteCount}</p>
            </div>

            {/* Portfolio Actions CTA */}
            <div className="ml-auto">
              <Link
                href={`/actions/${id}`}
                className="inline-block px-5 py-2.5 bg-accent text-[#1A241B] rounded font-body font-bold text-sm hover:brightness-110 active:scale-95 transition-all"
              >
                Portfolio Actions →
              </Link>
            </div>
          </div>
        </div>

        {/* Drift Banner */}
        <DriftBanner
          draftStartedAt={client.draftStartedAt}
          sentForApprovalAt={client.sentForApprovalAt}
        />

        {/* Tabs */}
        <div className="flex items-center gap-0 border-b border-border mb-6">
          {(['portfolio', 'history', 'notes'] as Tab[]).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-3 text-sm font-medium capitalize transition-colors border-b-2 -mb-px ${
                activeTab === tab
                  ? 'border-accent text-text'
                  : 'border-transparent text-sage hover:text-text'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Tab content */}
        {activeTab === 'portfolio' && (
          <div className="bg-surface rounded border border-border/50 shadow-sm px-8 py-6">
            {/* Current / Proposed toggle */}
            {hasProposed && (
              <div className="flex items-center gap-3 mb-6">
                <div className="inline-flex rounded border border-border overflow-hidden text-sm">
                  {(['current', 'proposed'] as PortfolioView[]).map(v => (
                    <button
                      key={v}
                      onClick={() => setPortfolioView(v)}
                      className={`px-5 py-2 font-medium capitalize transition-colors ${
                        portfolioView === v
                          ? 'bg-primary text-white'
                          : 'bg-surface text-sage hover:text-text'
                      }`}
                    >
                      {v}
                    </button>
                  ))}
                </div>
                {portfolioView === 'proposed' && (
                  <span className="text-[11px] text-[#D4800A] font-medium">
                    Showing proposed changes — green rows increase, red rows decrease
                  </span>
                )}
              </div>
            )}

            <HoldingsTable
              accepted={portfolio.accepted}
              proposed={portfolio.proposed}
              view={hasProposed ? portfolioView : 'current'}
            />
          </div>
        )}

        {activeTab === 'history' && (
          <div className="bg-surface rounded border border-border/50 shadow-sm px-8 py-2">
            <HistoryTab history={history} />
          </div>
        )}

        {activeTab === 'notes' && (
          <div>
            <NotesTab notes={notes} />
          </div>
        )}
      </div>
    </>
  )
}
