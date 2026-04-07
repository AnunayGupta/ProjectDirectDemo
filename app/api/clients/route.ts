import { NextResponse, NextRequest } from 'next/server'
import { kv } from '@/lib/kv'
import { CLIENTS } from '@/lib/seed-data'
import { Client } from '@/lib/types'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const advisorFilter = searchParams.get('advisor')

  let clients: Client[] = CLIENTS.map(c => ({ ...c, lastReviewedAt: null }))

  // Try remote KV if securely enabled
  if (process.env.KV_REST_API_URL) {
    try {
      let remoteClients = await kv.get<typeof CLIENTS>('demo:clients')
      if (!remoteClients) {
        await kv.set('demo:clients', CLIENTS)
        remoteClients = CLIENTS
      }
      clients = remoteClients.map(c => ({ ...c, lastReviewedAt: null }))
    } catch {
      console.warn('KV fetch failed, using local seed fallback')
    }
  }

  // Attach lastReviewedAt from KV for each client
  if (process.env.KV_REST_API_URL) {
    try {
      await Promise.all(
        clients.map(async c => {
          const ts = await kv.get<string>(`reviewed:${c.id}`)
          if (ts) c.lastReviewedAt = ts
        })
      )
    } catch {
      // KV unavailable — lastReviewedAt stays null
    }
  }

  // Filter logic
  if (advisorFilter && advisorFilter !== 'All Advisors') {
    clients = clients.filter(c => c.advisorId === advisorFilter)
  }

  return NextResponse.json(clients)
}
