import { NextRequest, NextResponse } from "next/server";
import { authenticateRequest } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import Collection from "@/models/Collection";
import Item from "@/models/Item";

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await authenticateRequest(request);
  if (!user) return NextResponse.json({ error: "Authentication required" }, { status: 401 });

  try {
    await connectDB();
    const { id } = await params;
    const collection = await Collection.findOne({
      _id: id,
      $or: [{ user: user._id }, { "collaborators.user": user._id }],
    });

    if (!collection) return NextResponse.json({ error: "Collection not found" }, { status: 404 });

    const page = parseInt(request.nextUrl.searchParams.get("page") || "1");
    const limit = parseInt(request.nextUrl.searchParams.get("limit") || "30");
    const skip = (page - 1) * limit;

    let filter: Record<string, unknown> = { collection: collection._id };

    // If it's a saved filter collection, use the filter instead
    if (collection.savedFilter) {
      filter = { user: user._id };
      if (collection.savedFilter.search) filter.$text = { $search: collection.savedFilter.search };
      if (collection.savedFilter.tags?.length) filter.tags = { $in: collection.savedFilter.tags };
      if (collection.savedFilter.types?.length) filter.type = { $in: collection.savedFilter.types };
      if (collection.savedFilter.favorite) filter.favorite = true;
    } else {
      filter.user = user._id;
    }

    const [items, total] = await Promise.all([
      Item.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
      Item.countDocuments(filter),
    ]);

    return NextResponse.json({
      collection,
      items,
      total,
      page,
      pages: Math.ceil(total / limit),
    });
  } catch {
    return NextResponse.json({ error: "Failed to fetch collection" }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await authenticateRequest(request);
  if (!user) return NextResponse.json({ error: "Authentication required" }, { status: 401 });

  try {
    await connectDB();
    const { id } = await params;
    const body = await request.json();

    const collection = await Collection.findOneAndUpdate(
      { _id: id, user: user._id },
      { $set: body },
      { new: true }
    );

    if (!collection) return NextResponse.json({ error: "Collection not found" }, { status: 404 });
    return NextResponse.json(collection);
  } catch {
    return NextResponse.json({ error: "Failed to update collection" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await authenticateRequest(request);
  if (!user) return NextResponse.json({ error: "Authentication required" }, { status: 401 });

  try {
    await connectDB();
    const { id } = await params;

    const collection = await Collection.findOneAndDelete({ _id: id, user: user._id });
    if (!collection) return NextResponse.json({ error: "Collection not found" }, { status: 404 });

    // Unlink items from this collection
    await Item.updateMany({ collection: id, user: user._id }, { $set: { collection: null } });

    return NextResponse.json({ message: "Collection deleted" });
  } catch {
    return NextResponse.json({ error: "Failed to delete collection" }, { status: 500 });
  }
}
