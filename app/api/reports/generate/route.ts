import { NextResponse, NextRequest } from 'next/server'
import { kv } from '@/lib/kv'
import { CLIENTS } from '@/lib/seed-data'
import { ReportStatus } from '@/lib/types'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { clientIds } = body as { clientIds: string[] }

    // Empty array = all 200 clients
    const targetIds = (!clientIds || clientIds.length === 0)
      ? CLIENTS.map(c => c.id)
      : clientIds

    const now = new Date().toISOString()
    const reportStatus: ReportStatus = {
      status: 'generated',
      generatedAt: now,
      month: '2026-03',
    }

    // Write in parallel batches of 50
    const batchSize = 50
    for (let i = 0; i < targetIds.length; i += batchSize) {
      const batch = targetIds.slice(i, i + batchSize)
      await Promise.all(batch.map(id => kv.set(`report:${id}`, reportStatus)))
    }

    return NextResponse.json({ success: true, count: targetIds.length })
  } catch (error) {
    console.error('[/api/reports/generate] Error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
