import { NextRequest, NextResponse } from "next/server";
import { authenticateRequest } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import Item from "@/models/Item";
import { generateSummary, extractKeyPoints, generateTags } from "@/lib/ai";

export async function POST(request: NextRequest) {
  const user = await authenticateRequest(request);
  if (!user) return NextResponse.json({ error: "Authentication required" }, { status: 401 });

  try {
    await connectDB();
    const { itemId } = await request.json();

    if (!itemId) return NextResponse.json({ error: "itemId is required" }, { status: 400 });

    const item = await Item.findOne({ _id: itemId, user: user._id });
    if (!item) return NextResponse.json({ error: "Item not found" }, { status: 404 });

    const text = [item.title, item.description, item.content, item.notes].filter(Boolean).join(". ");

    const summary = generateSummary(text);
    const keyPoints = extractKeyPoints(text);
    const aiTags = generateTags(text, item.tags);

    item.summary = summary;
    item.keyPoints = keyPoints;
    item.aiTags = aiTags;
    await item.save();

    return NextResponse.json({ summary, keyPoints, aiTags });
  } catch {
    return NextResponse.json({ error: "Failed to summarize" }, { status: 500 });
  }
}
