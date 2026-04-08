import { NextRequest, NextResponse } from "next/server";
import { authenticateRequest } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import Item from "@/models/Item";

// SM-2 spaced repetition algorithm
function sm2(quality: number, easeFactor: number, interval: number, reviewCount: number) {
  let newEF = easeFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));
  if (newEF < 1.3) newEF = 1.3;

  let newInterval: number;
  if (quality < 3) {
    newInterval = 1; // Reset
  } else if (reviewCount === 0) {
    newInterval = 1;
  } else if (reviewCount === 1) {
    newInterval = 6;
  } else {
    newInterval = Math.round(interval * newEF);
  }

  return { easeFactor: newEF, interval: newInterval };
}

// GET: Get items due for review
export async function GET(request: NextRequest) {
  const user = await authenticateRequest(request);
  if (!user) return NextResponse.json({ error: "Authentication required" }, { status: 401 });

  try {
    await connectDB();
    const limit = parseInt(request.nextUrl.searchParams.get("limit") || "10");

    // Items due for review (nextReviewDate <= now)
    const dueItems = await Item.find({
      user: user._id,
      nextReviewDate: { $lte: new Date(), $ne: null },
    })
      .sort({ nextReviewDate: 1 })
      .limit(limit)
      .select("title url domain type tags summary keyPoints notes createdAt nextReviewDate reviewCount");

    // Random old items to resurface (items not reviewed, older than 7 days)
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const oldItems = await Item.aggregate([
      {
        $match: {
          user: user._id,
          nextReviewDate: null,
          createdAt: { $lte: sevenDaysAgo },
        },
      },
      { $sample: { size: 5 } },
      {
        $project: {
          title: 1, url: 1, domain: 1, type: 1, tags: 1, summary: 1, notes: 1, createdAt: 1,
        },
      },
    ]);

    return NextResponse.json({ dueItems, resurfaced: oldItems });
  } catch {
    return NextResponse.json({ error: "Failed to fetch review items" }, { status: 500 });
  }
}

// POST: Submit a review rating
export async function POST(request: NextRequest) {
  const user = await authenticateRequest(request);
  if (!user) return NextResponse.json({ error: "Authentication required" }, { status: 401 });

  try {
    await connectDB();
    const { itemId, quality } = await request.json();

    if (!itemId || quality === undefined) {
      return NextResponse.json({ error: "itemId and quality (0-5) required" }, { status: 400 });
    }

    const item = await Item.findOne({ _id: itemId, user: user._id });
    if (!item) return NextResponse.json({ error: "Item not found" }, { status: 404 });

    const result = sm2(quality, item.easeFactor, item.interval, item.reviewCount);

    item.easeFactor = result.easeFactor;
    item.interval = result.interval;
    item.reviewCount += 1;
    item.nextReviewDate = new Date(Date.now() + result.interval * 24 * 60 * 60 * 1000);
    await item.save();

    return NextResponse.json({
      nextReviewDate: item.nextReviewDate,
      interval: item.interval,
      reviewCount: item.reviewCount,
    });
  } catch {
    return NextResponse.json({ error: "Failed to submit review" }, { status: 500 });
  }
}
