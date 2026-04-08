import { NextRequest, NextResponse } from "next/server";
import { authenticateRequest } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import TeamSpace from "@/models/TeamSpace";
import User from "@/models/User";

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await authenticateRequest(request);
  if (!user) return NextResponse.json({ error: "Authentication required" }, { status: 401 });

  try {
    await connectDB();
    const { id } = await params;
    const { email, role } = await request.json();

    const team = await TeamSpace.findOne({ _id: id, owner: user._id });
    if (!team) return NextResponse.json({ error: "Team not found or not owner" }, { status: 404 });

    const memberUser = await User.findOne({ email });
    if (!memberUser) return NextResponse.json({ error: "User not found" }, { status: 404 });

    const existing = team.members.find((m) => String(m.user) === String(memberUser._id));
    if (existing) {
      existing.role = role || "viewer";
    } else {
      team.members.push({ user: memberUser._id, role: role || "viewer", joinedAt: new Date() });
    }

    await team.save();
    return NextResponse.json({ message: "Member added" });
  } catch {
    return NextResponse.json({ error: "Failed to add member" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await authenticateRequest(request);
  if (!user) return NextResponse.json({ error: "Authentication required" }, { status: 401 });

  try {
    await connectDB();
    const { id } = await params;
    const { userId } = await request.json();

    const team = await TeamSpace.findOne({ _id: id, owner: user._id });
    if (!team) return NextResponse.json({ error: "Team not found or not owner" }, { status: 404 });

    if (String(userId) === String(user._id)) {
      return NextResponse.json({ error: "Cannot remove yourself as owner" }, { status: 400 });
    }

    team.members = team.members.filter((m) => String(m.user) !== String(userId));
    await team.save();

    return NextResponse.json({ message: "Member removed" });
  } catch {
    return NextResponse.json({ error: "Failed to remove member" }, { status: 500 });
  }
}
