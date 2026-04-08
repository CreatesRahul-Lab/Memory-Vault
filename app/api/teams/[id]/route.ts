import { NextRequest, NextResponse } from "next/server";
import { authenticateRequest } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import TeamSpace from "@/models/TeamSpace";
import Collection from "@/models/Collection";

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await authenticateRequest(request);
  if (!user) return NextResponse.json({ error: "Authentication required" }, { status: 401 });

  try {
    await connectDB();
    const { id } = await params;

    const team = await TeamSpace.findOne({
      _id: id,
      $or: [{ owner: user._id }, { "members.user": user._id }],
    })
      .populate("owner", "name email")
      .populate("members.user", "name email");

    if (!team) return NextResponse.json({ error: "Team not found" }, { status: 404 });

    const collections = await Collection.find({ _id: { $in: team.collections } });

    return NextResponse.json({ team, collections });
  } catch {
    return NextResponse.json({ error: "Failed to fetch team" }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await authenticateRequest(request);
  if (!user) return NextResponse.json({ error: "Authentication required" }, { status: 401 });

  try {
    await connectDB();
    const { id } = await params;
    const body = await request.json();

    const team = await TeamSpace.findOne({ _id: id, owner: user._id });
    if (!team) return NextResponse.json({ error: "Team not found or not owner" }, { status: 404 });

    const allowed = ["name", "description", "color", "isPublic"];
    for (const key of allowed) {
      if (body[key] !== undefined) {
        (team as unknown as Record<string, unknown>)[key] = body[key];
      }
    }

    // Add collections to team
    if (body.addCollection) {
      if (!team.collections.includes(body.addCollection)) {
        team.collections.push(body.addCollection);
      }
    }
    if (body.removeCollection) {
      team.collections = team.collections.filter(
        (c) => String(c) !== body.removeCollection
      );
    }

    await team.save();
    return NextResponse.json(team);
  } catch {
    return NextResponse.json({ error: "Failed to update team" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await authenticateRequest(request);
  if (!user) return NextResponse.json({ error: "Authentication required" }, { status: 401 });

  try {
    await connectDB();
    const { id } = await params;

    const team = await TeamSpace.findOneAndDelete({ _id: id, owner: user._id });
    if (!team) return NextResponse.json({ error: "Team not found or not owner" }, { status: 404 });

    return NextResponse.json({ message: "Team deleted" });
  } catch {
    return NextResponse.json({ error: "Failed to delete team" }, { status: 500 });
  }
}
