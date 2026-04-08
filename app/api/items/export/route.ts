import { NextRequest, NextResponse } from "next/server";
import { authenticateRequest } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import Item from "@/models/Item";
import Collection from "@/models/Collection";

export async function GET(request: NextRequest) {
  const user = await authenticateRequest(request);
  if (!user) return NextResponse.json({ error: "Authentication required" }, { status: 401 });

  try {
    await connectDB();
    const format = request.nextUrl.searchParams.get("format") || "json";
    const collectionId = request.nextUrl.searchParams.get("collection");

    const filter: Record<string, unknown> = { user: user._id };
    if (collectionId) filter.collection = collectionId;

    const items = await Item.find(filter).sort({ createdAt: -1 }).lean();
    const collections = await Collection.find({ user: user._id }).lean();

    if (format === "csv") {
      const header = "title,url,type,tags,notes,content,favorite,createdAt\n";
      const rows = items
        .map((i) => {
          const escape = (s: string) => `"${(s || "").replace(/"/g, '""')}"`;
          return [
            escape(i.title || ""),
            escape(i.url),
            i.type,
            escape((i.tags || []).join(",")),
            escape(i.notes || ""),
            escape((i.content || "").substring(0, 500)),
            i.favorite ? "true" : "false",
            i.createdAt ? new Date(i.createdAt).toISOString() : "",
          ].join(",");
        })
        .join("\n");

      return new NextResponse(header + rows, {
        headers: {
          "Content-Type": "text/csv",
          "Content-Disposition": `attachment; filename="memory-os-export-${Date.now()}.csv"`,
        },
      });
    }

    // JSON export
    const exportData = {
      exportedAt: new Date().toISOString(),
      version: "1.0",
      user: { name: user.name, email: user.email },
      itemCount: items.length,
      collectionCount: collections.length,
      items: items.map((i) => ({
        url: i.url,
        title: i.title,
        description: i.description,
        domain: i.domain,
        type: i.type,
        tags: i.tags,
        aiTags: i.aiTags,
        notes: i.notes,
        content: i.content,
        summary: i.summary,
        keyPoints: i.keyPoints,
        highlights: i.highlights,
        favorite: i.favorite,
        isTask: i.isTask,
        taskDone: i.taskDone,
        createdAt: i.createdAt,
        updatedAt: i.updatedAt,
      })),
      collections: collections.map((c) => ({
        name: c.name,
        description: c.description,
        color: c.color,
        icon: c.icon,
        savedFilter: c.savedFilter,
      })),
    };

    return new NextResponse(JSON.stringify(exportData, null, 2), {
      headers: {
        "Content-Type": "application/json",
        "Content-Disposition": `attachment; filename="memory-os-export-${Date.now()}.json"`,
      },
    });
  } catch {
    return NextResponse.json({ error: "Failed to export" }, { status: 500 });
  }
}
