import { NextRequest, NextResponse } from "next/server";
import { authenticateRequest } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import Item from "@/models/Item";

export async function GET(request: NextRequest) {
  const user = await authenticateRequest(request);
  if (!user) return NextResponse.json({ error: "Authentication required" }, { status: 401 });

  try {
    await connectDB();
    const userId = user._id;

    const [total, favorites, typeCounts] = await Promise.all([
      Item.countDocuments({ user: userId }),
      Item.countDocuments({ user: userId, favorite: true }),
      Item.aggregate([
        { $match: { user: userId } },
        { $group: { _id: "$type", count: { $sum: 1 } } },
      ]),
    ]);

    const types: Record<string, number> = {};
    typeCounts.forEach((t: { _id: string; count: number }) => (types[t._id] = t.count));

    return NextResponse.json({ total, favorites, types });
  } catch {
    return NextResponse.json({ error: "Failed to fetch stats" }, { status: 500 });
  }
}
