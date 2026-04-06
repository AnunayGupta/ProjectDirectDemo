import { NextResponse } from "next/server";
import { kv, STRATEGY_KEY, STRATEGIES_INDEX_KEY } from "@/lib/kv";
import { MOCK_STRATEGIES } from "@/lib/mock-data";

async function seedIfEmpty(firmId: string) {
  const key = STRATEGIES_INDEX_KEY(firmId);
  const count = await kv.zcard(key);
  if (count === 0) {
    const firmStrategies = MOCK_STRATEGIES.filter((s) => s.firmId === firmId);
    for (const s of firmStrategies) {
      await kv.set(STRATEGY_KEY(s.id), s);
      await kv.zadd(key, { score: Date.now(), member: s.id });
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
    const ids = await kv.zrange(STRATEGIES_INDEX_KEY(firmId), 0, -1);
    if (!ids.length) return NextResponse.json([]);
    const strategies = await Promise.all(
      ids.map((id) => kv.get(STRATEGY_KEY(id as string)))
    );
    return NextResponse.json(strategies.filter(Boolean));
  } catch {
    return NextResponse.json(MOCK_STRATEGIES);
  }
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ firmId: string }> }
) {
  try {
    const { firmId } = await params;
    const body = await request.json();
    const id = `strategy-${Date.now()}`;
    const strategy = {
      ...body,
      id,
      firmId,
      createdAt: new Date().toISOString(),
      lastRebalanced: new Date().toISOString(),
      subscribers: 0,
      aum: 0,
      ytdPerformance: 0,
    };
    await kv.set(STRATEGY_KEY(id), strategy);
    await kv.zadd(STRATEGIES_INDEX_KEY(firmId), { score: Date.now(), member: id });
    return NextResponse.json(strategy, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Failed to create strategy" }, { status: 500 });
  }
}
