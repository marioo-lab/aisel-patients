import { describe, it, expect, beforeEach, vi } from "vitest";
import { UnauthenticatedError } from "@/server/lib/errors";

const prismaMock = vi.hoisted(() => ({
  user: { findUnique: vi.fn() },
}));
const bcryptMock = vi.hoisted(() => ({ compare: vi.fn() }));

vi.mock("@/server/lib/prisma", () => ({ prisma: prismaMock }));
vi.mock("bcryptjs", () => ({ compare: bcryptMock.compare }));

import { login } from "./auth.service";

const user = {
  id: "u1",
  email: "admin@aisel.health",
  name: "Dr. Mara Ellison",
  role: "admin",
  passwordHash: "hashed",
};

beforeEach(() => vi.clearAllMocks());

describe("login", () => {
  it("returns a SessionUser on valid credentials", async () => {
    prismaMock.user.findUnique.mockResolvedValue(user);
    bcryptMock.compare.mockResolvedValue(true);

    const session = await login("admin@aisel.health", "aisel1234");
    expect(session).toEqual({
      id: "u1",
      email: "admin@aisel.health",
      name: "Dr. Mara Ellison",
      role: "admin",
    });
    expect(bcryptMock.compare).toHaveBeenCalledWith("aisel1234", "hashed");
  });

  it("rejects an unknown email with 401 (no enumeration)", async () => {
    prismaMock.user.findUnique.mockResolvedValue(null);
    await expect(login("nobody@x.com", "whatever")).rejects.toBeInstanceOf(
      UnauthenticatedError
    );
    expect(bcryptMock.compare).not.toHaveBeenCalled();
  });

  it("rejects a wrong password with 401", async () => {
    prismaMock.user.findUnique.mockResolvedValue(user);
    bcryptMock.compare.mockResolvedValue(false);
    await expect(login("admin@aisel.health", "wrong")).rejects.toBeInstanceOf(
      UnauthenticatedError
    );
  });
});
