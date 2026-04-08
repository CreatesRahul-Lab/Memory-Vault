import { NextRequest, NextResponse } from "next/server";
import { authenticateRequest } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import Item from "@/models/Item";

export async function GET(request: NextRequest) {
  const user = await authenticateRequest(request);
  if (!user) return NextResponse.json({ error: "Authentication required" }, { status: 401 });

  try {
    await connectDB();
    const itemId = request.nextUrl.searchParams.get("itemId");
    if (!itemId) return NextResponse.json({ error: "itemId required" }, { status: 400 });

    const item = await Item.findOne({ _id: itemId, user: user._id });
    if (!item) return NextResponse.json({ error: "Item not found" }, { status: 404 });

    const allTags = [...item.tags, ...item.aiTags];
    const conditions: Record<string, unknown>[] = [];

    if (allTags.length > 0) {
      conditions.push({ tags: { $in: allTags } });
      conditions.push({ aiTags: { $in: allTags } });
    }
    if (item.domain) {
      conditions.push({ domain: item.domain });
    }

    let related;
    if (conditions.length > 0) {
      related = await Item.find({
        user: user._id,
        _id: { $ne: item._id },
        $or: conditions,
      })
        .sort({ createdAt: -1 })
        .limit(6)
        .select("title url domain type tags favicon createdAt");
    } else {
      // Fallback: same type, recent
      related = await Item.find({
        user: user._id,
        _id: { $ne: item._id },
        type: item.type,
      })
        .sort({ createdAt: -1 })
        .limit(6)
        .select("title url domain type tags favicon createdAt");
    }

    return NextResponse.json(related);
  } catch {
    return NextResponse.json({ error: "Failed to find related items" }, { status: 500 });
  }
}
