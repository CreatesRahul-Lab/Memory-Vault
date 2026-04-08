import { NextRequest, NextResponse } from "next/server";
import { authenticateRequest } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import Item from "@/models/Item";
import ItemVersion from "@/models/ItemVersion";
import { triggerWebhooks } from "@/lib/webhooks";

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await authenticateRequest(request);
  if (!user) return NextResponse.json({ error: "Authentication required" }, { status: 401 });

  try {
    await connectDB();
    const { id } = await params;
    const item = await Item.findOne({ _id: id, user: user._id }).populate("collection", "name color");
    if (!item) return NextResponse.json({ error: "Item not found" }, { status: 404 });
    return NextResponse.json(item);
  } catch {
    return NextResponse.json({ error: "Failed to fetch item" }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await authenticateRequest(request);
  if (!user) return NextResponse.json({ error: "Authentication required" }, { status: 401 });

  try {
    await connectDB();
    const { id } = await params;
    const body = await request.json();

    const item = await Item.findOne({ _id: id, user: user._id });
    if (!item) return NextResponse.json({ error: "Item not found" }, { status: 404 });

    // Save version history for significant changes
    const significantFields = ["title", "notes", "content", "description", "tags"];
    const hasSignificantChange = significantFields.some((f) => body[f] !== undefined);

    if (hasSignificantChange) {
      const latestVersion = await ItemVersion.findOne({ item: id }).sort({ version: -1 });
      const nextVersion = (latestVersion?.version || 0) + 1;

      await ItemVersion.create({
        item: id,
        user: user._id,
        snapshot: item.toObject(),
        changeNote: `Updated ${Object.keys(body).join(", ")}`,
        version: nextVersion,
      });
    }

    const updated = await Item.findOneAndUpdate(
      { _id: id, user: user._id },
      { $set: body },
      { new: true }
    );

    triggerWebhooks(String(user._id), "item.updated", {
      itemId: id,
      changes: Object.keys(body),
    });

    return NextResponse.json(updated);
  } catch {
    return NextResponse.json({ error: "Failed to update item" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await authenticateRequest(request);
  if (!user) return NextResponse.json({ error: "Authentication required" }, { status: 401 });

  try {
    await connectDB();
    const { id } = await params;
    const item = await Item.findOneAndDelete({ _id: id, user: user._id });
    if (!item) return NextResponse.json({ error: "Item not found" }, { status: 404 });

    // Clean up versions
    await ItemVersion.deleteMany({ item: id });

    triggerWebhooks(String(user._id), "item.deleted", {
      itemId: id,
      url: item.url,
      title: item.title,
    });

    return NextResponse.json({ message: "Item deleted" });
  } catch {
    return NextResponse.json({ error: "Failed to delete item" }, { status: 500 });
  }
}
