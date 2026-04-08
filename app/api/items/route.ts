import { NextRequest, NextResponse } from "next/server";
import { authenticateRequest } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import Item from "@/models/Item";
import ClipRule from "@/models/ClipRule";
import { generateSummary, extractKeyPoints, generateTags, findDuplicates } from "@/lib/ai";
import { triggerWebhooks } from "@/lib/webhooks";

export async function GET(request: NextRequest) {
  const user = await authenticateRequest(request);
  if (!user) return NextResponse.json({ error: "Authentication required" }, { status: 401 });

  try {
    await connectDB();
    const params = request.nextUrl.searchParams;
    const search = params.get("search");
    const tag = params.get("tag");
    const type = params.get("type");
    const favorite = params.get("favorite");
    const collection = params.get("collection");
    const isTask = params.get("isTask");
    const taskDone = params.get("taskDone");
    const page = parseInt(params.get("page") || "1");
    const limit = parseInt(params.get("limit") || "30");

    const filter: Record<string, any> = { user: user._id };
    if (search) filter.$text = { $search: search };
    if (tag) filter.$or = [{ tags: tag.toLowerCase() }, { aiTags: tag.toLowerCase() }];
    if (type) filter.type = type;
    if (favorite === "true") filter.favorite = true;
    if (collection) filter.collection = collection;
    if (isTask === "true") filter.isTask = true;
    if (taskDone !== undefined && taskDone !== null) filter.taskDone = taskDone === "true";

    const skip = (page - 1) * limit;

    const [items, total] = await Promise.all([
      Item.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
      Item.countDocuments(filter),
    ]);

    return NextResponse.json({ items, total, page, pages: Math.ceil(total / limit) });
  } catch {
    return NextResponse.json({ error: "Failed to fetch items" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const user = await authenticateRequest(request);
  if (!user) return NextResponse.json({ error: "Authentication required" }, { status: 401 });

  try {
    await connectDB();
    const body = await request.json();
    const { url, title, description, domain, favicon, type, tags, notes, content, highlights, isTask } = body;

    if (!url) return NextResponse.json({ error: "URL is required" }, { status: 400 });

    // Check clip rules for auto-tagging and auto-collection
    let autoTags: string[] = [];
    let autoCollection = null;
    try {
      const rules = await ClipRule.find({ user: user._id, active: true });
      for (const rule of rules) {
        let matches = false;
        if (rule.matchType === "domain" && domain && domain.includes(rule.pattern)) matches = true;
        if (rule.matchType === "url_contains" && url.includes(rule.pattern)) matches = true;
        if (rule.matchType === "title_contains" && title && title.toLowerCase().includes(rule.pattern.toLowerCase())) matches = true;

        if (matches) {
          autoTags = [...autoTags, ...rule.autoTags];
          if (rule.autoCollection) autoCollection = rule.autoCollection;
          rule.hitCount += 1;
          await rule.save();
        }
      }
    } catch { /* clip rules are optional */ }

    const allTags = [...new Set([...(tags || []), ...autoTags])];

    // Check for duplicates
    const existing = await Item.find({ user: user._id }).select("url title domain").limit(1000).lean();
    const dupes = findDuplicates(url, title || "", existing.map((i) => ({
      _id: String(i._id), url: i.url, title: i.title || "", domain: i.domain || "",
    })));

    // Auto-summarize on save
    const text = [title, description, content, notes].filter(Boolean).join(". ");
    const summary = text.length > 50 ? generateSummary(text) : "";
    const keyPoints = text.length > 50 ? extractKeyPoints(text) : [];
    const aiTags = text.length > 30 ? generateTags(text, allTags) : [];

    const item = await Item.create({
      user: user._id,
      url,
      title: title || "Untitled",
      description: description || "",
      domain: domain || (() => { try { return new URL(url).hostname; } catch { return ""; } })(),
      favicon: favicon || "",
      type: type || "page",
      tags: allTags,
      aiTags,
      notes: notes || "",
      content: content || "",
      summary,
      keyPoints,
      highlights: highlights || [],
      collection: autoCollection || body.collection || null,
      duplicateOf: dupes.length > 0 ? dupes[0]._id : null,
      isTask: isTask || false,
      favorite: false,
    });

    // Trigger webhooks
    triggerWebhooks(String(user._id), "item.created", {
      itemId: String(item._id),
      url: item.url,
      title: item.title,
      type: item.type,
      tags: item.tags,
    });

    const response: Record<string, unknown> = { ...item.toObject() };
    if (dupes.length > 0) {
      response.duplicateWarning = dupes;
    }

    return NextResponse.json(response, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Failed to save item" }, { status: 500 });
  }
}
