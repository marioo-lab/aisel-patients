import { cookies } from "next/headers";
import { COOKIE_NAME, verifySessionToken, type SessionUser } from "./auth";
import { ForbiddenError, UnauthenticatedError } from "./errors";
import { can, type Permission } from "@/lib/permissions";

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

/**
 * Require an authenticated user that holds a specific permission, else 401/403.
 * This is the authoritative authorization check for the API.
 */
export async function requirePermission(permission: Permission): Promise<SessionUser> {
  const user = await requireUser();
  if (!can(user.role, permission)) throw new ForbiddenError();
  return user;
}
