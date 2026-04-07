/**
 * @jest-environment node
 */
import { GET, PUT } from '@/app/api/portfolio/[id]/draft/route'
import { NextRequest } from 'next/server'

const makeGetRequest = (id: string) =>
  new NextRequest(`http://localhost:3000/api/portfolio/${id}/draft`)

const makePutRequest = (id: string, body: object) =>
  new NextRequest(`http://localhost:3000/api/portfolio/${id}/draft`, {
    method: 'PUT',
    body: JSON.stringify(body),
    headers: { 'Content-Type': 'application/json' },
  })

describe('/api/portfolio/[id]/draft', () => {
  it('GET returns null when no KV available', async () => {
    const res = await GET(makeGetRequest('client_001'), { params: Promise.resolve({ id: 'client_001' }) })
    expect(res.status).toBe(200)
    const data = await res.json()
    expect(data.draft).toBeNull()
  })

  it('PUT returns 200 with saved draft', async () => {
    const draft = {
      clientId: 'client_001',
      holdings: [{ ticker: 'MSFT', targetWeighting: 20 }],
      status: 'draft',
      draftStartedAt: new Date().toISOString(),
      sentForApprovalAt: null,
      advisorId: 'advisor_andrew',
    }
    const res = await PUT(makePutRequest('client_001', draft), { params: Promise.resolve({ id: 'client_001' }) })
    expect(res.status).toBe(200)
    const data = await res.json()
    expect(data.ok).toBe(true)
  })

  it('GET returns 400 for missing id', async () => {
    const res = await GET(makeGetRequest(''), { params: Promise.resolve({ id: '' }) })
    expect(res.status).toBe(400)
  })
})
