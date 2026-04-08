import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { signToken } from "@/lib/auth";
import User from "@/models/User";
import { sendEmail } from "@/lib/email";
import { welcomeEmail } from "@/lib/email-templates";

export async function POST(request: Request) {
  try {
    const { name, email: rawEmail, password } = await request.json();
    const email = typeof rawEmail === "string" ? rawEmail.trim().toLowerCase() : "";

    if (!name || !email || !password) {
      return NextResponse.json({ error: "Name, email, and password are required" }, { status: 400 });
    }

    if (password.length < 6) {
      return NextResponse.json({ error: "Password must be at least 6 characters" }, { status: 400 });
    }

    await connectDB();

    const existing = await User.findOne({ email });
    if (existing) {
      return NextResponse.json({ error: "Email already registered" }, { status: 409 });
    }

    const user = await User.create({ name, email, password });
    const token = signToken(user._id.toString());

    const response = NextResponse.json({ user, token }, { status: 201 });
    response.cookies.set("token", token, {
      httpOnly: true,
      maxAge: 7 * 24 * 60 * 60,
      sameSite: "lax",
      path: "/",
    });

    // Send welcome email (non-blocking — don't fail registration if email fails)
    const { subject, html } = welcomeEmail(name);
    sendEmail({ to: email, subject, html }).catch((err) =>
      console.error("Welcome email failed:", err)
    );

    return response;
  } catch (error) {
    console.error("Registration failed:", error);
    return NextResponse.json({ error: "Registration failed" }, { status: 500 });
  }
}
