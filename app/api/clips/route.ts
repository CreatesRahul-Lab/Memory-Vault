import { NextRequest, NextResponse } from "next/server";
import { authenticateRequest } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import ClipRule from "@/models/ClipRule";

export async function GET(request: NextRequest) {
  const user = await authenticateRequest(request);
  if (!user) return NextResponse.json({ error: "Authentication required" }, { status: 401 });

  try {
    await connectDB();
    const rules = await ClipRule.find({ user: user._id }).sort({ createdAt: -1 });
    return NextResponse.json(rules);
  } catch {
    return NextResponse.json({ error: "Failed to fetch clip rules" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const user = await authenticateRequest(request);
  if (!user) return NextResponse.json({ error: "Authentication required" }, { status: 401 });

  try {
    await connectDB();
    const { name, pattern, matchType, autoTags, autoCollection, captureFullPage } = await request.json();

    if (!name || !pattern) {
      return NextResponse.json({ error: "name and pattern required" }, { status: 400 });
    }

    const rule = await ClipRule.create({
      user: user._id,
      name,
      pattern,
      matchType: matchType || "domain",
      autoTags: autoTags || [],
      autoCollection: autoCollection || null,
      captureFullPage: captureFullPage || false,
    });

    return NextResponse.json(rule, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Failed to create clip rule" }, { status: 500 });
  }
}
