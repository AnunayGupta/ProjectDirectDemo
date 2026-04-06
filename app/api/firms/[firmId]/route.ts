import { NextResponse } from "next/server";
import { kv, FIRM_KEY } from "@/lib/kv";
import { MOCK_FIRM } from "@/lib/mock-data";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ firmId: string }> }
) {
  try {
    const { firmId } = await params;
    const firm = await kv.get(FIRM_KEY(firmId));
    if (!firm) return NextResponse.json({ error: "Firm not found" }, { status: 404 });
    return NextResponse.json(firm);
  } catch {
    return NextResponse.json(MOCK_FIRM);
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ firmId: string }> }
) {
  try {
    const { firmId } = await params;
    const body = await request.json();
    const existing = await kv.get(FIRM_KEY(firmId));
    const updated = { ...(existing ?? MOCK_FIRM), ...body, id: firmId };
    await kv.set(FIRM_KEY(firmId), updated);
    return NextResponse.json(updated);
  } catch {
    return NextResponse.json({ error: "Failed to update firm" }, { status: 500 });
  }
}
