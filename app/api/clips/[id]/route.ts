import { NextRequest, NextResponse } from "next/server";
import { authenticateRequest } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import ClipRule from "@/models/ClipRule";

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await authenticateRequest(request);
  if (!user) return NextResponse.json({ error: "Authentication required" }, { status: 401 });

  try {
    await connectDB();
    const { id } = await params;
    const body = await request.json();

    const rule = await ClipRule.findOneAndUpdate(
      { _id: id, user: user._id },
      { $set: body },
      { new: true }
    );
    if (!rule) return NextResponse.json({ error: "Rule not found" }, { status: 404 });
    return NextResponse.json(rule);
  } catch {
    return NextResponse.json({ error: "Failed to update rule" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await authenticateRequest(request);
  if (!user) return NextResponse.json({ error: "Authentication required" }, { status: 401 });

  try {
    await connectDB();
    const { id } = await params;
    const rule = await ClipRule.findOneAndDelete({ _id: id, user: user._id });
    if (!rule) return NextResponse.json({ error: "Rule not found" }, { status: 404 });
    return NextResponse.json({ message: "Rule deleted" });
  } catch {
    return NextResponse.json({ error: "Failed to delete rule" }, { status: 500 });
  }
}
