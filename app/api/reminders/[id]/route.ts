import { NextRequest, NextResponse } from "next/server";
import { authenticateRequest } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import Reminder from "@/models/Reminder";

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await authenticateRequest(request);
  if (!user) return NextResponse.json({ error: "Authentication required" }, { status: 401 });

  try {
    await connectDB();
    const { id } = await params;
    const reminder = await Reminder.findOneAndDelete({ _id: id, user: user._id });
    if (!reminder) return NextResponse.json({ error: "Reminder not found" }, { status: 404 });
    return NextResponse.json({ message: "Reminder deleted" });
  } catch {
    return NextResponse.json({ error: "Failed to delete reminder" }, { status: 500 });
  }
}
