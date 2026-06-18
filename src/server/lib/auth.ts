import { SignJWT, jwtVerify } from "jose";

// Edge-safe: this module uses only `jose` (no next/headers, no Node APIs) so it
// can be imported by middleware. Cookie *reading* helpers live in session.ts.

export const COOKIE_NAME = "aisel_token";
const TTL_SECONDS = 30 * 60; // 30 min — matches the mock-expiry decision.

export type SessionUser = {
  id: string;
  email: string;
  name: string;
  role: "admin" | "user";
};

function secret(): Uint8Array {
  const s = process.env.AUTH_SECRET;
  if (!s) throw new Error("AUTH_SECRET is not set");
  return new TextEncoder().encode(s);
}

export async function signSession(user: SessionUser): Promise<string> {
  return new SignJWT({ email: user.email, name: user.name, role: user.role })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(user.id)
    .setIssuedAt()
    .setExpirationTime(`${TTL_SECONDS}s`)
    .sign(secret());
}

/** Verify a token and reshape it into a SessionUser. Returns null if invalid/expired. */
export async function verifySessionToken(token: string): Promise<SessionUser | null> {
  try {
    const { payload } = await jwtVerify(token, secret());
    if (
      typeof payload.sub !== "string" ||
      typeof payload.email !== "string" ||
      typeof payload.name !== "string" ||
      (payload.role !== "admin" && payload.role !== "user")
    ) {
      return null;
    }
    return {
      id: payload.sub,
      email: payload.email,
      name: payload.name,
      role: payload.role,
    };
  } catch {
    return null;
  }
}

type CookieOptions = {
  name: string;
  value: string;
  httpOnly: true;
  sameSite: "lax";
  secure: boolean;
  path: string;
  maxAge: number;
};

/** Cookie descriptor for a fresh session (set on a NextResponse). */
export function sessionCookie(token: string): CookieOptions {
  return {
    name: COOKIE_NAME,
    value: token,
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: TTL_SECONDS,
  };
}

/** Cookie descriptor that immediately expires the session. */
export function clearedSessionCookie(): CookieOptions {
  return { ...sessionCookie(""), maxAge: 0 };
}
