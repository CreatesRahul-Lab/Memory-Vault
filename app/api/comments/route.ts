import { NextRequest, NextResponse } from "next/server";
import { authenticateRequest } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import Comment from "@/models/Comment";

export async function GET(request: NextRequest) {
  const user = await authenticateRequest(request);
  if (!user) return NextResponse.json({ error: "Authentication required" }, { status: 401 });

  try {
    await connectDB();
    const itemId = request.nextUrl.searchParams.get("itemId");
    if (!itemId) return NextResponse.json({ error: "itemId required" }, { status: 400 });

    const comments = await Comment.find({ item: itemId })
      .populate("user", "name email")
      .sort({ createdAt: -1 });

    return NextResponse.json(comments);
  } catch {
    return NextResponse.json({ error: "Failed to fetch comments" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const user = await authenticateRequest(request);
  if (!user) return NextResponse.json({ error: "Authentication required" }, { status: 401 });

  try {
    await connectDB();
    const { itemId, text } = await request.json();

    if (!itemId || !text) return NextResponse.json({ error: "itemId and text required" }, { status: 400 });

    const comment = await Comment.create({ item: itemId, user: user._id, text });
    return NextResponse.json(comment, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Failed to create comment" }, { status: 500 });
  }
}
