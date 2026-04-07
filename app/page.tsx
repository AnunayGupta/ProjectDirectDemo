'use client'

import { useState, useEffect } from 'react'
import Header from '@/components/Header'
import ClientTile from '@/components/ClientTile'
import FilterBar from '@/components/FilterBar'
import BulkActionBar from '@/components/BulkActionBar'
import { Client, AcceptedPortfolio } from '@/lib/types'
import { ADVISORS, PORTFOLIOS } from '@/lib/seed-data'
import { getDriftStatus } from '@/lib/utils'

export default function Home() {
  const [clients, setClients] = useState<Client[]>([])
  const [loading, setLoading] = useState(true)
  const [advisorFilter, setAdvisorFilter] = useState('All Advisors')
  const [driftFilter, setDriftFilter] = useState('All Drift Status')
  const [valueFilter, setValueFilter] = useState('All Values')
  const [reviewFilter, setReviewFilter] = useState('All Review Status')
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())

  useEffect(() => {
    async function fetchClients() {
      setLoading(true)
      try {
        const url = new URL('/api/clients', window.location.origin)
        if (advisorFilter !== 'All Advisors') {
          url.searchParams.set('advisor', advisorFilter)
        }
        const res = await fetch(url.toString())
        const data = await res.json()
        setClients(data)
      } catch (err) {
        console.error("Failed to fetch clients", err)
      } finally {
        setLoading(false)
      }
    }
    fetchClients()
  }, [advisorFilter])

  const toggleClient = (id: string) => {
    const next = new Set(selectedIds)
    if (next.has(id)) next.delete(id)
    else next.add(id)
    setSelectedIds(next)
  }

  const clearSelection = () => setSelectedIds(new Set())

  const handleMarkReviewed = async () => {
    const now = new Date().toISOString()
    // Optimistically update local client state
    setClients(prev => prev.map(c =>
      selectedIds.has(c.id) ? { ...c, lastReviewedAt: now } : c
    ))
    // Persist each reviewed client to KV
    await Promise.all(
      [...selectedIds].map(id =>
        fetch(`/api/clients/${id}/reviewed`, { method: 'PUT' }).catch(() => {})
      )
    )
    clearSelection()
  }

  const handleSendReports = () => {
    // Static demo — shows a toast or alert; no real send in Phase 4
    clearSelection()
  }

  // Local filtering
  const filteredClients = clients.filter(c => {
    // Drift Status
    if (driftFilter !== 'All Drift Status') {
      const drift = getDriftStatus(c.draftStartedAt)
      if (driftFilter === 'In Sync' && drift.status !== 'green') return false
      if (driftFilter === 'Drifted' && drift.status === 'green') return false
    }
    
    // Portfolio Value
    if (valueFilter !== 'All Values') {
      if (valueFilter === '< €1M' && c.totalValue >= 1000000) return false
      if (valueFilter === '€1M - €5M' && (c.totalValue < 1000000 || c.totalValue > 5000000)) return false
      if (valueFilter === '> €5M' && c.totalValue <= 5000000) return false
    }

    // Review Days
    if (reviewFilter !== 'All Review Status') {
      if (reviewFilter === 'Never Reviewed' && c.lastReviewedAt) return false
      if (reviewFilter !== 'Never Reviewed') {
        if (!c.lastReviewedAt) return false
        const diffDays = (Date.now() - new Date(c.lastReviewedAt).getTime()) / (1000 * 60 * 60 * 24)
        if (reviewFilter === 'Reviewed < 3d' && diffDays >= 3) return false
        if (reviewFilter === 'Reviewed < 7d' && diffDays >= 7) return false
      }
    }

    return true
  })

  // Calculate bulk summary
  const selectedClients = filteredClients.filter(c => selectedIds.has(c.id))
  const bulkValue = selectedClients.reduce((sum, c) => sum + c.totalValue, 0)

  return (
    <>
      <Header title="Client Book" />
      <div className="p-8 pb-32">
        
        <FilterBar 
          advisorFilter={advisorFilter} 
          onAdvisorChange={(val) => { setAdvisorFilter(val); clearSelection() }}
          driftFilter={driftFilter}
          onDriftChange={(val) => { setDriftFilter(val); clearSelection() }}
          valueFilter={valueFilter}
          onValueChange={(val) => { setValueFilter(val); clearSelection() }}
          reviewFilter={reviewFilter}
          onReviewChange={(val) => { setReviewFilter(val); clearSelection() }}
        />

        {loading ? (
          <div className="flex items-center justify-center py-20 text-sage gap-2 animate-pulse">
            <span className="material-symbols-outlined animate-spin">refresh</span>
            Loading Client Book...
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredClients.map(client => (
              <ClientTile
                key={client.id}
                client={client}
                advisor={ADVISORS.find(a => a.id === client.advisorId)}
                portfolio={PORTFOLIOS[client.id]}
                isSelected={selectedIds.has(client.id)}
                reviewedAt={client.lastReviewedAt ? new Date(client.lastReviewedAt) : null}
                onToggle={toggleClient}
              />
            ))}
            {filteredClients.length === 0 && (
              <div className="col-span-full py-20 text-center text-sage">
                No clients match your filter.
              </div>
            )}
          </div>
        )}

      </div>

      <BulkActionBar
        selectedCount={selectedIds.size}
        totalValue={bulkValue}
        onClear={clearSelection}
        onMarkReviewed={handleMarkReviewed}
        onSendReports={handleSendReports}
      />
    </>
  )
}
