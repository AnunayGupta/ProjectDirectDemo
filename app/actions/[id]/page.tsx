'use client'
import { useState, useEffect, useCallback, use, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Header from '@/components/Header'
import WeightingsEditor from '@/components/PortfolioActions/WeightingsEditor'
import ImpactPreview from '@/components/PortfolioActions/ImpactPreview'
import QuickActions from '@/components/PortfolioActions/QuickActions'
import RaiseCashModal from '@/components/PortfolioActions/RaiseCashModal'
import ApprovalModal from '@/components/PortfolioActions/ApprovalModal'
import ClientPhonePreview from '@/components/PortfolioActions/ClientPhonePreview'
import Toast from '@/components/Toast'
import { Client, Holding, AcceptedPortfolio } from '@/lib/types'
import { formatCurrency } from '@/lib/utils'
import { ASSET_UNIVERSE } from '@/lib/seed-data'

type SaveStatus = 'idle' | 'saving' | 'saved'
type ToastState = { message: string; variant: 'info' | 'success' | 'loading' } | null

export default function PortfolioActionsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()

  const [client, setClient] = useState<Client | null>(null)
  const [portfolio, setPortfolio] = useState<AcceptedPortfolio | null>(null)
  const [proposedHoldings, setProposedHoldings] = useState<Holding[] | null>(null)
  const [draftHoldings, setDraftHoldings] = useState<Holding[]>([])
  const [loading, setLoading] = useState(true)
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('idle')
  const [showApprovalModal, setShowApprovalModal] = useState(false)
  const [showRaiseCashModal, setShowRaiseCashModal] = useState(false)
  const [showPhonePreview, setShowPhonePreview] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [toast, setToast] = useState<ToastState>(null)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Load client + portfolio
  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(`/api/clients/${id}`)
        if (!res.ok) { router.push('/actions'); return }
        const data = await res.json()
        setClient(data.client)
        setPortfolio(data.portfolio.accepted)
        const initial: Holding[] = (data.portfolio.proposed?.holdings ?? data.portfolio.accepted.holdings)
          .map((h: Holding) => ({ ...h }))
        setDraftHoldings(initial)
        if (data.portfolio.proposed) {
          setProposedHoldings(data.portfolio.proposed.holdings.map((h: Holding) => ({ ...h })))
        }
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [id, router])

  // Debounced save to KV
  const saveDraft = useCallback((holdings: Holding[], status: 'draft' | 'pending_approval' = 'draft', actionType?: string) => {
    setSaveStatus('saving')
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(async () => {
      if (!client) return
      try {
        await fetch(`/api/portfolio/${id}/draft`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            clientId: id,
            holdings,
            status,
            ...(actionType && { actionType }),
            draftStartedAt: new Date().toISOString(),
            sentForApprovalAt: status === 'pending_approval' ? new Date().toISOString() : null,
            advisorId: 'advisor_andrew',
          }),
        })
        setSaveStatus('saved')
        setTimeout(() => setSaveStatus('idle'), 2000)
      } catch {
        setSaveStatus('idle')
      }
    }, 400)
  }, [id, client])

  // Update a holding's target weighting — auto-balance against CASH
  const handleHoldingChange = useCallback((ticker: string, targetWeighting: number) => {
    setDraftHoldings(prev => {
      const old = prev.find(h => h.ticker === ticker)
      const delta = targetWeighting - (old?.targetWeighting ?? 0)
      if (ticker === 'CASH') {
        const updated = prev.map(h => h.ticker === ticker ? { ...h, targetWeighting } : h)
        saveDraft(updated)
        return updated
      }
      const cashBalance = prev.find(h => h.ticker === 'CASH')?.targetWeighting ?? 0
      const clampedDelta = delta > 0 ? Math.min(delta, cashBalance) : delta
      const updated = prev.map(h => {
        if (h.ticker === ticker) return { ...h, targetWeighting: (old?.targetWeighting ?? 0) + clampedDelta }
        if (h.ticker === 'CASH') return { ...h, targetWeighting: Math.max(0, h.targetWeighting - clampedDelta) }
        return h
      })
      saveDraft(updated)
      return updated
    })
  }, [saveDraft])

  const handleHoldingAdd = useCallback((ticker: string) => {
    const asset = ASSET_UNIVERSE.find(a => a.ticker === ticker)
    if (!asset || draftHoldings.some(h => h.ticker === ticker)) return

    const newHolding: Holding = {
      ...asset,
      currentWeighting: 0,
      targetWeighting: 0,
      value: 0,
      performance: 0,
    }
    const updated = [...draftHoldings, newHolding]
    setDraftHoldings(updated)
    saveDraft(updated)
  }, [draftHoldings, saveDraft])

  const handleHoldingRemove = useCallback((ticker: string) => {
    setDraftHoldings(prev => {
      const removed = prev.find(h => h.ticker === ticker)
      const freedWeight = removed?.targetWeighting ?? 0
      const updated = prev
        .filter(h => h.ticker !== ticker)
        .map(h => h.ticker === 'CASH' ? { ...h, targetWeighting: h.targetWeighting + freedWeight } : h)
      saveDraft(updated)
      return updated
    })
  }, [saveDraft])

  // Quick Actions
  const handleResetToProposed = useCallback(() => {
    if (!proposedHoldings) return
    const reset = proposedHoldings.map(h => ({ ...h }))
    setDraftHoldings(reset)
    saveDraft(reset)
    setToast({ message: 'Reset to proposed state', variant: 'info' })
    setTimeout(() => setToast(null), 3000)
  }, [proposedHoldings, saveDraft])

  const handleResetToModel = useCallback(() => {
    if (!portfolio) return
    const initial = portfolio.holdings.map((h: Holding) => ({ ...h }))
    setDraftHoldings(initial)
    saveDraft(initial)
    setToast({ message: 'Reset to current portfolio state', variant: 'info' })
    setTimeout(() => setToast(null), 3000)
  }, [portfolio, saveDraft])

  const handleLiquidateAll = useCallback(() => {
    if (!confirm('Move 100% of all positions to cash? This will set all non-cash holdings to 0%.')) return
    setDraftHoldings(prev => {
      const totalNonCash = prev.filter(h => h.ticker !== 'CASH').reduce((s, h) => s + h.targetWeighting, 0)
      const updated = prev.map(h => {
        if (h.ticker === 'CASH') return { ...h, targetWeighting: h.targetWeighting + totalNonCash }
        return { ...h, targetWeighting: 0 }
      })
      saveDraft(updated)
      return updated
    })
    setToast({ message: 'All positions liquidated to cash', variant: 'info' })
    setTimeout(() => setToast(null), 3000)
  }, [saveDraft])

  const handleRaiseCashConfirm = useCallback((updatedHoldings: Holding[]) => {
    setDraftHoldings(updatedHoldings)
    saveDraft(updatedHoldings)
    setShowRaiseCashModal(false)
    setToast({ message: 'Cash position updated', variant: 'success' })
    setTimeout(() => setToast(null), 3000)
  }, [saveDraft])

  // Send for approval
  const handleConfirmApproval = useCallback(async () => {
    if (!client) return
    setIsSubmitting(true)
    try {
      await fetch(`/api/portfolio/${id}/draft`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clientId: id,
          holdings: draftHoldings,
          actionType: 'rebalance',
          status: 'pending_approval',
          draftStartedAt: new Date().toISOString(),
          sentForApprovalAt: new Date().toISOString(),
          advisorId: 'advisor_andrew',
        }),
      })
      setShowApprovalModal(false)
      setShowPhonePreview(true)
    } catch {
      setToast({ message: 'Failed to send — please retry', variant: 'info' })
    } finally {
      setIsSubmitting(false)
    }
  }, [id, client, draftHoldings, router])

  if (loading) {
    return (
      <>
        <Header title="Portfolio Actions" />
        <div className="flex h-[calc(100vh-56px)]">
          <div className="w-[60%] p-8 animate-pulse space-y-4">
            {[...Array(6)].map((_, i) => <div key={i} className="h-10 bg-border/40 rounded" />)}
          </div>
        </div>
      </>
    )
  }

  if (!client || !portfolio) return null

  const hasChanges = draftHoldings.some(h => {
    const orig = portfolio.holdings.find(o => o.ticker === h.ticker)
    if (!orig) return true
    return Math.abs(h.targetWeighting - orig.targetWeighting) > 0.05
  }) || draftHoldings.length !== portfolio.holdings.length

  const totalDraftWeight = draftHoldings.reduce((s, h) => s + h.targetWeighting, 0)
  const isWeightValid = Math.abs(totalDraftWeight - 100) < 0.1

  return (
    <>
      <Header title="Portfolio Actions" />
      <div className="flex flex-col" style={{ height: 'calc(100vh - 56px)' }}>

        {/* Top bar: breadcrumb + quick actions + send */}
        <div className="flex items-center justify-between px-8 py-3 border-b border-border/40 bg-surface/80 flex-shrink-0">
          <div className="flex items-center gap-2 text-[11px] text-sage">
            <Link href="/" className="hover:text-text transition-colors">Client Book</Link>
            <span className="material-symbols-outlined text-[14px]">chevron_right</span>
            <Link href={`/clients/${id}`} className="hover:text-text transition-colors">{client.name}</Link>
            <span className="material-symbols-outlined text-[14px]">chevron_right</span>
            <span className="text-text font-medium">Portfolio Actions</span>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right mr-2">
              <p className="text-[10px] text-sage uppercase tracking-wider">Portfolio Value</p>
              <p className="font-bold tabular-nums text-text">{formatCurrency(client.totalValue)}</p>
            </div>
            <div data-tour="editor-quick-actions">
            <QuickActions
              onResetToModel={handleResetToModel}
              onResetToProposed={handleResetToProposed}
              hasProposed={proposedHoldings !== null}
              onRaiseCash={() => setShowRaiseCashModal(true)}
              onLiquidateAll={handleLiquidateAll}
            />
            </div>
            <div className="w-px h-8 bg-border/40" />
            <div className="flex flex-col items-end gap-1">
              <button
                data-tour="editor-send"
                onClick={() => setShowApprovalModal(true)}
                disabled={!isWeightValid || !hasChanges}
                className="px-5 py-2 bg-accent text-[#1A241B] rounded font-body font-bold text-sm
                  hover:brightness-110 transition-all
                  disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:brightness-100"
              >
                Send for Approval
              </button>
              {!isWeightValid && hasChanges && (
                <span className="text-[10px] text-[#C0392B] font-bold">Weights total {totalDraftWeight.toFixed(1)}%</span>
              )}
            </div>
          </div>
        </div>

        {/* Main workspace: Editor (left) + Impact Preview (right) */}
        <div className="flex flex-1 overflow-hidden">
          {/* Left: Weightings Editor */}
          <div data-tour="editor-weightings" className="w-[55%] flex flex-col overflow-hidden border-r border-border/40">
            <WeightingsEditor
              holdings={draftHoldings}
              onHoldingChange={handleHoldingChange}
              onHoldingAdd={handleHoldingAdd}
              onHoldingRemove={handleHoldingRemove}
              saveStatus={saveStatus}
              totalValue={client.totalValue}
            />
          </div>

          {/* Right: Impact Preview */}
          <div data-tour="editor-impact" className="w-[45%] flex flex-col overflow-hidden">
            <ImpactPreview
              holdings={draftHoldings}
              totalValue={client.totalValue}
            />
          </div>
        </div>
      </div>

      {/* Modals */}
      {showApprovalModal && (
        <ApprovalModal
          clientName={client.name}
          clientId={id}
          totalValue={client.totalValue}
          holdings={draftHoldings}
          onConfirm={handleConfirmApproval}
          onCancel={() => setShowApprovalModal(false)}
          isSubmitting={isSubmitting}
        />
      )}

      {showPhonePreview && client && (
        <ClientPhonePreview
          clientName={client.name}
          holdings={draftHoldings}
          totalValue={client.totalValue}
          onClose={() => router.push(`/clients/${id}`)}
        />
      )}

      {showRaiseCashModal && (
        <RaiseCashModal
          holdings={draftHoldings}
          totalValue={client.totalValue}
          onConfirm={handleRaiseCashConfirm}
          onCancel={() => setShowRaiseCashModal(false)}
        />
      )}

      {/* Toast */}
      {toast && (
        <Toast
          message={toast.message}
          variant={toast.variant}
          onDismiss={() => setToast(null)}
        />
      )}
    </>
  )
}
