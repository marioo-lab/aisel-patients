import { NextRequest, NextResponse } from "next/server";
import { loginSchema } from "@/lib/validations/auth";
import { login } from "@/server/auth/auth.service";
import { signSession, sessionCookie } from "@/server/lib/auth";
import { toErrorResponse } from "@/server/lib/errors";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const { email, password } = loginSchema.parse(body);

    const user = await login(email, password);
    const token = await signSession(user);

    // Contract returns { token, user } — we deliver the token via Set-Cookie
    // (ADR 0001) and return only the user in the body.
    const res = NextResponse.json({ user: { email: user.email, role: user.role } });
    res.cookies.set(sessionCookie(token));
    return res;
  } catch (err) {
    return toErrorResponse(err);
  }
}
