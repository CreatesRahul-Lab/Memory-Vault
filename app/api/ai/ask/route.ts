import { NextRequest, NextResponse } from "next/server";
import { authenticateRequest } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import Item from "@/models/Item";
import { answerQuestion } from "@/lib/ai";

export async function POST(request: NextRequest) {
  const user = await authenticateRequest(request);
  if (!user) return NextResponse.json({ error: "Authentication required" }, { status: 401 });

  try {
    await connectDB();
    const { question } = await request.json();

    if (!question) return NextResponse.json({ error: "question is required" }, { status: 400 });

    // Get all user items (limit to 500 for performance)
    const items = await Item.find({ user: user._id })
      .select("title content notes summary url")
      .sort({ createdAt: -1 })
      .limit(500)
      .lean();

    const result = answerQuestion(
      question,
      items.map((i) => ({
        title: i.title || "",
        content: i.content || "",
        notes: i.notes || "",
        summary: i.summary || "",
        url: i.url,
      }))
    );

    return NextResponse.json(result);
  } catch {
    return NextResponse.json({ error: "Failed to answer question" }, { status: 500 });
  }
}
