import { NextResponse, NextRequest } from 'next/server'
import { kv } from '@/lib/kv'
import { CLIENTS, PORTFOLIOS, SEED_NOTES, SEED_HISTORY } from '@/lib/seed-data'
import { DraftPortfolio, PortfolioResponse, HistoryEntry } from '@/lib/types'

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const client = CLIENTS.find(c => c.id === id)
  if (!client) {
    return NextResponse.json({ error: 'Client not found' }, { status: 404 })
  }

  const accepted = PORTFOLIOS[id]
  let proposed: DraftPortfolio | null = null

  // Try fetching the draft portfolio and history from KV if connected
  let historyFromKv: HistoryEntry[] = []
  if (process.env.KV_REST_API_URL) {
    try {
      proposed = await kv.get<DraftPortfolio>(`draft:${id}`)
      const hist = await kv.get<HistoryEntry[]>(`history:${id}`)
      if (hist) historyFromKv = hist
    } catch {
      // KV not available — proposed stays null
    }
  }

  const portfolio: PortfolioResponse = { accepted, proposed }
  const notes = SEED_NOTES[id] ?? []
  const history = [...historyFromKv, ...(SEED_HISTORY[id] ?? [])]

  return NextResponse.json({ client, portfolio, notes, history })
}
