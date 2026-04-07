import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(value: number): string {
  if (value === 0) return '€0'
  const isDecimal = value % 1 !== 0
  
  // Use formatting that matches "€428,500" without spaces
  const formatter = new Intl.NumberFormat('en-US', {
    style: 'decimal',
    minimumFractionDigits: isDecimal ? 2 : 0,
    maximumFractionDigits: isDecimal ? 2 : 0,
  })
  
  return `€${formatter.format(value)}`
}

export function formatAUM(value: number): string {
  const millions = value / 1000000
  const formatted = millions % 1 === 0 ? millions.toString() : millions.toFixed(1)
  return `€${formatted}m`
}

export function formatPerformance(value: number): { text: string, isPositive: boolean, icon: string } {
  const isPositive = value >= 0
  const icon = isPositive ? 'trending_up' : 'trending_down'
  return {
    text: `${Math.abs(value).toFixed(1)}%`,
    isPositive,
    icon
  }
}

export function formatDate(isoString: string): string {
  const date = new Date(isoString)
  const day = date.getUTCDate().toString().padStart(2, '0')
  const month = date.toLocaleString('en-GB', { month: 'short', timeZone: 'UTC' })
  const year = date.getUTCFullYear()
  return `${day} ${month} ${year}`
}

export function formatWeighting(value: number): string {
  return `${value.toFixed(1)}%`
}

export function driftDays(draftStartedAt: string | null): number | null {
  if (!draftStartedAt) return null
  const draftDate = new Date(draftStartedAt)
  const today = new Date()
  const diffTime = today.getTime() - draftDate.getTime()
  const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24))
  return diffDays
}

export function driftLabel(draftStartedAt: string | null, sentForApprovalAt: string | null): string {
  if (sentForApprovalAt) return 'Awaiting approval'
  if (!draftStartedAt) return 'In sync'
  const days = driftDays(draftStartedAt)
  return `Draft ${days} days`
}

export function getDriftStatus(draftStartedAt: string | null): { status: 'green'|'amber'|'red', color: string, label: string } {
  const days = driftDays(draftStartedAt)
  let status: 'green'|'amber'|'red' = 'green'
  let color = 'bg-accent'
  let label = 'In sync'

  if (days !== null) {
    if (days >= 90) {
      status = 'red'
      color = 'bg-red-500'
      label = `Drift ${days}d`
    } else if (days >= 30) {
      status = 'amber'
      color = 'bg-amber-500'
      label = `Drift ${days}d`
    } else {
      label = `Drift ${days}d`
    }
  }

  return { status, color, label }
}
