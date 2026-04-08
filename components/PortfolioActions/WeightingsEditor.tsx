'use client'
import { useState, useRef, useCallback } from 'react'
import { Holding } from '@/lib/types'
import { formatWeighting, formatCurrency } from '@/lib/utils'
import { ASSET_UNIVERSE } from '@/lib/seed-data'

interface WeightingsEditorProps {
  holdings: Holding[]
  onHoldingChange: (ticker: string, targetWeighting: number) => void
  onHoldingAdd: (ticker: string) => void
  onHoldingRemove: (ticker: string) => void
  saveStatus: 'idle' | 'saving' | 'saved'
  totalValue: number
}

const ASSET_CLASS_COLORS: Record<string, string> = {
  equity: '#2C3B2D',
  etf: '#B5A07A',
  bond: '#8A9E8C',
  cash: '#C4A8A0',
}

export default function WeightingsEditor({
  holdings,
  onHoldingChange,
  onHoldingAdd,
  onHoldingRemove,
  saveStatus,
  totalValue,
}: WeightingsEditorProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [showSearch, setShowSearch] = useState(false)
  const total = holdings.reduce((s, h) => s + h.targetWeighting, 0)
  const isValid = Math.abs(total - 100) < 0.1

  const isDraggingRef = useRef(false)
  const frozenOrderRef = useRef<string[]>([])

  // Sort: non-cash holdings by target weight desc, CASH always last
  // Freeze order while dragging so the list doesn't jump mid-interaction
  const freshSorted = [...holdings].sort((a, b) => {
    if (a.ticker === 'CASH') return 1
    if (b.ticker === 'CASH') return -1
    return b.targetWeighting - a.targetWeighting
  })
  const sortedHoldings = isDraggingRef.current && frozenOrderRef.current.length > 0
    ? frozenOrderRef.current
        .map(ticker => holdings.find(h => h.ticker === ticker))
        .filter(Boolean) as typeof holdings
    : freshSorted

  const cashHolding = holdings.find(h => h.ticker === 'CASH')

  // Search filtering
  const existingTickers = new Set(holdings.map(h => h.ticker))
  const searchResults = searchTerm.trim()
    ? ASSET_UNIVERSE.filter(
        a =>
          !existingTickers.has(a.ticker) &&
          (a.ticker.toLowerCase().includes(searchTerm.toLowerCase()) ||
            a.name.toLowerCase().includes(searchTerm.toLowerCase()))
      ).slice(0, 5)
    : []

  return (
    <div className="flex flex-col h-full">
      {/* Panel header */}
      <div className="flex items-center justify-between px-8 py-4 border-b border-border/40">
        <div className="flex items-center gap-3">
          <h2 className="text-sm font-medium text-text uppercase tracking-wider">Portfolio Weightings</h2>
          <span className={`text-[11px] font-medium transition-opacity ${
            saveStatus === 'idle' ? 'opacity-0' :
            saveStatus === 'saving' ? 'opacity-100 text-sage' :
            'opacity-100 text-[#2D6A4F]'
          }`}>
            {saveStatus === 'saving' ? 'Saving...' : '✓ Saved'}
          </span>
        </div>
        <button
          onClick={() => setShowSearch(!showSearch)}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-accent border border-accent/30 rounded hover:bg-accent/5 transition-colors"
        >
          <span className="material-symbols-outlined text-[14px]">add</span>
          Add Instrument
        </button>
      </div>

      {/* Validation warning */}
      {!isValid && (
        <div className="mx-8 mt-3 px-4 py-2.5 rounded border border-[#D4800A]/30 bg-[#FFF8F0] flex items-center gap-2">
          <span className="material-symbols-outlined text-[#D4800A] text-[16px]">warning</span>
          <p className="text-[11px] text-[#D4800A] font-medium">
            Weightings total {total.toFixed(1)}% — must equal 100% before sending for approval
          </p>
        </div>
      )}

      {/* Add Instrument search (collapsible) */}
      {showSearch && (
        <div className="mx-8 mt-3 relative">
          <div className="relative">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-sage text-[16px]">search</span>
            <input
              type="text"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              placeholder="Search by ticker or name..."
              autoFocus
              className="w-full pl-9 pr-3 py-2 rounded border border-border bg-background text-text text-sm focus:outline-none focus:ring-1 focus:ring-accent"
            />
          </div>
          {searchResults.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-surface border border-border rounded shadow-lg z-10 overflow-hidden">
              {searchResults.map(a => (
                <button
                  key={a.ticker}
                  onClick={() => {
                    onHoldingAdd(a.ticker)
                    setSearchTerm('')
                    setShowSearch(false)
                  }}
                  className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-background transition-colors border-b border-border/30 last:border-0"
                >
                  <div>
                    <span className="text-sm font-medium text-text">{a.ticker}</span>
                    <span className="text-xs text-sage ml-2">{a.name}</span>
                  </div>
                  <span className="text-[10px] uppercase tracking-wider text-sage px-2 py-0.5 rounded bg-background">{a.assetClass}</span>
                </button>
              ))}
            </div>
          )}
          {searchTerm.trim() && searchResults.length === 0 && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-surface border border-border rounded shadow-lg z-10 px-4 py-3">
              <p className="text-xs text-sage">No matching instruments found</p>
            </div>
          )}
        </div>
      )}

      {/* Holdings with sliders */}
      <div className="flex-1 overflow-auto px-8 py-4 space-y-1">
        {sortedHoldings.map(h => {
          const isCash = h.ticker === 'CASH'
          const delta = h.targetWeighting - h.currentWeighting
          const deltaValue = (delta / 100) * totalValue
          const barColor = ASSET_CLASS_COLORS[h.assetClass] ?? '#E2DDD6'

          return (
            <div
              key={h.ticker}
              className={`group rounded-lg px-4 py-3 transition-colors ${
                isCash ? 'bg-[#F2EFE9]/60 border border-border/40' : 'hover:bg-background/60'
              }`}
            >
              {/* Row 1: Name + value */}
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2 min-w-0">
                  <div
                    className="w-2 h-2 rounded-full flex-shrink-0"
                    style={{ backgroundColor: barColor }}
                  />
                  <span className="text-sm font-medium text-text truncate">{h.ticker}</span>
                  <span className="text-[10px] text-sage truncate hidden sm:inline">{h.name}</span>
                  {isCash && (
                    <span className="text-[9px] font-bold uppercase tracking-wider text-sage bg-border/60 px-1.5 py-0.5 rounded">
                      Balancing
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-3 flex-shrink-0">
                  {/* Delta indicator */}
                  {Math.abs(delta) > 0.05 && (
                    <span className={`text-[10px] font-bold tabular-nums ${
                      delta > 0 ? 'text-[#2D6A4F]' : 'text-[#C0392B]'
                    }`}>
                      {delta > 0 ? '+' : ''}{formatCurrency(deltaValue)}
                    </span>
                  )}
                  {/* Remove button (not for CASH) */}
                  {!isCash && (
                    <button
                      onClick={() => onHoldingRemove(h.ticker)}
                      className="opacity-0 group-hover:opacity-100 text-sage hover:text-[#C0392B] transition-all p-0.5 rounded"
                      title={`Remove ${h.ticker}`}
                    >
                      <span className="material-symbols-outlined text-[14px]">close</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Row 2: Slider + percentage */}
              <div className="flex items-center gap-3">
                {/* Current weighting ghost bar + target slider */}
                <div className="flex-1 relative h-7 flex items-center">
                  {/* Background track */}
                  <div className="absolute inset-x-0 h-2 bg-border/40 rounded-full" />
                  {/* Current weighting marker (ghost) */}
                  {h.currentWeighting > 0 && Math.abs(delta) > 0.05 && (
                    <div
                      className="absolute h-2 rounded-full opacity-30"
                      style={{
                        width: `${Math.min(h.currentWeighting, 100)}%`,
                        backgroundColor: barColor,
                      }}
                    />
                  )}
                  {/* Target weighting bar */}
                  <div
                    className="absolute h-2 rounded-full transition-all duration-150"
                    style={{
                      width: `${Math.min(h.targetWeighting, 100)}%`,
                      backgroundColor: barColor,
                      opacity: 0.85,
                    }}
                  />
                  {/* Slider input */}
                  <input
                    type="range"
                    min="0"
                    max={100}
                    step="0.1"
                    value={h.targetWeighting}
                    onChange={e => onHoldingChange(h.ticker, parseFloat(e.target.value))}
                    onPointerDown={() => {
                      frozenOrderRef.current = freshSorted.map(h => h.ticker)
                      isDraggingRef.current = true
                    }}
                    onPointerUp={() => { isDraggingRef.current = false }}
                    disabled={isCash}
                    className={`absolute inset-x-0 h-7 appearance-none bg-transparent cursor-pointer z-10
                      [&::-webkit-slider-thumb]:appearance-none
                      [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4
                      [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white
                      [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-primary
                      [&::-webkit-slider-thumb]:shadow-md [&::-webkit-slider-thumb]:cursor-grab
                      [&::-webkit-slider-thumb]:active:cursor-grabbing
                      [&::-webkit-slider-thumb]:hover:scale-125 [&::-webkit-slider-thumb]:transition-transform
                      ${isCash ? '[&::-webkit-slider-thumb]:hidden cursor-default' : ''}
                    `}
                  />
                </div>

                {/* Percentage display / inline edit */}
                <div className="w-16 text-right flex-shrink-0">
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    max="100"
                    value={h.targetWeighting.toFixed(1)}
                    onChange={e => onHoldingChange(h.ticker, parseFloat(e.target.value) || 0)}
                    disabled={isCash}
                    className={`w-full text-right text-sm font-bold tabular-nums bg-transparent border-none outline-none
                      ${isCash ? 'text-sage cursor-default' : 'text-text focus:text-primary'}
                      [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none`}
                  />
                </div>
              </div>

              {/* Current vs Target annotation */}
              {Math.abs(delta) > 0.05 && (
                <div className="flex items-center gap-1 mt-1 ml-5">
                  <span className="text-[9px] text-sage tabular-nums">
                    {formatWeighting(h.currentWeighting)}
                  </span>
                  <span className="material-symbols-outlined text-[10px] text-sage">arrow_forward</span>
                  <span className={`text-[9px] font-bold tabular-nums ${
                    delta > 0 ? 'text-[#2D6A4F]' : 'text-[#C0392B]'
                  }`}>
                    {formatWeighting(h.targetWeighting)}
                  </span>
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Footer total */}
      <div className={`px-8 py-4 border-t flex items-center justify-between ${isValid ? 'border-border/40' : 'border-[#D4800A]'}`}>
        <span className="text-[10px] font-medium text-sage uppercase tracking-wider">Total</span>
        <span className={`text-sm font-bold tabular-nums ${isValid ? 'text-[#2D6A4F]' : 'text-[#C0392B]'}`}>
          {total.toFixed(1)}%
        </span>
      </div>
    </div>
  )
}
