import { cookies } from "next/headers";
import { COOKIE_NAME, verifySessionToken, type SessionUser } from "./auth";
import { ForbiddenError, UnauthenticatedError } from "./errors";

// Node-runtime only (reads cookies via next/headers). Used by server components
// and API route handlers — never by middleware.

/** Current session, or null if unauthenticated. */
export async function getSession(): Promise<SessionUser | null> {
  const token = (await cookies()).get(COOKIE_NAME)?.value;
  return token ? verifySessionToken(token) : null;
}

/** Require any authenticated user, else 401. */
export async function requireUser(): Promise<SessionUser> {
  const user = await getSession();
  if (!user) throw new UnauthenticatedError();
  return user;
}

/** Require a specific role, else 401/403. */
export async function requireRole(role: SessionUser["role"]): Promise<SessionUser> {
  const user = await requireUser();
  if (user.role !== role) throw new ForbiddenError();
  return user;
}
