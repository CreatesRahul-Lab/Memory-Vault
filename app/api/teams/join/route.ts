import { NextRequest, NextResponse } from "next/server";
import { authenticateRequest } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import TeamSpace from "@/models/TeamSpace";

export async function POST(request: NextRequest) {
  const user = await authenticateRequest(request);
  if (!user) return NextResponse.json({ error: "Authentication required" }, { status: 401 });

  try {
    await connectDB();
    const { inviteCode } = await request.json();

    if (!inviteCode) return NextResponse.json({ error: "Invite code required" }, { status: 400 });

    const team = await TeamSpace.findOne({ inviteCode });
    if (!team) return NextResponse.json({ error: "Invalid invite code" }, { status: 404 });

    const alreadyMember = team.members.some((m) => String(m.user) === String(user._id));
    if (alreadyMember) {
      return NextResponse.json({ error: "Already a member", teamId: team._id }, { status: 400 });
    }

    team.members.push({ user: user._id, role: "viewer", joinedAt: new Date() });
    await team.save();

    return NextResponse.json({ message: "Joined team", teamId: team._id });
  } catch {
    return NextResponse.json({ error: "Failed to join team" }, { status: 500 });
  }
}
