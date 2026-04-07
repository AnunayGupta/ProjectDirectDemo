import { NextRequest, NextResponse } from 'next/server'
import { kv } from '@/lib/kv'

export async function PUT(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 })

  const now = new Date().toISOString()

  if (process.env.KV_REST_API_URL) {
    try {
      await kv.set(`reviewed:${id}`, now)
    } catch {
      // KV unavailable — still return success for dev
    }
  }

  return NextResponse.json({ ok: true, lastReviewedAt: now })
}
