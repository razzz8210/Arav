import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { NextRequest } from "next/server";
import { cookiesManager } from "@/app/utils/cookies";
import { getServerSession } from "next-auth";
import { authOptions } from "./auth-config";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

export interface UserPayload {
  id: string;
  email: string;
  prismaId: string;
}

export interface AuthUser {
  id: string;
  email: string;
  name?: string | null;
  prismaId?: string | null;
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

export async function verifyPassword(
  password: string,
  hashedPassword: string
): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword);
}

export function generateToken(payload: UserPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "7d" });
}

export function verifyToken(token: string): UserPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as UserPayload;
  } catch {
    return null;
  }
}

export function getTokenFromHeader(request: NextRequest): string | null {
  const authHeader = request.headers.get("authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return null;
  }
  return authHeader.substring(7);
}

export async function getUserFromRequest(
  request: NextRequest
): Promise<UserPayload | null> {
  const token = getTokenFromHeader(request);
  if (!token) {
    return null;
  }
  return verifyToken(token);
}

export function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

/**
 * Get user from cookies (server-side only)
 * @returns {Promise<UserPayload | null>} The user payload or null if not authenticated
 */
export async function getUserFromCookies(): Promise<UserPayload | null> {
  try {
    const token = await cookiesManager.getUserToken();
    if (!token) {
      return null;
    }
    return verifyToken(token);
  } catch (error) {
    console.warn("Could not get user from cookies:", error);
    return null;
  }
}

/**
 * Server-side function to check authentication from both NextAuth session and JWT cookies
 * @returns Promise<AuthUser | null> - Returns user if authenticated, null if not
 */
export async function getAuthenticatedUser(): Promise<AuthUser | null> {
  try {
    // First check NextAuth session
    const session = await getServerSession(authOptions);
    if (session?.user) {
      return {
        id: session.user.id,
        email: session.user.email,
        name: session.user.name || null,
        prismaId: session.user.prismaId || null,
      };
    }

    // Fallback to JWT cookie authentication
    const userPayload = await getUserFromCookies();
    if (userPayload) {
      return {
        id: userPayload.id,
        email: userPayload.email,
        name: null, // JWT payload doesn't include name
        prismaId: userPayload.prismaId,
      };
    }

    return null;
  } catch (error) {
    console.error("Error checking authentication:", error);
    return null;
  }
}

/**
 * Check if user is authenticated (returns boolean)
 * @returns Promise<boolean>
 */
export async function isAuthenticated(): Promise<boolean> {
  const user = await getAuthenticatedUser();
  return user !== null;
}

export async function getUserTokenFromAuthAndCookies(): Promise<string | null> {
  try {
    // First check NextAuth session
    const session = await getServerSession(authOptions);
    if (session?.user) {
      // For NextAuth sessions, we need to generate a JWT token from the session data
      const userPayload: UserPayload = {
        id: session.user.id,
        email: session.user.email,
        prismaId: session.user.prismaId || session.user.id, // fallback to id if prismaId not available
      };
      return generateToken(userPayload);
    }

    // Fallback to JWT cookie token
    const token = await cookiesManager.getUserToken();
    if (token) {
      // Verify the token is valid before returning it
      const isValid = verifyToken(token);
      if (isValid) {
        return token;
      }
    }

    return null;
  } catch (error) {
    console.error("Error getting user token from auth and cookies:", error);
    return null;
  }
}
