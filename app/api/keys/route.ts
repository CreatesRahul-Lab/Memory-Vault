import { NextRequest, NextResponse } from "next/server";
import { authenticateRequest } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import ApiKey from "@/models/ApiKey";

export async function GET(request: NextRequest) {
  const user = await authenticateRequest(request);
  if (!user) return NextResponse.json({ error: "Authentication required" }, { status: 401 });

  try {
    await connectDB();
    const keys = await ApiKey.find({ user: user._id }).sort({ createdAt: -1 });

    const masked = keys.map((k) => ({
      _id: k._id,
      name: k.name,
      key: k.key.slice(0, 8) + "..." + k.key.slice(-4),
      fullKey: k.key,
      active: k.active,
      lastUsed: k.lastUsed,
      createdAt: k.createdAt,
    }));

    return NextResponse.json(masked);
  } catch {
    return NextResponse.json({ error: "Failed to fetch API keys" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const user = await authenticateRequest(request);
  if (!user) return NextResponse.json({ error: "Authentication required" }, { status: 401 });

  try {
    await connectDB();
    const { name } = await request.json();
    if (!name) return NextResponse.json({ error: "Key name is required" }, { status: 400 });

    const apiKey = await ApiKey.generate(user._id.toString(), name);

    return NextResponse.json(
      { _id: apiKey._id, name: apiKey.name, key: apiKey.key, active: apiKey.active, createdAt: apiKey.createdAt },
      { status: 201 }
    );
  } catch {
    return NextResponse.json({ error: "Failed to create API key" }, { status: 500 });
  }
}
