import { compare } from "bcryptjs";
import { prisma } from "@/server/lib/prisma";
import { UnauthenticatedError } from "@/server/lib/errors";
import type { SessionUser } from "@/server/lib/auth";

/**
 * Verify credentials against the User table. Uses a single generic error for
 * both "no such user" and "wrong password" to avoid user enumeration.
 */
export async function login(email: string, password: string): Promise<SessionUser> {
  const invalid = () => new UnauthenticatedError("Invalid email or password.");

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) throw invalid();

  const ok = await compare(password, user.passwordHash);
  if (!ok) throw invalid();

  return { id: user.id, email: user.email, name: user.name, role: user.role };
}
