'use client'
import { useState, useEffect, useCallback, use, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Header from '@/components/Header'
import ActionModeTabs, { ActionMode } from '@/components/PortfolioActions/ActionModeTabs'
import WeightingsEditor from '@/components/PortfolioActions/WeightingsEditor'
import ImpactPreview from '@/components/PortfolioActions/ImpactPreview'
import DeployCapitalFlow from '@/components/PortfolioActions/DeployCapitalFlow'
import WithdrawFlow from '@/components/PortfolioActions/WithdrawFlow'
import ApprovalModal from '@/components/PortfolioActions/ApprovalModal'
import Toast from '@/components/Toast'
import { Client, Holding, AcceptedPortfolio } from '@/lib/types'
import { formatCurrency } from '@/lib/utils'
import { ASSET_UNIVERSE } from '@/lib/seed-data'

type SaveStatus = 'idle' | 'saving' | 'saved'
type Toast = { message: string; variant: 'info' | 'success' | 'loading' } | null

export default function PortfolioActionsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()

  const [client, setClient] = useState<Client | null>(null)
  const [portfolio, setPortfolio] = useState<AcceptedPortfolio | null>(null)
  const [draftHoldings, setDraftHoldings] = useState<Holding[]>([])
  const [loading, setLoading] = useState(true)
  const [activeMode, setActiveMode] = useState<ActionMode>('rebalance')
  const [deployAmount, setDeployAmount] = useState<number>(25000)
  const [withdrawAmount, setWithdrawAmount] = useState<number>(15000)
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('idle')
  const [showModal, setShowModal] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [toast, setToast] = useState<Toast>(null)
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
        // Start from existing draft if present, otherwise from accepted holdings
        const initial: Holding[] = (data.portfolio.proposed?.holdings ?? data.portfolio.accepted.holdings)
          .map((h: Holding) => ({ ...h }))
        setDraftHoldings(initial)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [id, router])

  // Update a holding's target weighting + auto-balance against CASH + debounce save
  const handleHoldingChange = useCallback((ticker: string, targetWeighting: number) => {
    setDraftHoldings(prev => {
      const old = prev.find(h => h.ticker === ticker)
      const delta = targetWeighting - (old?.targetWeighting ?? 0)
      // If editing CASH directly, don't auto-balance
      if (ticker === 'CASH') {
        return prev.map(h => h.ticker === ticker ? { ...h, targetWeighting } : h)
      }
      return prev.map(h => {
        if (h.ticker === ticker) return { ...h, targetWeighting }
        if (h.ticker === 'CASH') return { ...h, targetWeighting: Math.max(0, h.targetWeighting - delta) }
        return h
      })
    })
    setSaveStatus('saving')
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(async () => {
      if (!client) return
      try {
        const old = draftHoldings.find(h => h.ticker === ticker)
        const delta = targetWeighting - (old?.targetWeighting ?? 0)
        const updated = ticker === 'CASH'
          ? draftHoldings.map(h => h.ticker === ticker ? { ...h, targetWeighting } : h)
          : draftHoldings.map(h => {
              if (h.ticker === ticker) return { ...h, targetWeighting }
              if (h.ticker === 'CASH') return { ...h, targetWeighting: Math.max(0, h.targetWeighting - delta) }
              return h
            })
        await fetch(`/api/portfolio/${id}/draft`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            clientId: id,
            holdings: updated,
            status: 'draft',
            draftStartedAt: new Date().toISOString(),
            sentForApprovalAt: null,
            advisorId: 'advisor_andrew',
          }),
        })
        setSaveStatus('saved')
        setTimeout(() => setSaveStatus('idle'), 2000)
      } catch {
        setSaveStatus('idle')
      }
    }, 500)
  }, [id, client, draftHoldings])

  const handleHoldingAdd = useCallback((ticker: string) => {
    const asset = ASSET_UNIVERSE.find(a => a.ticker === ticker)
    if (!asset || draftHoldings.some(h => h.ticker === ticker)) return
    
    const newHolding: Holding = {
      ...asset,
      currentWeighting: 0,
      targetWeighting: 0,
      value: 0,
      performance: 0
    }
    setDraftHoldings(prev => [...prev, newHolding])
    setSaveStatus('saving')
    // We can just rely on the user editing the target weighting to trigger the DB save, 
    // or trigger it immediately. Triggering immediately gives feedback.
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(async () => {
      if (!client) return
      try {
        await fetch(`/api/portfolio/${id}/draft`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            clientId: id,
            holdings: [...draftHoldings, newHolding],
            status: 'draft',
            draftStartedAt: new Date().toISOString(),
            sentForApprovalAt: null,
            advisorId: 'advisor_andrew',
          }),
        })
        setSaveStatus('saved')
        setTimeout(() => setSaveStatus('idle'), 2000)
      } catch {
        setSaveStatus('idle')
      }
    }, 500)
  }, [id, client, draftHoldings])

  const handleHoldingRemove = useCallback((ticker: string) => {
    setDraftHoldings(prev => {
      const removed = prev.find(h => h.ticker === ticker)
      const freedWeight = removed?.targetWeighting ?? 0
      return prev
        .filter(h => h.ticker !== ticker)
        .map(h => h.ticker === 'CASH' ? { ...h, targetWeighting: h.targetWeighting + freedWeight } : h)
    })
    setSaveStatus('saving')
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(async () => {
      if (!client) return
      try {
        const removed = draftHoldings.find(h => h.ticker === ticker)
        const freedWeight = removed?.targetWeighting ?? 0
        const updated = draftHoldings
          .filter(h => h.ticker !== ticker)
          .map(h => h.ticker === 'CASH' ? { ...h, targetWeighting: h.targetWeighting + freedWeight } : h)
        await fetch(`/api/portfolio/${id}/draft`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            clientId: id,
            holdings: updated,
            status: 'draft',
            draftStartedAt: new Date().toISOString(),
            sentForApprovalAt: null,
            advisorId: 'advisor_andrew',
          }),
        })
        setSaveStatus('saved')
        setTimeout(() => setSaveStatus('idle'), 2000)
      } catch {
        setSaveStatus('idle')
      }
    }, 500)
  }, [id, client, draftHoldings])

  const handleReset = useCallback(async () => {
    if (!client || !portfolio) return
    if (!confirm('Revert all proposed changes back to current portfolio state?')) return
    
    const initial = portfolio.holdings.map((h: Holding) => ({ ...h }))
    setDraftHoldings(initial)
    setSaveStatus('saving')
    try {
      await fetch(`/api/portfolio/${id}/draft`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clientId: id,
          holdings: initial,
          status: 'draft',
          draftStartedAt: new Date().toISOString(),
          sentForApprovalAt: null,
          advisorId: 'advisor_andrew',
        }),
      })
      setSaveStatus('saved')
      setTimeout(() => setSaveStatus('idle'), 2000)
    } catch {
      setSaveStatus('idle')
    }
  }, [id, client, portfolio])

  // Send for approval
  const handleConfirmApproval = useCallback(async () => {
    if (!client) return
    setIsSubmitting(true)

    let finalHoldings = [...draftHoldings]
    if (activeMode === 'deploy_capital' || activeMode === 'withdraw') {
        const investableHoldings = finalHoldings.filter(h => h.ticker !== 'CASH' && h.targetWeighting > 0)
        const totalInvestableWeight = investableHoldings.reduce((s, h) => s + h.targetWeighting, 0)
        
        const amount = activeMode === 'deploy_capital' ? deployAmount : withdrawAmount
        const cashSign = activeMode === 'deploy_capital' ? -1 : 1
        
        finalHoldings = finalHoldings.map(h => {
             if (h.ticker === 'CASH') {
                 const oldCashValue = (h.targetWeighting / 100) * client.totalValue
                 const newCashValue = Math.max(0, oldCashValue + (cashSign * amount))
                 return { ...h, targetWeighting: (newCashValue / client.totalValue) * 100 }
             }
             if (h.targetWeighting > 0) {
                 const relativeWeight = totalInvestableWeight > 0 ? (h.targetWeighting / totalInvestableWeight) : 0
                 const actionToAsset = relativeWeight * amount
                 const oldValue = (h.targetWeighting / 100) * client.totalValue
                 const newValue = activeMode === 'deploy_capital' ? oldValue + actionToAsset : Math.max(0, oldValue - actionToAsset)
                 return { ...h, targetWeighting: (newValue / client.totalValue) * 100 }
             }
             return h
        })
    }

    try {
      await fetch(`/api/portfolio/${id}/draft`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clientId: id,
          holdings: finalHoldings,
          actionType: activeMode,
          status: 'pending_approval',
          draftStartedAt: new Date().toISOString(),
          sentForApprovalAt: new Date().toISOString(),
          advisorId: 'advisor_andrew',
        }),
      })
      setShowModal(false)
      setToast({ message: 'Sent for approval', variant: 'success' })
      setTimeout(() => router.push(`/clients/${id}`), 2000)
    } catch {
      setToast({ message: 'Failed to send — please retry', variant: 'info' })
    } finally {
      setIsSubmitting(false)
    }
  }, [id, client, draftHoldings, router, activeMode, deployAmount, withdrawAmount])

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

  const cashHolding = draftHoldings.find(h => h.ticker === 'CASH')
  const cashValue = cashHolding ? (cashHolding.targetWeighting / 100) * client.totalValue : 0
  const nonCashValue = client.totalValue - cashValue

  const totalDraftWeight = draftHoldings.reduce((s, h) => s + h.targetWeighting, 0)
  const isWeightValid = Math.abs(totalDraftWeight - 100) < 0.1
  
  const isDeployValid = deployAmount > 0 && deployAmount <= cashValue + 0.01
  const isWithdrawValid = withdrawAmount > 0 && withdrawAmount <= nonCashValue + 0.01

  const isFormValid = isWeightValid && (
    activeMode === 'rebalance' ? true :
    activeMode === 'deploy_capital' ? isDeployValid :
    activeMode === 'withdraw' ? isWithdrawValid : false
  )

  return (
    <>
      <Header title="Portfolio Actions" />
      <div className="flex flex-col" style={{ height: 'calc(100vh - 56px)' }}>

        {/* Breadcrumb + client context bar */}
        <div className="flex items-center justify-between px-8 py-3 border-b border-border/40 bg-surface/80 flex-shrink-0">
          <div className="flex items-center gap-2 text-[11px] text-sage">
            <Link href="/" className="hover:text-text transition-colors">Client Book</Link>
            <span className="material-symbols-outlined text-[14px]">chevron_right</span>
            <Link href={`/clients/${id}`} className="hover:text-text transition-colors">{client.name}</Link>
            <span className="material-symbols-outlined text-[14px]">chevron_right</span>
            <span className="text-text font-medium">Portfolio Actions</span>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-[10px] text-sage uppercase tracking-wider">Portfolio Value</p>
              <p className="font-bold tabular-nums text-text">{formatCurrency(client.totalValue)}</p>
            </div>
            <div className="flex flex-col items-end gap-1">
              <div className="flex gap-2">
                <button
                  onClick={handleReset}
                  className="px-4 py-2 bg-surface text-sage border border-border/40 rounded font-body font-bold text-sm 
                             hover:text-text hover:bg-surface-container transition-all"
                >
                  Reset
                </button>
                <button
                  onClick={() => setShowModal(true)}
                  disabled={!isFormValid}
                  className="px-5 py-2 bg-accent text-[#1A241B] rounded font-body font-bold text-sm 
                             hover:brightness-110 transition-all
                             disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:brightness-100"
                >
                  Send for Approval →
                </button>
              </div>
              {!isWeightValid && (
                <span className="text-[10px] text-[#C0392B] font-bold">Weights total {totalDraftWeight.toFixed(1)}%</span>
              )}
            </div>
          </div>
        </div>

        {/* Action Mode Tabs */}
        <div className="px-8 flex-shrink-0 bg-surface border-b border-border/40">
          <ActionModeTabs activeMode={activeMode} onModeChange={setActiveMode} />
        </div>

        {/* Dynamic Panel based on active mode */}
        <div className="flex flex-1 overflow-hidden">
          {activeMode === 'rebalance' && (
            <>
              {/* Left: Weightings Editor — 60% */}
              <div className="w-[60%] flex flex-col overflow-hidden border-r border-border/40">
                <WeightingsEditor
                  holdings={draftHoldings}
                  onHoldingChange={handleHoldingChange}
                  onHoldingAdd={handleHoldingAdd}
                  onHoldingRemove={handleHoldingRemove}
                  saveStatus={saveStatus}
                  totalValue={client.totalValue}
                />
              </div>

              {/* Right: Impact Preview — 40% */}
              <div className="w-[40%] flex flex-col overflow-hidden">
                <ImpactPreview
                  holdings={draftHoldings}
                  totalValue={client.totalValue}
                />
              </div>
            </>
          )}
          {activeMode === 'deploy_capital' && (
            <DeployCapitalFlow 
              holdings={draftHoldings} 
              client={client} 
              amount={deployAmount}
              onAmountChange={setDeployAmount}
              maxAmount={cashValue}
            />
          )}
          {activeMode === 'withdraw' && (
            <WithdrawFlow 
              holdings={draftHoldings} 
              client={client} 
              amount={withdrawAmount}
              onAmountChange={setWithdrawAmount}
              maxAmount={nonCashValue}
            />
          )}
        </div>
      </div>

      {/* Approval modal */}
      {showModal && (
        <ApprovalModal
          clientName={client.name}
          clientId={id}
          totalValue={client.totalValue}
          holdings={draftHoldings}
          onConfirm={handleConfirmApproval}
          onCancel={() => setShowModal(false)}
          isSubmitting={isSubmitting}
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
