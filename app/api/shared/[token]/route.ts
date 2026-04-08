import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Collection from "@/models/Collection";
import Item from "@/models/Item";

// Public endpoint - no auth required
export async function GET(request: NextRequest, { params }: { params: Promise<{ token: string }> }) {
  try {
    await connectDB();
    const { token } = await params;

    const collection = await Collection.findOne({ shareToken: token, isPublic: true })
      .populate("user", "name");

    if (!collection) {
      return NextResponse.json({ error: "Collection not found or not public" }, { status: 404 });
    }

    const page = parseInt(request.nextUrl.searchParams.get("page") || "1");
    const limit = Math.min(parseInt(request.nextUrl.searchParams.get("limit") || "20"), 50);
    const skip = (page - 1) * limit;

    let filter: Record<string, unknown> = { collection: collection._id };

    if (collection.savedFilter) {
      filter = { user: collection.user };
      if (collection.savedFilter.search) filter.$text = { $search: collection.savedFilter.search };
      if (collection.savedFilter.tags?.length) filter.tags = { $in: collection.savedFilter.tags };
      if (collection.savedFilter.types?.length) filter.type = { $in: collection.savedFilter.types };
      if (collection.savedFilter.favorite) filter.favorite = true;
    }

    const [items, total] = await Promise.all([
      Item.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .select("title url description domain favicon type tags createdAt"),
      Item.countDocuments(filter),
    ]);

    return NextResponse.json({
      collection: {
        name: collection.name,
        description: collection.description,
        color: collection.color,
        icon: collection.icon,
        owner: (collection.user as unknown as { name: string })?.name || "Anonymous",
      },
      items,
      total,
      page,
      pages: Math.ceil(total / limit),
    });
  } catch {
    return NextResponse.json({ error: "Failed to fetch shared collection" }, { status: 500 });
  }
}
