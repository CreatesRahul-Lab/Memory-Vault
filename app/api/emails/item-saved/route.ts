import { NextRequest, NextResponse } from "next/server";
import { authenticateRequest } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import Item from "@/models/Item";
import { sendEmail } from "@/lib/email";
import { itemSavedEmail } from "@/lib/email-templates";

// POST /api/emails/item-saved — Send a "you saved something!" notification email
// Body: { itemId: string }
export async function POST(request: NextRequest) {
  const user = await authenticateRequest(request);
  if (!user)
    return NextResponse.json({ error: "Authentication required" }, { status: 401 });

  try {
    await connectDB();
    const { itemId } = await request.json();

    if (!itemId) {
      return NextResponse.json({ error: "itemId is required" }, { status: 400 });
    }

    const item = await Item.findOne({ _id: itemId, user: user._id })
      .select("title url domain type tags summary")
      .lean();

    if (!item) {
      return NextResponse.json({ error: "Item not found" }, { status: 404 });
    }

    const totalSavedAllTime = await Item.countDocuments({ user: user._id });

    const { subject, html } = itemSavedEmail({
      userName: user.name,
      item: {
        title: (item as Record<string, unknown>).title as string,
        url: (item as Record<string, unknown>).url as string,
        domain: (item as Record<string, unknown>).domain as string,
        type: (item as Record<string, unknown>).type as string,
        tags: (item as Record<string, unknown>).tags as string[],
        summary: (item as Record<string, unknown>).summary as string,
      },
      totalSavedAllTime,
    });

    await sendEmail({ to: user.email, subject, html });

    return NextResponse.json({ message: "Item saved email sent!", totalSavedAllTime });
  } catch (err) {
    console.error("Item saved email error:", err);
    return NextResponse.json({ error: "Failed to send item saved email" }, { status: 500 });
  }
}
