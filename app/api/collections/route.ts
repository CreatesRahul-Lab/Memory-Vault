import { NextRequest, NextResponse } from "next/server";
import { authenticateRequest } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import Collection from "@/models/Collection";
import Item from "@/models/Item";

export async function GET(request: NextRequest) {
  const user = await authenticateRequest(request);
  if (!user) return NextResponse.json({ error: "Authentication required" }, { status: 401 });

  try {
    await connectDB();
    const collections = await Collection.find({
      $or: [{ user: user._id }, { "collaborators.user": user._id }],
    }).sort({ createdAt: -1 }).lean();

    // Get item counts
    const withCounts = await Promise.all(
      collections.map(async (c) => {
        const count = await Item.countDocuments({ user: user._id, collection: c._id });
        return { ...c, itemCount: count };
      })
    );

    return NextResponse.json(withCounts);
  } catch {
    return NextResponse.json({ error: "Failed to fetch collections" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const user = await authenticateRequest(request);
  if (!user) return NextResponse.json({ error: "Authentication required" }, { status: 401 });

  try {
    await connectDB();
    const { name, description, color, icon, savedFilter } = await request.json();

    if (!name) return NextResponse.json({ error: "Name is required" }, { status: 400 });

    const collection = await Collection.create({
      user: user._id,
      name,
      description: description || "",
      color: color || "#e8b931",
      icon: icon || "folder",
      savedFilter: savedFilter || null,
    });

    return NextResponse.json(collection, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Failed to create collection" }, { status: 500 });
  }
}
