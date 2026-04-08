import jwt from "jsonwebtoken";
import { cookies } from "next/headers";
import { connectDB } from "./db";
import User, { IUser } from "@/models/User";
import ApiKey from "@/models/ApiKey";

const JWT_SECRET = process.env.JWT_SECRET || "memory-os-secret-change-in-production";

export function signToken(userId: string): string {
  return jwt.sign({ id: userId }, JWT_SECRET, { expiresIn: "7d" });
}

export function verifyToken(token: string): { id: string } {
  return jwt.verify(token, JWT_SECRET) as { id: string };
}

export async function getUser(): Promise<IUser | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;
    if (!token) return null;

    const decoded = verifyToken(token);
    await connectDB();
    const user = await User.findById(decoded.id).lean();
    return user as IUser | null;
  } catch {
    return null;
  }
}

export async function authenticateRequest(request: Request): Promise<IUser | null> {
  try {
    await connectDB();

    // Check Bearer token (API key or JWT)
    const authHeader = request.headers.get("authorization");
    if (authHeader?.startsWith("Bearer ")) {
      const key = authHeader.slice(7);

      if (key.startsWith("mos_")) {
        const apiKey = await ApiKey.findOne({ key, active: true });
        if (!apiKey) return null;

        apiKey.lastUsed = new Date();
        await apiKey.save();

        return await User.findById(apiKey.user).lean() as IUser | null;
      }

      const decoded = verifyToken(key);
      return await User.findById(decoded.id).lean() as IUser | null;
    }

    // Check cookie
    const requestWithCookies = request as Request & {
      cookies?: { get: (name: string) => { value?: string } | undefined };
    };
    const cookieToken = requestWithCookies.cookies?.get("token")?.value;
    if (cookieToken) {
      const decoded = verifyToken(cookieToken);
      return await User.findById(decoded.id).lean() as IUser | null;
    }

    const cookieHeader = request.headers.get("cookie") || "";
    const tokenMatch = cookieHeader.match(/token=([^;]+)/);
    if (tokenMatch) {
      const decoded = verifyToken(tokenMatch[1]);
      return await User.findById(decoded.id).lean() as IUser | null;
    }

    return null;
  } catch {
    return null;
  }
}

export { JWT_SECRET };
