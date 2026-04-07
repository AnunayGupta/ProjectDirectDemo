import { GET } from '@/app/api/reports/route'
import { POST } from '@/app/api/reports/generate/route'
import { NextRequest } from 'next/server'
import { setTestKV } from '@/lib/kv'

describe('GET /api/reports', () => {
  it('returns all 200 clients with default pending status', async () => {
    const req = new NextRequest('http://localhost/api/reports')
    const res = await GET(req)
    const data = await res.json()
    expect(res.status).toBe(200)
    expect(data).toHaveLength(200)
    data.forEach((r: any) => expect(r.reportStatus.status).toBe('pending'))
  })
  it('returns generated status for clients in KV', async () => {
    await setTestKV('report:client_001', {
      status: 'generated',
      generatedAt: new Date().toISOString(),
      month: '2026-03',
    })
    const req = new NextRequest('http://localhost/api/reports')
    const res = await GET(req)
    const data = await res.json()
    const sean = data.find((r: any) => r.id === 'client_001')
    expect(sean.reportStatus.status).toBe('generated')
  })
})

describe('POST /api/reports/generate', () => {
  it('marks all clients as generated when empty clientIds', async () => {
    const req = new NextRequest('http://localhost/api/reports/generate', {
      method: 'POST',
      body: JSON.stringify({ clientIds: [] }),
    })
    const res = await POST(req)
    const data = await res.json()
    expect(res.status).toBe(200)
    expect(data.count).toBe(200)
  })
  it('marks only specified clients as generated', async () => {
    const req = new NextRequest('http://localhost/api/reports/generate', {
      method: 'POST',
      body: JSON.stringify({ clientIds: ['client_001', 'client_002'] }),
    })
    const res = await POST(req)
    const data = await res.json()
    expect(data.count).toBe(2)
  })
})
