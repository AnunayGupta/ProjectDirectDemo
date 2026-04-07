import { NextRequest, NextResponse } from 'next/server'
import { kv } from '@/lib/kv'
import { DraftPortfolio, HistoryEntry } from '@/lib/types'
import { CLIENTS, PORTFOLIOS } from '@/lib/seed-data'

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 })

  let draft: DraftPortfolio | null = null
  if (process.env.KV_REST_API_URL) {
    try {
      draft = await kv.get<DraftPortfolio>(`draft:${id}`)
    } catch {
      // KV unavailable — return null
    }
  }

  return NextResponse.json({ draft })
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 })

  const body: DraftPortfolio & { actionType?: HistoryEntry['actionType'] } = await req.json()

  if (process.env.KV_REST_API_URL) {
    try {
      if (body.status === 'pending_approval' && body.actionType) {
        const clientObj = CLIENTS.find(c => c.id === id)
        const portfolioObj = PORTFOLIOS[id]
        
        let originalHoldings = portfolioObj ? portfolioObj.holdings : []
        let totalValue = clientObj ? clientObj.totalValue : 0

        const trades: HistoryEntry['trades'] = []
        for (const h of body.holdings) {
          const orig = originalHoldings.find((o: any) => o.ticker === h.ticker) || { targetWeighting: 0 }
          const targetW = h.targetWeighting
          const origW = orig.targetWeighting
          const deltaAmt = ((targetW - origW) / 100) * totalValue
          if (Math.abs(deltaAmt) > 1) {
            trades.push({
              side: deltaAmt > 0 ? 'buy' : 'sell',
              ticker: h.ticker,
              name: h.name,
              amount: Math.abs(deltaAmt)
            })
          }
        }

        const newHistoryEntry: HistoryEntry = {
          id: crypto.randomUUID(),
          clientId: id,
          actionType: body.actionType,
          trades,
          advisorId: body.advisorId,
          executedAt: new Date().toISOString(),
          totalValue
        }

        const existingHist = await kv.get<HistoryEntry[]>(`history:${id}`) || []
        await kv.set(`history:${id}`, [newHistoryEntry, ...existingHist])
      }

      // remove actionType before saving the draft if we want to be strict, but kv.set doesn't mind extra fields
      await kv.set(`draft:${id}`, body)
    } catch (e) {
      // KV unavailable — return ok anyway (dev mode)
      console.error(e)
    }
  }

  return NextResponse.json({ ok: true })
}
