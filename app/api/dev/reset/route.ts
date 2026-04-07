import { NextResponse } from 'next/server'
import { kv } from '@/lib/kv'
import { CLIENTS } from '@/lib/seed-data'

export async function POST() {
  if (process.env.NODE_ENV !== 'development') {
    return NextResponse.json({ error: 'Only allowed in development' }, { status: 403 })
  }

  if (process.env.KV_REST_API_URL) {
    try {
      // Iterate over all seed clients and wipe their drafts and history
      for (const client of CLIENTS) {
        await kv.del(`draft:${client.id}`)
        await kv.del(`history:${client.id}`)
        await kv.del(`reviewed:${client.id}`)
      }
      await kv.del('demo:clients')
      return NextResponse.json({ message: 'State successfully reset.' })
    } catch (e: any) {
      return NextResponse.json({ error: 'Failed to clear KV store', details: e.message }, { status: 500 })
    }
  }

  return NextResponse.json({ error: 'KV not configured' }, { status: 500 })
}
