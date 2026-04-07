import { NextRequest, NextResponse } from 'next/server'
import { renderToBuffer } from '@react-pdf/renderer'
import type { DocumentProps } from '@react-pdf/renderer'
import { CLIENTS, ADVISORS, PORTFOLIOS } from '@/lib/seed-data'
import ReportDocument from '@/components/Reports/ReportDocument'
import React from 'react'

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const client = CLIENTS.find(c => c.id === id)
    if (!client) {
      return NextResponse.json({ error: 'Client not found' }, { status: 404 })
    }

    const portfolio = PORTFOLIOS[id]
    if (!portfolio) {
      return NextResponse.json({ error: 'Portfolio not found' }, { status: 404 })
    }

    const advisor = ADVISORS.find(a => a.id === client.advisorId)

    const buffer = await renderToBuffer(
      React.createElement(ReportDocument, {
        clientId: client.id,
        clientName: client.name,
        advisorName: advisor?.name ?? 'Unknown',
        advisorTitle: advisor?.title ?? '',
        totalValue: client.totalValue,
        monthlyPerformance: client.monthlyPerformance,
        portfolio,
      }) as React.ReactElement<DocumentProps>
    )

    const uint8 = new Uint8Array(buffer)
    const filename = `clinch-report-${client.name.replace(/[^a-z0-9]/gi, '-').toLowerCase()}-march-2026.pdf`

    return new NextResponse(uint8, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Content-Length': uint8.byteLength.toString(),
        'Cache-Control': 'private, max-age=300',
      },
    })
  } catch (error) {
    console.error('[/api/reports/[id]/pdf] Error:', String(error), error instanceof Error ? error.stack : '')
    return NextResponse.json(
      { error: 'Failed to generate PDF' },
      { status: 500 }
    )
  }
}
