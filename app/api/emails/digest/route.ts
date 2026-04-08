import { NextRequest, NextResponse } from "next/server";
import { authenticateRequest } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import Item from "@/models/Item";
import User from "@/models/User";
import { sendEmail } from "@/lib/email";
import { digestEmail, DigestData } from "@/lib/email-templates";

// POST /api/emails/digest — Send digest email to the authenticated user
export async function POST(request: NextRequest) {
  const user = await authenticateRequest(request);
  if (!user)
    return NextResponse.json({ error: "Authentication required" }, { status: 401 });

  try {
    await connectDB();

    const body = await request.json().catch(() => ({}));
    const period: "daily" | "weekly" =
      body.period === "weekly" ? "weekly" : "daily";

    const now = new Date();
    const since = new Date();
    if (period === "weekly") {
      since.setDate(since.getDate() - 7);
    } else {
      since.setDate(since.getDate() - 1);
    }

    const [recentItems, totalSaved, favoritedCount, tagAgg, reviewDue, tasksPending, resurfaced] =
      await Promise.all([
        Item.find({ user: user._id, createdAt: { $gte: since } })
          .sort({ createdAt: -1 })
          .limit(20)
          .select("title url domain type tags summary createdAt favorite")
          .lean(),

        Item.countDocuments({ user: user._id, createdAt: { $gte: since } }),

        Item.countDocuments({ user: user._id, createdAt: { $gte: since }, favorite: true }),

        Item.aggregate([
          { $match: { user: user._id, createdAt: { $gte: since } } },
          { $unwind: "$tags" },
          { $group: { _id: "$tags", count: { $sum: 1 } } },
          { $sort: { count: -1 } },
          { $limit: 10 },
        ]),

        Item.countDocuments({ user: user._id, nextReviewDate: { $lte: now, $ne: null } }),

        Item.countDocuments({ user: user._id, isTask: true, taskDone: false }),

        Item.aggregate([
          {
            $match: {
              user: user._id,
              createdAt: { $lte: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000) },
            },
          },
          { $sample: { size: 3 } },
          { $project: { title: 1, url: 1, domain: 1, type: 1, tags: 1, createdAt: 1 } },
        ]),
      ]);

    const digestData: DigestData = {
      userName: user.name,
      period,
      stats: { totalSaved, favoritedCount, reviewDue, tasksPending },
      topTags: tagAgg.map((t: { _id: string; count: number }) => ({
        tag: t._id,
        count: t.count,
      })),
      recentItems: recentItems.map((item: Record<string, unknown>) => ({
        title: item.title as string,
        url: item.url as string,
        domain: item.domain as string,
        type: item.type as string,
        tags: item.tags as string[],
        summary: item.summary as string,
      })),
      resurfaced: resurfaced.map((item: Record<string, unknown>) => ({
        title: item.title as string,
        url: item.url as string,
        domain: item.domain as string,
        type: item.type as string,
        tags: item.tags as string[],
      })),
    };

    const { subject, html } = digestEmail(digestData);
    await sendEmail({ to: user.email, subject, html });

    return NextResponse.json({ message: "Digest email sent!", period });
  } catch (err) {
    console.error("Digest email error:", err);
    return NextResponse.json({ error: "Failed to send digest email" }, { status: 500 });
  }
}

// GET /api/emails/digest/bulk — Send digest emails to ALL users who have it enabled
// Designed to be called by a cron job / scheduler
export async function GET(request: NextRequest) {
  const cronSecret = request.nextUrl.searchParams.get("secret");
  if (cronSecret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: "Invalid cron secret" }, { status: 403 });
  }

  try {
    await connectDB();
    const now = new Date();
    const currentHour = now.getUTCHours();

    // Find users whose digest is enabled and whose preferred hour matches
    const users = await User.find({
      digestFrequency: { $ne: "off" },
      digestHour: currentHour,
    });

    let sent = 0;
    let failed = 0;

    for (const user of users) {
      try {
        const period = user.digestFrequency as "daily" | "weekly";

        // For weekly digests, only send on Mondays
        if (period === "weekly" && now.getUTCDay() !== 1) continue;

        const since = new Date();
        if (period === "weekly") {
          since.setDate(since.getDate() - 7);
        } else {
          since.setDate(since.getDate() - 1);
        }

        const [recentItems, totalSaved, favoritedCount, tagAgg, reviewDue, tasksPending, resurfaced] =
          await Promise.all([
            Item.find({ user: user._id, createdAt: { $gte: since } })
              .sort({ createdAt: -1 })
              .limit(20)
              .select("title url domain type tags summary createdAt favorite")
              .lean(),
            Item.countDocuments({ user: user._id, createdAt: { $gte: since } }),
            Item.countDocuments({ user: user._id, createdAt: { $gte: since }, favorite: true }),
            Item.aggregate([
              { $match: { user: user._id, createdAt: { $gte: since } } },
              { $unwind: "$tags" },
              { $group: { _id: "$tags", count: { $sum: 1 } } },
              { $sort: { count: -1 } },
              { $limit: 10 },
            ]),
            Item.countDocuments({ user: user._id, nextReviewDate: { $lte: now, $ne: null } }),
            Item.countDocuments({ user: user._id, isTask: true, taskDone: false }),
            Item.aggregate([
              {
                $match: {
                  user: user._id,
                  createdAt: { $lte: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000) },
                },
              },
              { $sample: { size: 3 } },
              { $project: { title: 1, url: 1, domain: 1, type: 1, tags: 1, createdAt: 1 } },
            ]),
          ]);

        const digestData: DigestData = {
          userName: user.name,
          period,
          stats: { totalSaved, favoritedCount, reviewDue, tasksPending },
          topTags: tagAgg.map((t: { _id: string; count: number }) => ({ tag: t._id, count: t.count })),
          recentItems: recentItems.map((item: Record<string, unknown>) => ({
            title: item.title as string,
            url: item.url as string,
            domain: item.domain as string,
            type: item.type as string,
            tags: item.tags as string[],
            summary: item.summary as string,
          })),
          resurfaced: resurfaced.map((item: Record<string, unknown>) => ({
            title: item.title as string,
            url: item.url as string,
            domain: item.domain as string,
            type: item.type as string,
            tags: item.tags as string[],
          })),
        };

        const { subject, html } = digestEmail(digestData);
        await sendEmail({ to: user.email, subject, html });
        sent++;
      } catch (err) {
        console.error(`Failed to send digest to ${user.email}:`, err);
        failed++;
      }
    }

    return NextResponse.json({
      message: "Bulk digest complete",
      sent,
      failed,
      totalEligible: users.length,
    });
  } catch (err) {
    console.error("Bulk digest error:", err);
    return NextResponse.json({ error: "Failed to run bulk digest" }, { status: 500 });
  }
}
