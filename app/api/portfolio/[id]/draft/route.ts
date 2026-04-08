import { NextRequest, NextResponse } from 'next/server'
import { kv } from '@/lib/kv'
import { DraftPortfolio, HistoryEntry } from '@/lib/types'

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
      await kv.set(`draft:${id}`, body)
    } catch (e) {
      // KV unavailable — return ok anyway (dev mode)
      console.error(e)
    }
  }

  return NextResponse.json({ ok: true })
}
