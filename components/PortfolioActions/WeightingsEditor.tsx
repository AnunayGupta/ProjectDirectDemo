'use client'
import { useState } from 'react'
import { Holding } from '@/lib/types'
import { formatWeighting } from '@/lib/utils'
import { ASSET_UNIVERSE } from '@/lib/seed-data'

interface WeightingsEditorProps {
  holdings: Holding[]
  onHoldingChange: (ticker: string, targetWeighting: number) => void
  onHoldingAdd: (ticker: string) => void
  onHoldingRemove: (ticker: string) => void
  saveStatus: 'idle' | 'saving' | 'saved'
  totalValue: number
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
  const total = holdings.reduce((s, h) => s + h.targetWeighting, 0)
  const isValid = Math.abs(total - 100) < 0.1

  return (
    <div className="flex flex-col h-full">
      {/* Panel header */}
      <div className="flex items-center justify-between px-8 py-4 border-b border-border/40">
        <h2 className="text-sm font-medium text-text uppercase tracking-wider">Adjust Target Weightings</h2>
        <span className={`text-[11px] font-medium transition-opacity ${
          saveStatus === 'idle' ? 'opacity-0' :
          saveStatus === 'saving' ? 'opacity-100 text-sage' :
          'opacity-100 text-[#2D6A4F]'
        }`}>
          {saveStatus === 'saving' ? 'Saving...' : '✓ Saved'}
        </span>
      </div>

      {/* Validation warning */}
      {!isValid && (
        <div className="mx-8 mt-4 px-4 py-2.5 rounded border border-[#D4800A]/30 bg-[#FFF8F0] flex items-center gap-2">
          <span className="material-symbols-outlined text-[#D4800A] text-[16px]">warning</span>
          <p className="text-[11px] text-[#D4800A] font-medium">
            Weightings total {total.toFixed(1)}% — must equal 100% before sending for approval
          </p>
        </div>
      )}

      {/* Add Instrument row */}
      <div className="mx-8 mt-4 flex items-center gap-2">
        <input 
          type="text" 
          list="asset-universe"
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          placeholder="Search ticker or name to add..."
          className="flex-1 px-3 py-1.5 rounded border border-border bg-surface text-text text-sm focus:outline-none focus:ring-1 focus:ring-accent"
        />
        <datalist id="asset-universe">
          {ASSET_UNIVERSE.map(a => (
            <option key={a.ticker} value={a.ticker}>{a.name}</option>
          ))}
        </datalist>
        <button 
          onClick={() => {
            if (searchTerm.trim()) {
              onHoldingAdd(searchTerm.trim())
              setSearchTerm('')
            }
          }}
          className="px-4 py-1.5 border border-accent text-accent font-medium text-sm rounded hover:bg-accent hover:text-[#1A241B] transition-colors"
        >
          Add
        </button>
      </div>

      {/* Table */}
      <div className="flex-1 overflow-auto px-8 py-4">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left text-[10px] font-medium text-sage uppercase tracking-wider pb-3">Holding</th>
              <th className="text-right text-[10px] font-medium text-sage uppercase tracking-wider pb-3">Current %</th>
              <th className="text-right text-[10px] font-medium text-sage uppercase tracking-wider pb-3">Target %</th>
              <th className="text-right text-[10px] font-medium text-sage uppercase tracking-wider pb-3">Δ Change</th>
              <th className="w-8 pb-3"></th>
            </tr>
          </thead>
          <tbody>
            {holdings.map(h => {
              const delta = h.targetWeighting - h.currentWeighting
              const isUp = delta > 0.05
              const isDown = delta < -0.05
              return (
                <tr key={h.ticker} className="border-b border-border/30">
                  <td className="py-3 pr-4">
                    <div className="flex flex-col">
                      <span className="font-medium text-text">{h.ticker}</span>
                      <span className="text-[10px] text-sage truncate max-w-[140px]">{h.name}</span>
                    </div>
                  </td>
                  <td className="py-3 text-right tabular-nums text-sage">{formatWeighting(h.currentWeighting)}</td>
                  <td className="py-3 text-right">
                    <input
                      type="number"
                      step="0.1"
                      min="0"
                      max="100"
                      value={h.targetWeighting}
                      onChange={e => onHoldingChange(h.ticker, parseFloat(e.target.value) || 0)}
                      className="w-20 text-right px-2 py-1 rounded border border-border bg-surface text-text text-sm font-medium 
                                 focus:outline-none focus:ring-1 focus:ring-accent focus:border-accent tabular-nums
                                 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    />
                  </td>
                  <td className={`py-3 text-right tabular-nums text-xs font-medium ${
                    isUp ? 'text-[#2D6A4F]' : isDown ? 'text-[#C0392B]' : 'text-sage'
                  }`}>
                    {isUp && '+'}{delta !== 0 ? delta.toFixed(1) + '%' : '—'}
                  </td>
                  <td className="py-3 text-right">
                    {h.ticker !== 'CASH' && (
                      <button 
                        onClick={() => onHoldingRemove(h.ticker)} 
                        className="text-sage hover:text-[#C0392B] transition-colors inline-flex items-center justify-center p-1 rounded hover:bg-surface-container"
                        title={`Remove ${h.ticker}`}
                      >
                        <span className="material-symbols-outlined text-[16px]">close</span>
                      </button>
                    )}
                  </td>
                </tr>
              )
            })}
          </tbody>
          <tfoot>
            <tr className={`border-t-2 ${isValid ? 'border-border' : 'border-[#D4800A]'}`}>
              <td colSpan={2} className="pt-3 text-[10px] font-medium text-sage uppercase tracking-wider">Total</td>
              <td className={`pt-3 text-right font-bold tabular-nums ${isValid ? 'text-[#2D6A4F]' : 'text-[#C0392B]'}`}>
                {total.toFixed(1)}%
              </td>
              <td colSpan={2} />
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  )
}
