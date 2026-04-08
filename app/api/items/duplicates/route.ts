import { NextRequest, NextResponse } from "next/server";
import { authenticateRequest } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import Item from "@/models/Item";
import { findDuplicates } from "@/lib/ai";

export async function GET(request: NextRequest) {
  const user = await authenticateRequest(request);
  if (!user) return NextResponse.json({ error: "Authentication required" }, { status: 401 });

  try {
    await connectDB();
    const url = request.nextUrl.searchParams.get("url") || "";
    const title = request.nextUrl.searchParams.get("title") || "";

    if (!url) return NextResponse.json({ error: "url required" }, { status: 400 });

    const existing = await Item.find({ user: user._id })
      .select("url title domain")
      .lean();

    const duplicates = findDuplicates(
      url,
      title,
      existing.map((i) => ({
        _id: String(i._id),
        url: i.url,
        title: i.title || "",
        domain: i.domain || "",
      }))
    );

    return NextResponse.json(duplicates);
  } catch {
    return NextResponse.json({ error: "Failed to check duplicates" }, { status: 500 });
  }
}
