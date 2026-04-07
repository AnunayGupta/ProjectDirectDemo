/**
 * @jest-environment node
 */
import { GET } from '@/app/api/clients/[id]/route'
import { NextRequest } from 'next/server'
import { CLIENTS, PORTFOLIOS, SEED_NOTES, SEED_HISTORY } from '@/lib/seed-data'

const makeRequest = (id: string) =>
  new NextRequest(`http://localhost:3000/api/clients/${id}`)

describe('/api/clients/[id] GET', () => {
  it('returns client, portfolio, notes, and history for a valid id', async () => {
    const res = await GET(makeRequest('client_001'), { params: Promise.resolve({ id: 'client_001' }) })
    expect(res.status).toBe(200)
    const data = await res.json()
    expect(data.client.id).toBe('client_001')
    expect(data.client.name).toBe("Seán O'Brien")
    expect(data.portfolio.accepted).toBeDefined()
    expect(data.portfolio.accepted.holdings.length).toBeGreaterThan(0)
    expect(Array.isArray(data.notes)).toBe(true)
    expect(Array.isArray(data.history)).toBe(true)
  })

  it('returns 404 for an unknown client id', async () => {
    const res = await GET(makeRequest('client_999'), { params: Promise.resolve({ id: 'client_999' }) })
    expect(res.status).toBe(404)
  })

  it('portfolio.proposed is null when no draft exists in KV', async () => {
    const res = await GET(makeRequest('client_001'), { params: Promise.resolve({ id: 'client_001' }) })
    const data = await res.json()
    // No KV connected in tests — proposed should safely be null
    expect(data.portfolio.proposed).toBeNull()
  })
})
