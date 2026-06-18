import { describe, it, expect, beforeEach, vi } from "vitest";
import { NextRequest } from "next/server";
import { NotFoundError, ForbiddenError } from "@/server/lib/errors";

vi.mock("@/server/lib/session", () => ({
  requireUser: vi.fn(),
  requireRole: vi.fn(),
}));
vi.mock("@/server/patients/patient.service", () => ({
  getPatient: vi.fn(),
  updatePatient: vi.fn(),
  deletePatient: vi.fn(),
}));

import { GET, DELETE } from "./route";
import { requireUser, requireRole } from "@/server/lib/session";
import { getPatient, deletePatient } from "@/server/patients/patient.service";

const admin = { id: "admin", email: "a@a.com", name: "Admin", role: "admin" as const };
const ctx = (id: string) => ({ params: Promise.resolve({ id }) });
const req = () => new NextRequest("http://localhost/api/patients/p1");

beforeEach(() => vi.clearAllMocks());

describe("GET /api/patients/:id", () => {
  it("returns 200 with the patient for an authenticated user", async () => {
    vi.mocked(requireUser).mockResolvedValue(admin);
    vi.mocked(getPatient).mockResolvedValue({
      id: "p1",
      firstName: "Jane",
      lastName: "Doe",
      email: "jane@doe.com",
      phoneNumber: "(555) 123-4567",
      dob: "1990-05-02",
      createdAt: "2026-01-01T00:00:00.000Z",
      updatedAt: "2026-01-01T00:00:00.000Z",
    });
    const res = await GET(req(), ctx("p1"));
    expect(res.status).toBe(200);
    await expect(res.json()).resolves.toMatchObject({ id: "p1" });
  });

  it("returns 404 when the patient does not exist", async () => {
    vi.mocked(requireUser).mockResolvedValue(admin);
    vi.mocked(getPatient).mockRejectedValue(new NotFoundError("Patient not found."));
    const res = await GET(req(), ctx("missing"));
    expect(res.status).toBe(404);
    await expect(res.json()).resolves.toMatchObject({ error: { code: "NOT_FOUND" } });
  });
});

describe("DELETE /api/patients/:id", () => {
  it("returns 403 for a non-admin", async () => {
    vi.mocked(requireRole).mockRejectedValue(new ForbiddenError());
    const res = await DELETE(req(), ctx("p1"));
    expect(res.status).toBe(403);
  });

  it("returns { ok: true } on success", async () => {
    vi.mocked(requireRole).mockResolvedValue(admin);
    vi.mocked(deletePatient).mockResolvedValue(undefined);
    const res = await DELETE(req(), ctx("p1"));
    expect(res.status).toBe(200);
    await expect(res.json()).resolves.toEqual({ ok: true });
  });

  it("returns 404 when deleting a missing patient", async () => {
    vi.mocked(requireRole).mockResolvedValue(admin);
    vi.mocked(deletePatient).mockRejectedValue(new NotFoundError("Patient not found."));
    const res = await DELETE(req(), ctx("missing"));
    expect(res.status).toBe(404);
  });
});
