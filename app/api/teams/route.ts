import { NextRequest, NextResponse } from "next/server";
import { authenticateRequest } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import TeamSpace from "@/models/TeamSpace";
import { v4 as uuidv4 } from "uuid";

export async function GET(request: NextRequest) {
  const user = await authenticateRequest(request);
  if (!user) return NextResponse.json({ error: "Authentication required" }, { status: 401 });

  try {
    await connectDB();

    const teams = await TeamSpace.find({
      $or: [{ owner: user._id }, { "members.user": user._id }],
    })
      .populate("owner", "name email")
      .populate("members.user", "name email")
      .sort({ updatedAt: -1 });

    return NextResponse.json(teams);
  } catch {
    return NextResponse.json({ error: "Failed to fetch teams" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const user = await authenticateRequest(request);
  if (!user) return NextResponse.json({ error: "Authentication required" }, { status: 401 });

  try {
    await connectDB();
    const { name, description, color } = await request.json();

    if (!name?.trim()) {
      return NextResponse.json({ error: "Team name is required" }, { status: 400 });
    }

    const team = await TeamSpace.create({
      name: name.trim(),
      description: description || "",
      color: color || "#e8b931",
      owner: user._id,
      members: [{ user: user._id, role: "admin" }],
      inviteCode: uuidv4().slice(0, 8),
    });

    return NextResponse.json(team, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Failed to create team" }, { status: 500 });
  }
}
