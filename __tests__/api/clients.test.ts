/**
 * @jest-environment node
 */
import { GET } from '@/app/api/clients/route'
import { NextRequest } from 'next/server'
import { CLIENTS } from '@/lib/seed-data'

describe('/api/clients GET', () => {
  it('returns all clients by default for root query', async () => {
    const req = new NextRequest('http://localhost:3000/api/clients')
    const res = await GET(req)
    const data = await res.json()
    expect(data.length).toEqual(200) // All 200 seeded clients should be returned
    expect(data[0].id).toBe('client_001')
  })

  it('filters clients strictly by assigned advisor', async () => {
    const req = new NextRequest('http://localhost:3000/api/clients?advisor=advisor_tom')
    const res = await GET(req)
    const data = await res.json()
    // Tom Clinch was assigned exactly 45 clients in our data seed constraints
    expect(data.length).toEqual(45)
    data.forEach((client: any) => {
      expect(client.advisorId).toBe('advisor_tom')
    })
  })
  
  it('returns all clients when "All Advisors" filter is actively passed', async () => {
    const req = new NextRequest('http://localhost:3000/api/clients?advisor=All%20Advisors')
    const res = await GET(req)
    const data = await res.json()
    expect(data.length).toEqual(200)
  })

  it('returns empty array when an invalid advisor ID is passed', async () => {
    const req = new NextRequest('http://localhost:3000/api/clients?advisor=invalid_user_999')
    const res = await GET(req)
    const data = await res.json()
    expect(data).toBeInstanceOf(Array)
    expect(data.length).toEqual(0)
  })
})
