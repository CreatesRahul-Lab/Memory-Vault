import { NextRequest, NextResponse } from "next/server";
import { authenticateRequest } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import Item from "@/models/Item";

export async function GET(request: NextRequest) {
  const user = await authenticateRequest(request);
  if (!user) return NextResponse.json({ error: "Authentication required" }, { status: 401 });

  try {
    await connectDB();
    const period = request.nextUrl.searchParams.get("period") || "daily";

    const now = new Date();
    const since = new Date();
    if (period === "weekly") {
      since.setDate(since.getDate() - 7);
    } else {
      since.setDate(since.getDate() - 1);
    }

    // Recent saves
    const recentItems = await Item.find({
      user: user._id,
      createdAt: { $gte: since },
    })
      .sort({ createdAt: -1 })
      .limit(20)
      .select("title url domain type tags summary createdAt favorite");

    // Stats for the period
    const totalSaved = await Item.countDocuments({
      user: user._id,
      createdAt: { $gte: since },
    });

    const favoritedCount = await Item.countDocuments({
      user: user._id,
      createdAt: { $gte: since },
      favorite: true,
    });

    // Top tags in the period
    const tagAgg = await Item.aggregate([
      { $match: { user: user._id, createdAt: { $gte: since } } },
      { $unwind: "$tags" },
      { $group: { _id: "$tags", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 },
    ]);

    // Items due for review
    const reviewDue = await Item.countDocuments({
      user: user._id,
      nextReviewDate: { $lte: now, $ne: null },
    });

    // Tasks pending
    const tasksPending = await Item.countDocuments({
      user: user._id,
      isTask: true,
      taskDone: false,
    });

    // Random resurface item
    const resurfaced = await Item.aggregate([
      {
        $match: {
          user: user._id,
          createdAt: { $lte: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000) },
        },
      },
      { $sample: { size: 3 } },
      { $project: { title: 1, url: 1, domain: 1, type: 1, tags: 1, createdAt: 1 } },
    ]);

    return NextResponse.json({
      period,
      since: since.toISOString(),
      stats: { totalSaved, favoritedCount, reviewDue, tasksPending },
      topTags: tagAgg.map((t: { _id: string; count: number }) => ({ tag: t._id, count: t.count })),
      recentItems,
      resurfaced,
    });
  } catch {
    return NextResponse.json({ error: "Failed to generate digest" }, { status: 500 });
  }
}
