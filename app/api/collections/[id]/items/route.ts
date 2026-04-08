import { NextRequest, NextResponse } from "next/server";
import { authenticateRequest } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import Item from "@/models/Item";
import Collection from "@/models/Collection";

// Add/remove items from a collection
export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await authenticateRequest(request);
  if (!user) return NextResponse.json({ error: "Authentication required" }, { status: 401 });

  try {
    await connectDB();
    const { id } = await params;
    const { itemIds, action } = await request.json();

    const collection = await Collection.findOne({
      _id: id,
      $or: [
        { user: user._id },
        { collaborators: { $elemMatch: { user: user._id, role: { $in: ["editor", "admin"] } } } },
      ],
    });
    if (!collection) return NextResponse.json({ error: "Collection not found or no permission" }, { status: 404 });

    if (action === "add") {
      await Item.updateMany(
        { _id: { $in: itemIds }, user: user._id },
        { $set: { collection: id } }
      );
    } else if (action === "remove") {
      await Item.updateMany(
        { _id: { $in: itemIds }, user: user._id, collection: id },
        { $set: { collection: null } }
      );
    }

    const count = await Item.countDocuments({ collection: id });
    collection.itemCount = count;
    await collection.save();

    return NextResponse.json({ message: "Items updated", itemCount: count });
  } catch {
    return NextResponse.json({ error: "Failed to update items" }, { status: 500 });
  }
}
