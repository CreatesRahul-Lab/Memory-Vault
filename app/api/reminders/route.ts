import { NextRequest, NextResponse } from "next/server";
import { authenticateRequest } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import Reminder from "@/models/Reminder";

export async function GET(request: NextRequest) {
  const user = await authenticateRequest(request);
  if (!user) return NextResponse.json({ error: "Authentication required" }, { status: 401 });

  try {
    await connectDB();
    const upcoming = request.nextUrl.searchParams.get("upcoming") === "true";

    const filter: Record<string, unknown> = { user: user._id };
    if (upcoming) {
      filter.fired = false;
      filter.triggerAt = { $gte: new Date() };
    }

    const reminders = await Reminder.find(filter)
      .populate("item", "title url type")
      .sort({ triggerAt: 1 })
      .limit(50);

    // Check for due reminders and mark them
    const now = new Date();
    const due = await Reminder.find({
      user: user._id,
      fired: false,
      triggerAt: { $lte: now },
    }).populate("item", "title url type");

    // Mark due reminders as fired
    if (due.length > 0) {
      await Reminder.updateMany(
        { _id: { $in: due.map((d) => d._id) } },
        { $set: { fired: true } }
      );
    }

    return NextResponse.json({ reminders, due });
  } catch {
    return NextResponse.json({ error: "Failed to fetch reminders" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const user = await authenticateRequest(request);
  if (!user) return NextResponse.json({ error: "Authentication required" }, { status: 401 });

  try {
    await connectDB();
    const { itemId, triggerAt, message } = await request.json();

    if (!itemId || !triggerAt) return NextResponse.json({ error: "itemId and triggerAt required" }, { status: 400 });

    const reminder = await Reminder.create({
      user: user._id,
      item: itemId,
      triggerAt: new Date(triggerAt),
      message: message || "",
    });

    return NextResponse.json(reminder, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Failed to create reminder" }, { status: 500 });
  }
}
