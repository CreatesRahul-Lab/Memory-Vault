import { NextRequest, NextResponse } from "next/server";
import { authenticateRequest } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import Collection from "@/models/Collection";
import { v4 as uuidv4 } from "uuid";

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await authenticateRequest(request);
  if (!user) return NextResponse.json({ error: "Authentication required" }, { status: 401 });

  try {
    await connectDB();
    const { id } = await params;
    const { isPublic, collaboratorEmail, role } = await request.json();

    const collection = await Collection.findOne({ _id: id, user: user._id });
    if (!collection) return NextResponse.json({ error: "Collection not found" }, { status: 404 });

    // Toggle public sharing
    if (typeof isPublic === "boolean") {
      collection.isPublic = isPublic;
      if (isPublic && !collection.shareToken) {
        collection.shareToken = uuidv4().replace(/-/g, "");
      }
      if (!isPublic) {
        collection.shareToken = null;
      }
      await collection.save();
      return NextResponse.json({
        isPublic: collection.isPublic,
        shareToken: collection.shareToken,
        shareUrl: collection.shareToken
          ? `${request.nextUrl.origin}/shared/${collection.shareToken}`
          : null,
      });
    }

    // Add collaborator
    if (collaboratorEmail) {
      const User = (await import("@/models/User")).default;
      const collab = await User.findOne({ email: collaboratorEmail.toLowerCase() });
      if (!collab) return NextResponse.json({ error: "User not found" }, { status: 404 });
      if (String(collab._id) === String(user._id)) {
        return NextResponse.json({ error: "Cannot add yourself" }, { status: 400 });
      }

      const exists = collection.collaborators.some(
        (c) => String(c.user) === String(collab._id)
      );
      if (!exists) {
        collection.collaborators.push({ user: collab._id, role: role || "viewer" });
        await collection.save();
      }
      return NextResponse.json({ collaborators: collection.collaborators });
    }

    return NextResponse.json({ error: "No action specified" }, { status: 400 });
  } catch {
    return NextResponse.json({ error: "Failed to share collection" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await authenticateRequest(request);
  if (!user) return NextResponse.json({ error: "Authentication required" }, { status: 401 });

  try {
    await connectDB();
    const { id } = await params;
    const { collaboratorId } = await request.json();

    const collection = await Collection.findOne({ _id: id, user: user._id });
    if (!collection) return NextResponse.json({ error: "Collection not found" }, { status: 404 });

    collection.collaborators = collection.collaborators.filter(
      (c) => String(c.user) !== collaboratorId
    );
    await collection.save();

    return NextResponse.json({ collaborators: collection.collaborators });
  } catch {
    return NextResponse.json({ error: "Failed to remove collaborator" }, { status: 500 });
  }
}
