'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import Header from '@/components/Header'
import { Client } from '@/lib/types'
import { firmConfig } from '@/lib/firm-config'
import { formatCurrency, getDriftStatus } from '@/lib/utils'

export default function ActionsClientPickerPage() {
  const [clients, setClients] = useState<Client[]>([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [searchDebounce, setSearchDebounce] = useState('')

  useEffect(() => {
    fetch('/api/clients')
      .then(r => r.json())
      .then((data: Client[]) => {
        // Sort by most drifted first (red → amber → green)
        const sorted = [...data].sort((a, b) => {
          const order = { red: 0, amber: 1, green: 2 }
          const dA = getDriftStatus(a.draftStartedAt).status
          const dB = getDriftStatus(b.draftStartedAt).status
          return (order[dA] ?? 3) - (order[dB] ?? 3)
        })
        setClients(sorted)
      })
      .finally(() => setLoading(false))
  }, [])

  // Debounce search 300ms
  useEffect(() => {
    const t = setTimeout(() => setSearchDebounce(search), 300)
    return () => clearTimeout(t)
  }, [search])

  const recent = clients.slice(0, 6)
  const filtered = searchDebounce
    ? clients.filter(c => c.name.toLowerCase().includes(searchDebounce.toLowerCase())).slice(0, 8)
    : []

  const displayList = searchDebounce ? filtered : recent

  return (
    <>
      <Header title="Portfolio Actions" />
      <div className="max-w-[640px] mx-auto px-8 py-12">
        <h1 className="font-heading text-3xl text-text mb-2">Portfolio Actions</h1>
        <p className="text-sm text-sage mb-8">Select a client to begin. Most drifted clients are shown first.</p>

        {/* Search */}
        <div className="relative mb-8">
          <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-sage text-[20px]">search</span>
          <input
            type="text"
            placeholder="Search clients..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-11 pr-4 py-3 rounded border border-border bg-surface text-text text-sm
                       placeholder:text-sage/60 focus:outline-none focus:ring-1 focus:ring-accent focus:border-accent"
          />
        </div>

        {/* Client list */}
        <div className="bg-surface rounded border border-border/50 shadow-sm overflow-hidden">
          {loading ? (
            [...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center justify-between px-6 py-4 border-b border-border/30 animate-pulse">
                <div className="w-40 h-4 bg-border/50 rounded" />
                <div className="w-20 h-4 bg-border/50 rounded" />
              </div>
            ))
          ) : displayList.length === 0 ? (
            <div className="px-6 py-8 text-center text-sm text-sage">
              {searchDebounce ? `No clients matching "${searchDebounce}"` : 'No clients found'}
            </div>
          ) : (
            displayList.map((c, i) => {
              const drift = getDriftStatus(c.draftStartedAt)
              const advisor = firmConfig.advisors.find(a => a.id === c.advisorId)
              return (
                <Link
                  key={c.id}
                  href={`/actions/${c.id}`}
                  className={`flex items-center justify-between px-6 py-4 outline-none focus-visible:ring-2 focus-visible:ring-accent ${i < displayList.length - 1 ? 'border-b border-border/30' : ''} 
                               hover:bg-surface-container transition-colors group cursor-pointer block`}
                >
                  <div className="flex items-center gap-4">
                    {/* Drift dot */}
                    <div className={`w-2 h-2 rounded-full flex-shrink-0 ${drift.color}`} />
                    <div>
                      <p className="font-medium text-text text-sm group-hover:text-accent transition-colors">{c.name}</p>
                      <p className="text-[11px] text-sage">{advisor?.name ?? ''} · {formatCurrency(c.totalValue)}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className={`text-[11px] font-medium ${
                      drift.status === 'green' ? 'text-[#2D6A4F]' :
                      drift.status === 'amber' ? 'text-[#D4800A]' : 'text-[#C0392B]'
                    }`}>{drift.label}</span>
                    <span
                      className="text-sm font-bold text-accent group-hover:underline flex items-center gap-1"
                    >
                      Select
                      <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
                    </span>
                  </div>
                </Link>
              )
            })
          )}
        </div>

        {!searchDebounce && (
          <p className="text-[11px] text-sage mt-4 text-center">
            Showing most drifted clients first ·{' '}
            <Link href="/" className="text-accent hover:underline">Go to Client Book →</Link>
          </p>
        )}
      </div>
    </>
  )
}
