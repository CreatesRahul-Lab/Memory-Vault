import { NextRequest, NextResponse } from "next/server";
import { authenticateRequest } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import Item from "@/models/Item";

export async function GET(request: NextRequest) {
  const user = await authenticateRequest(request);
  if (!user) return NextResponse.json({ error: "Authentication required" }, { status: 401 });

  try {
    await connectDB();
    const params = request.nextUrl.searchParams;
    const search = params.get("search");
    const type = params.get("type");
    const tag = params.get("tag");
    const page = parseInt(params.get("page") || "1", 10);
    const limit = Math.min(parseInt(params.get("limit") || "20", 10), 50);

    const filter: Record<string, unknown> = {};
    if (search) filter.$text = { $search: search };
    if (type) filter.type = type;
    if (tag) filter.tags = tag.toLowerCase();

    const skip = (Math.max(page, 1) - 1) * Math.max(limit, 1);

    const [items, total] = await Promise.all([
      Item.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .select("url title description domain favicon type tags createdAt"),
      Item.countDocuments(filter),
    ]);

    return NextResponse.json({
      items,
      total,
      page,
      pages: Math.ceil(total / limit),
    });
  } catch {
    return NextResponse.json({ error: "Failed to fetch feed" }, { status: 500 });
  }
}
