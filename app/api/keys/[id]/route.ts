import { NextRequest, NextResponse } from "next/server";
import { authenticateRequest } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import ApiKey from "@/models/ApiKey";

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await authenticateRequest(request);
  if (!user) return NextResponse.json({ error: "Authentication required" }, { status: 401 });

  try {
    await connectDB();
    const { id } = await params;
    const key = await ApiKey.findOne({ _id: id, user: user._id });
    if (!key) return NextResponse.json({ error: "API key not found" }, { status: 404 });

    key.active = !key.active;
    await key.save();
    return NextResponse.json({ _id: key._id, active: key.active });
  } catch {
    return NextResponse.json({ error: "Failed to update API key" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await authenticateRequest(request);
  if (!user) return NextResponse.json({ error: "Authentication required" }, { status: 401 });

  try {
    await connectDB();
    const { id } = await params;
    const key = await ApiKey.findOneAndDelete({ _id: id, user: user._id });
    if (!key) return NextResponse.json({ error: "API key not found" }, { status: 404 });
    return NextResponse.json({ message: "API key deleted" });
  } catch {
    return NextResponse.json({ error: "Failed to delete API key" }, { status: 500 });
  }
}
