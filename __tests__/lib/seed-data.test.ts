import { CLIENTS, ADVISORS, PORTFOLIOS, SEED_NOTES, SEED_HISTORY } from '@/lib/seed-data'

describe('ADVISORS', () => {
  it('contains exactly 7 advisors', () => {
    expect(ADVISORS).toHaveLength(7)
  })
  it('includes Andrew Collins as Director', () => {
    const andrew = ADVISORS.find(a => a.id === 'advisor_andrew')
    expect(andrew).toBeDefined()
    expect(andrew?.title).toBe('Director')
  })
  it('every advisor has required fields', () => {
    ADVISORS.forEach(advisor => {
      expect(advisor.id).toBeTruthy()
      expect(advisor.name).toBeTruthy()
      expect(advisor.title).toBeTruthy()
      expect(advisor.initials).toHaveLength(2)
    })
  })
})

describe('CLIENTS', () => {
  it('contains exactly 200 clients', () => {
    expect(CLIENTS).toHaveLength(200)
  })
  it('every client has a valid advisorId', () => {
    const advisorIds = ADVISORS.map(a => a.id)
    CLIENTS.forEach(client => {
      expect(advisorIds).toContain(client.advisorId)
    })
  })
  it('Andrew has the most clients', () => {
    const counts = ADVISORS.map(a => ({
      id: a.id,
      count: CLIENTS.filter(c => c.advisorId === a.id).length
    }))
    const andrew = counts.find(c => c.id === 'advisor_andrew')
    counts.forEach(c => {
      if (c.id !== 'advisor_andrew') {
        expect(andrew!.count).toBeGreaterThanOrEqual(c.count)
      }
    })
  })
  it('client_001 is Seán O\'Brien with pre-seeded draft', () => {
    const sean = CLIENTS.find(c => c.id === 'client_001')
    expect(sean?.name).toBe("Seán O'Brien")
    expect(sean?.draftStartedAt).not.toBeNull()
  })
  it('has correct drift distribution', () => {
    const green = CLIENTS.filter(c => c.draftStartedAt === null).length
    const drifted = CLIENTS.filter(c => c.draftStartedAt !== null).length
    expect(green).toBeGreaterThanOrEqual(100)
    expect(drifted).toBeGreaterThanOrEqual(70)
  })
})

describe('PORTFOLIOS', () => {
  it('has a portfolio for every client', () => {
    expect(Object.keys(PORTFOLIOS)).toHaveLength(200)
  })
  it('every portfolio weightings sum to 100', () => {
    Object.entries(PORTFOLIOS).forEach(([clientId, portfolio]) => {
      const total = portfolio.holdings.reduce((sum, h) => sum + h.currentWeighting, 0)
      expect(Math.round(total)).toBe(100)
    })
  })
  it('every portfolio has cash holding', () => {
    Object.values(PORTFOLIOS).forEach(portfolio => {
      const cash = portfolio.holdings.find(h => h.assetClass === 'cash')
      expect(cash).toBeDefined()
    })
  })
  it('every portfolio has 8-12 holdings', () => {
    Object.values(PORTFOLIOS).forEach(portfolio => {
      expect(portfolio.holdings.length).toBeGreaterThanOrEqual(8)
      expect(portfolio.holdings.length).toBeLessThanOrEqual(12)
    })
  })
  it('client_001 has MSFT and NVDA with different current and target weightings', () => {
    const portfolio = PORTFOLIOS['client_001']
    const msft = portfolio.holdings.find(h => h.ticker === 'MSFT')
    const nvda = portfolio.holdings.find(h => h.ticker === 'NVDA')
    expect(msft?.currentWeighting).not.toBe(msft?.targetWeighting)
    expect(nvda?.currentWeighting).not.toBe(nvda?.targetWeighting)
  })
})

describe('SEED_NOTES', () => {
  it('has notes for every client', () => {
    CLIENTS.forEach(client => {
      expect(SEED_NOTES[client.id]).toBeDefined()
      expect(SEED_NOTES[client.id].length).toBeGreaterThanOrEqual(2)
    })
  })
})

describe('SEED_HISTORY', () => {
  it('has history for every client', () => {
    CLIENTS.forEach(client => {
      expect(SEED_HISTORY[client.id]).toBeDefined()
      expect(SEED_HISTORY[client.id].length).toBeGreaterThanOrEqual(2)
    })
  })
})
