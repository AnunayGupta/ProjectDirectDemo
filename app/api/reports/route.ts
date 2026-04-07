import { NextResponse } from 'next/server'
import { kv } from '@/lib/kv'
import { CLIENTS, ADVISORS } from '@/lib/seed-data'
import { ReportStatus } from '@/lib/types'

export async function GET() {
  try {
    // Batch fetch all report statuses from KV
    let reportStatuses: Record<string, ReportStatus | null> = {}

    if (process.env.KV_REST_API_URL) {
      try {
        const keys = CLIENTS.map(c => `report:${c.id}`)
        // Fetch in parallel batches of 50 to avoid hitting KV limits
        const batchSize = 50
        const results: (ReportStatus | null)[] = []
        for (let i = 0; i < keys.length; i += batchSize) {
          const batch = keys.slice(i, i + batchSize)
          const batchResults = await Promise.all(batch.map(k => kv.get<ReportStatus>(k)))
          results.push(...batchResults)
        }
        CLIENTS.forEach((c, i) => {
          reportStatuses[c.id] = results[i]
        })
      } catch {
        console.warn('[/api/reports] KV batch fetch failed, defaulting to pending')
      }
    }

    // Build advisor lookup for display
    const advisorMap = Object.fromEntries(ADVISORS.map(a => [a.id, a]))

    const data = CLIENTS.map(client => {
      const advisor = advisorMap[client.advisorId]
      const reportStatus: ReportStatus = reportStatuses[client.id] ?? {
        status: 'pending',
        generatedAt: null,
        month: '2026-03',
      }
      return {
        ...client,
        advisorName: advisor?.name ?? 'Unknown',
        advisorTitle: advisor?.title ?? '',
        reportStatus,
      }
    })

    return NextResponse.json(data)
  } catch (error) {
    console.error('[/api/reports] Error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
