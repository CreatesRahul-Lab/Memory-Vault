import { NextRequest, NextResponse } from "next/server";
import { authenticateRequest } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import Item from "@/models/Item";
import Collection from "@/models/Collection";

export async function GET(request: NextRequest) {
  const user = await authenticateRequest(request);
  if (!user) return NextResponse.json({ error: "Authentication required" }, { status: 401 });

  try {
    await connectDB();
    const userId = user._id;

    const [
      total,
      favorites,
      typeCounts,
      tags,
      recentItems,
      collections,
    ] = await Promise.all([
      Item.countDocuments({ user: userId }),
      Item.countDocuments({ user: userId, favorite: true }),
      Item.aggregate([
        { $match: { user: userId } },
        { $group: { _id: "$type", count: { $sum: 1 } } },
      ]),
      Item.aggregate([
        { $match: { user: userId } },
        { $unwind: "$tags" },
        { $group: { _id: "$tags", count: { $sum: 1 } } },
        { $sort: { count: -1 } },
      ]),
      Item.find({ user: userId }).sort({ createdAt: -1 }).limit(5).lean(),
      Collection.find({
        $or: [{ user: userId }, { "collaborators.user": userId }],
      }).sort({ createdAt: -1 }).lean(),
    ]);

    const types: Record<string, number> = {};
    typeCounts.forEach((t: { _id: string; count: number }) => (types[t._id] = t.count));

    // Get collection item counts in parallel
    const collectionsWithCounts = await Promise.all(
      collections.map(async (c) => {
        const count = await Item.countDocuments({ user: userId, collection: c._id });
        return { ...c, itemCount: count };
      })
    );

    return NextResponse.json({
      user: { name: user.name, email: user.email },
      stats: { total, favorites, types },
      tags: tags.map((t: { _id: string; count: number }) => ({ tag: t._id, count: t.count })),
      recentItems,
      collections: collectionsWithCounts,
    });
  } catch {
    return NextResponse.json({ error: "Failed to fetch dashboard data" }, { status: 500 });
  }
}
