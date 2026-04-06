import { NextResponse } from "next/server";
import { kv, BROADCAST_KEY, BROADCASTS_INDEX_KEY } from "@/lib/kv";
import { MOCK_BROADCASTS } from "@/lib/mock-data";

async function seedIfEmpty(firmId: string) {
  const key = BROADCASTS_INDEX_KEY(firmId);
  const count = await kv.llen(key);
  if (count === 0) {
    const firmBroadcasts = MOCK_BROADCASTS.filter((b) => b.firmId === firmId);
    for (const b of firmBroadcasts) {
      await kv.set(BROADCAST_KEY(b.id), b);
      await kv.lpush(key, b.id);
    }
  }
}

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ firmId: string }> }
) {
  try {
    const { firmId } = await params;
    await seedIfEmpty(firmId);
    const ids = await kv.lrange(BROADCASTS_INDEX_KEY(firmId), 0, -1);
    if (!ids.length) return NextResponse.json([]);
    const broadcasts = await Promise.all(
      ids.map((id) => kv.get(BROADCAST_KEY(id as string)))
    );
    return NextResponse.json(broadcasts.filter(Boolean));
  } catch {
    return NextResponse.json(MOCK_BROADCASTS);
  }
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ firmId: string }> }
) {
  try {
    const { firmId } = await params;
    const body = await request.json();
    const id = `broadcast-${Date.now()}`;
    const broadcast = {
      ...body,
      id,
      firmId,
      createdAt: new Date().toISOString(),
      readCount: 0,
    };
    await kv.set(BROADCAST_KEY(id), broadcast);
    await kv.lpush(BROADCASTS_INDEX_KEY(firmId), id);
    return NextResponse.json(broadcast, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Failed to create broadcast" }, { status: 500 });
  }
}
