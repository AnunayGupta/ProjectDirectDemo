import {
  formatCurrency,
  formatAUM,
  formatPerformance,
  formatDate,
  formatWeighting,
  driftDays,
  driftLabel,
} from '@/lib/utils'

describe('formatCurrency', () => {
  it('formats whole numbers with € prefix and comma separator', () => {
    expect(formatCurrency(428500)).toBe('€428,500')
  })
  it('formats millions correctly', () => {
    expect(formatCurrency(2106400)).toBe('€2,106,400')
  })
  it('formats decimals to 2 places', () => {
    expect(formatCurrency(428500.50)).toBe('€428,500.50')
  })
  it('handles zero', () => {
    expect(formatCurrency(0)).toBe('€0')
  })
})

describe('formatAUM', () => {
  it('formats millions with m suffix', () => {
    expect(formatAUM(142000000)).toBe('€142m')
  })
  it('formats partial millions with one decimal', () => {
    expect(formatAUM(18400000)).toBe('€18.4m')
  })
})

describe('formatPerformance', () => {
  it('shows up arrow for positive values', () => {
    expect(formatPerformance(2.4)).toBe('↑ 2.4%')
  })
  it('shows down arrow for negative values', () => {
    expect(formatPerformance(-0.8)).toBe('↓ 0.8%')
  })
  it('shows dash for zero', () => {
    expect(formatPerformance(0)).toBe('— 0.0%')
  })
})

describe('formatDate', () => {
  it('formats ISO date to DD Mon YYYY', () => {
    expect(formatDate('2026-01-12')).toBe('12 Jan 2026')
  })
  it('formats single digit days without padding', () => {
    expect(formatDate('2026-03-02')).toBe('02 Mar 2026')
  })
})

describe('formatWeighting', () => {
  it('always shows one decimal place', () => {
    expect(formatWeighting(20)).toBe('20.0%')
    expect(formatWeighting(9.5)).toBe('9.5%')
  })
})

describe('driftDays', () => {
  it('returns null for null input', () => {
    expect(driftDays(null)).toBeNull()
  })
  it('returns correct number of days from ISO date', () => {
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
    expect(driftDays(thirtyDaysAgo.toISOString())).toBe(30)
  })
})

describe('driftLabel', () => {
  it('returns In sync when no draft', () => {
    expect(driftLabel(null, null)).toBe('In sync')
  })
  it('returns Draft X days when draft exists and not sent', () => {
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 34)
    expect(driftLabel(thirtyDaysAgo.toISOString(), null)).toBe('Draft 34 days')
  })
  it('returns Awaiting approval when sent', () => {
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 34)
    expect(driftLabel(thirtyDaysAgo.toISOString(), new Date().toISOString())).toBe('Awaiting approval')
  })
})
