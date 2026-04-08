import { NextRequest, NextResponse } from "next/server";
import { authenticateRequest } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import ItemVersion from "@/models/ItemVersion";
import Item from "@/models/Item";

export async function GET(request: NextRequest, { params }: { params: Promise<{ itemId: string }> }) {
  const user = await authenticateRequest(request);
  if (!user) return NextResponse.json({ error: "Authentication required" }, { status: 401 });

  try {
    await connectDB();
    const { itemId } = await params;

    // Verify item belongs to user
    const item = await Item.findOne({ _id: itemId, user: user._id });
    if (!item) return NextResponse.json({ error: "Item not found" }, { status: 404 });

    const versions = await ItemVersion.find({ item: itemId })
      .sort({ version: -1 })
      .limit(20);

    return NextResponse.json(versions);
  } catch {
    return NextResponse.json({ error: "Failed to fetch versions" }, { status: 500 });
  }
}

// Restore a specific version
export async function POST(request: NextRequest, { params }: { params: Promise<{ itemId: string }> }) {
  const user = await authenticateRequest(request);
  if (!user) return NextResponse.json({ error: "Authentication required" }, { status: 401 });

  try {
    await connectDB();
    const { itemId } = await params;
    const { versionId } = await request.json();

    const item = await Item.findOne({ _id: itemId, user: user._id });
    if (!item) return NextResponse.json({ error: "Item not found" }, { status: 404 });

    const version = await ItemVersion.findOne({ _id: versionId, item: itemId });
    if (!version) return NextResponse.json({ error: "Version not found" }, { status: 404 });

    // Save current state as a new version before restoring
    const latestVersion = await ItemVersion.findOne({ item: itemId }).sort({ version: -1 });
    const nextVersion = (latestVersion?.version || 0) + 1;

    await ItemVersion.create({
      item: itemId,
      user: user._id,
      snapshot: item.toObject(),
      changeNote: "Auto-saved before restore",
      version: nextVersion,
    });

    // Restore the snapshot
    const snapshot = version.snapshot as Record<string, unknown>;
    const restoreFields = ["title", "description", "notes", "content", "tags", "summary", "keyPoints"];
    for (const field of restoreFields) {
      if (snapshot[field] !== undefined) {
        (item as unknown as Record<string, unknown>)[field] = snapshot[field];
      }
    }
    await item.save();

    return NextResponse.json({ message: "Version restored", item });
  } catch {
    return NextResponse.json({ error: "Failed to restore version" }, { status: 500 });
  }
}
