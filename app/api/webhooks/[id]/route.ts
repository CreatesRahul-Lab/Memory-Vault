import { NextRequest, NextResponse } from "next/server";
import { authenticateRequest } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import Webhook from "@/models/Webhook";

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await authenticateRequest(request);
  if (!user) return NextResponse.json({ error: "Authentication required" }, { status: 401 });

  try {
    await connectDB();
    const { id } = await params;
    const body = await request.json();

    const webhook = await Webhook.findOneAndUpdate(
      { _id: id, user: user._id },
      { $set: body },
      { new: true }
    );
    if (!webhook) return NextResponse.json({ error: "Webhook not found" }, { status: 404 });
    return NextResponse.json(webhook);
  } catch {
    return NextResponse.json({ error: "Failed to update webhook" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await authenticateRequest(request);
  if (!user) return NextResponse.json({ error: "Authentication required" }, { status: 401 });

  try {
    await connectDB();
    const { id } = await params;
    const webhook = await Webhook.findOneAndDelete({ _id: id, user: user._id });
    if (!webhook) return NextResponse.json({ error: "Webhook not found" }, { status: 404 });
    return NextResponse.json({ message: "Webhook deleted" });
  } catch {
    return NextResponse.json({ error: "Failed to delete webhook" }, { status: 500 });
  }
}
