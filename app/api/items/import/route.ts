import { NextRequest, NextResponse } from "next/server";
import { authenticateRequest } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import Item from "@/models/Item";
import Collection from "@/models/Collection";

export async function POST(request: NextRequest) {
  const user = await authenticateRequest(request);
  if (!user) return NextResponse.json({ error: "Authentication required" }, { status: 401 });

  try {
    await connectDB();
    const body = await request.json();

    if (!body.items || !Array.isArray(body.items)) {
      return NextResponse.json({ error: "Invalid import format: items array required" }, { status: 400 });
    }

    let imported = 0;
    let skipped = 0;
    let collectionsCreated = 0;

    // Import collections first
    const collectionMap = new Map<string, string>();
    if (body.collections && Array.isArray(body.collections)) {
      for (const c of body.collections) {
        const existing = await Collection.findOne({ user: user._id, name: c.name });
        if (existing) {
          collectionMap.set(c.name, String(existing._id));
        } else {
          const created = await Collection.create({
            user: user._id,
            name: c.name,
            description: c.description || "",
            color: c.color || "#e8b931",
            icon: c.icon || "folder",
            savedFilter: c.savedFilter || null,
          });
          collectionMap.set(c.name, String(created._id));
          collectionsCreated++;
        }
      }
    }

    // Import items
    for (const item of body.items) {
      if (!item.url) {
        skipped++;
        continue;
      }

      // Check for duplicates by URL
      const existing = await Item.findOne({ user: user._id, url: item.url });
      if (existing) {
        skipped++;
        continue;
      }

      await Item.create({
        user: user._id,
        url: item.url,
        title: item.title || "Untitled",
        description: item.description || "",
        domain: item.domain || "",
        type: item.type || "page",
        tags: item.tags || [],
        aiTags: item.aiTags || [],
        notes: item.notes || "",
        content: item.content || "",
        summary: item.summary || "",
        keyPoints: item.keyPoints || [],
        highlights: item.highlights || [],
        favorite: item.favorite || false,
        isTask: item.isTask || false,
        taskDone: item.taskDone || false,
      });
      imported++;
    }

    return NextResponse.json({
      message: "Import complete",
      imported,
      skipped,
      collectionsCreated,
    });
  } catch {
    return NextResponse.json({ error: "Failed to import" }, { status: 500 });
  }
}
