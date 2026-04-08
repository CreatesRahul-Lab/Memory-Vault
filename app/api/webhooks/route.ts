import { NextRequest, NextResponse } from "next/server";
import { authenticateRequest } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import Webhook from "@/models/Webhook";
import crypto from "crypto";

export async function GET(request: NextRequest) {
  const user = await authenticateRequest(request);
  if (!user) return NextResponse.json({ error: "Authentication required" }, { status: 401 });

  try {
    await connectDB();
    const webhooks = await Webhook.find({ user: user._id }).sort({ createdAt: -1 });
    return NextResponse.json(webhooks);
  } catch {
    return NextResponse.json({ error: "Failed to fetch webhooks" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const user = await authenticateRequest(request);
  if (!user) return NextResponse.json({ error: "Authentication required" }, { status: 401 });

  try {
    await connectDB();
    const { name, url, events } = await request.json();

    if (!name || !url || !events?.length) {
      return NextResponse.json({ error: "name, url, and events required" }, { status: 400 });
    }

    const secret = crypto.randomBytes(32).toString("hex");

    const webhook = await Webhook.create({
      user: user._id,
      name,
      url,
      events,
      secret,
    });

    return NextResponse.json({ ...webhook.toObject(), secret }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Failed to create webhook" }, { status: 500 });
  }
}
