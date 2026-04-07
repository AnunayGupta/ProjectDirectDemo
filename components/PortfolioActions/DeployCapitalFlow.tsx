import React, { useState } from 'react'
import { Holding, Client } from '@/lib/types'
import { formatCurrency } from '@/lib/utils'

interface Props {
  holdings: Holding[]
  client: Client
  amount: number
  onAmountChange: (amt: number) => void
  maxAmount: number
}

export default function DeployCapitalFlow({ holdings, client, amount, onAmountChange, maxAmount }: Props) {

  // Filter out cash, and determine relative proportions
  const investableHoldings = holdings.filter(h => h.ticker !== 'CASH' && h.targetWeighting > 0)
  const totalInvestableWeight = investableHoldings.reduce((sum, h) => sum + h.targetWeighting, 0)

  return (
    <>
      <div className="w-[60%] flex flex-col overflow-y-auto border-r border-border/40 p-8 bg-surface">
        <div className="mb-8">
          <h2 className="text-3xl font-serif text-text mb-2">Deploy Capital</h2>
          <p className="text-sm text-sage font-body">A client has deposited new funds. Select how to deploy the capital across their portfolio.</p>
        </div>

        {/* Amount Input */}
        <div className="mb-10">
          <label className="block text-xs font-bold uppercase tracking-wider text-text mb-3">Amount to deploy</label>
          <div className="relative group">
            <span className="absolute left-6 top-1/2 -translate-y-1/2 text-2xl font-bold text-sage">€</span>
            <input
              type="text"
              className={`w-full bg-surface border-none border-b-2 focus:ring-0 text-3xl font-bold tabular-nums pl-12 py-4 outline-none transition-all ${
                amount > maxAmount 
                  ? 'border-[#C0392B] focus:border-[#C0392B] text-[#C0392B]' 
                  : 'border-border/40 focus:border-accent text-text'
              }`}
              value={amount.toLocaleString()}
              onChange={(e) => onAmountChange(Number(e.target.value.replace(/,/g, '')) || 0)}
            />
          </div>
          {amount > maxAmount ? (
            <p className="text-xs text-[#C0392B] mt-2 font-bold">Cannot deploy more than available cash ({formatCurrency(maxAmount)})</p>
          ) : (
            <p className="text-xs text-sage mt-2 italic">This amount will be invested across the selected portfolios</p>
          )}
        </div>

        {/* Deployment Methods */}
        <div className="space-y-4">
          <div className="border-l-4 border-accent bg-background p-6 rounded-r-lg border border-border border-l-accent shadow-sm">
            <div className="flex items-start gap-4 mb-6 cursor-pointer">
              <div className="mt-1 w-5 h-5 rounded-full border-2 border-accent flex items-center justify-center">
                <div className="w-2.5 h-2.5 rounded-full bg-accent"></div>
              </div>
              <div>
                <h3 className="font-bold text-text">Deploy Proportionally</h3>
                <p className="text-sm text-sage">Invest across all holdings according to their current target weightings</p>
              </div>
            </div>

            {/* Allocation Preview Table */}
            <div className="overflow-hidden rounded border border-border">
              <table className="w-full text-left text-xs tabular-nums">
                <thead className="bg-surface text-sage uppercase tracking-tighter border-b border-border">
                  <tr>
                    <th className="px-4 py-3 font-semibold">Holding</th>
                    <th className="px-4 py-3 font-semibold text-right">Target %</th>
                    <th className="px-4 py-3 font-semibold text-right">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border bg-surface">
                  {investableHoldings.map((h) => {
                    const relativeWeight = totalInvestableWeight > 0 ? (h.targetWeighting / totalInvestableWeight) : 0
                    const allocatedAmount = relativeWeight * amount
                    return (
                      <tr key={h.ticker}>
                        <td className="px-4 py-3 font-medium text-text">
                          {h.name} <span className="text-sage ml-1">{h.ticker}</span>
                        </td>
                        <td className="px-4 py-3 text-right">{h.targetWeighting.toFixed(1)}%</td>
                        <td className="px-4 py-3 text-right font-bold text-[#2D6A4F]">
                          {formatCurrency(allocatedAmount)}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
                <tfoot className="bg-background border-t border-border">
                  <tr className="font-bold">
                    <td className="px-4 py-4 text-text">Total</td>
                    <td className="px-4 py-4 text-right">100.0%</td>
                    <td className="px-4 py-4 text-right text-primary">{formatCurrency(amount)}</td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>

        </div>
      </div>

      <div className="w-[40%] flex flex-col p-8 overflow-y-auto bg-surface-container-low">
        <h2 className="text-2xl font-serif text-text mb-6">Impact Preview</h2>
        
        <div className="flex-1 overflow-y-auto mb-6 pr-2">
          <h3 className="text-[10px] uppercase text-sage font-bold tracking-widest mb-4">Proposed Trades</h3>
          <div className="space-y-3">
            {investableHoldings.map(h => {
               const relativeWeight = totalInvestableWeight > 0 ? (h.targetWeighting / totalInvestableWeight) : 0
               const allocatedAmt = relativeWeight * amount
               return (
                 <div key={h.ticker} className="flex justify-between items-center py-1 border-b border-border/40">
                   <span className="text-xs font-medium text-text">
                     Buy {h.name} <span className="text-sage text-[10px] ml-1 uppercase">{h.ticker}</span>
                   </span>
                   <span className="text-xs font-bold text-[#2D6A4F] tabular-nums">+{formatCurrency(allocatedAmt)}</span>
                 </div>
               )
            })}
          </div>
          
          <div className="mt-6 flex justify-between items-center pt-4 border-t border-border/40">
            <span className="text-xs uppercase tracking-widest text-sage font-bold">Total Deployment</span>
            <span className="text-xl font-bold tabular-nums text-text">{formatCurrency(amount)}</span>
          </div>
        </div>
      </div>
    </>
  )
}
