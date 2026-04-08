import { NextRequest, NextResponse } from "next/server";
import { authenticateRequest } from "@/lib/auth";
import { sendEmail } from "@/lib/email";
import { welcomeEmail } from "@/lib/email-templates";

// POST /api/emails/welcome — Send welcome email to the authenticated user
export async function POST(request: NextRequest) {
  const user = await authenticateRequest(request);
  if (!user)
    return NextResponse.json({ error: "Authentication required" }, { status: 401 });

  try {
    const { subject, html } = welcomeEmail(user.name);
    await sendEmail({ to: user.email, subject, html });

    return NextResponse.json({ message: "Welcome email sent!" });
  } catch (err) {
    console.error("Welcome email error:", err);
    return NextResponse.json({ error: "Failed to send welcome email" }, { status: 500 });
  }
}
