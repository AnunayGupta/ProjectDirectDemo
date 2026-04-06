import { NextResponse } from "next/server";
import { kv, STRATEGY_KEY } from "@/lib/kv";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ firmId: string; id: string }> }
) {
  try {
    const { id } = await params;
    const strategy = await kv.get(STRATEGY_KEY(id));
    if (!strategy) return NextResponse.json({ error: "Strategy not found" }, { status: 404 });
    return NextResponse.json(strategy);
  } catch {
    return NextResponse.json({ error: "Failed to fetch strategy" }, { status: 500 });
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ firmId: string; id: string }> }
) {
  try {
    const { firmId, id } = await params;
    const existing = await kv.get(STRATEGY_KEY(id));
    if (!existing) return NextResponse.json({ error: "Strategy not found" }, { status: 404 });
    const body = await request.json();
    const updated = { ...(existing as object), ...body, id, firmId };
    await kv.set(STRATEGY_KEY(id), updated);
    return NextResponse.json(updated);
  } catch {
    return NextResponse.json({ error: "Failed to update strategy" }, { status: 500 });
  }
}
