import { NextRequest, NextResponse } from "next/server";
import { authenticateRequest } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import Comment from "@/models/Comment";

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await authenticateRequest(request);
  if (!user) return NextResponse.json({ error: "Authentication required" }, { status: 401 });

  try {
    await connectDB();
    const { id } = await params;
    const comment = await Comment.findOneAndDelete({ _id: id, user: user._id });
    if (!comment) return NextResponse.json({ error: "Comment not found" }, { status: 404 });
    return NextResponse.json({ message: "Comment deleted" });
  } catch {
    return NextResponse.json({ error: "Failed to delete comment" }, { status: 500 });
  }
}
