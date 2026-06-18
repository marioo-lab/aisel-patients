import { describe, it, expect, beforeEach, vi } from "vitest";
import { NextRequest } from "next/server";
import { UnauthenticatedError, ForbiddenError, ConflictError } from "@/server/lib/errors";

vi.mock("@/server/lib/session", () => ({
  requirePermission: vi.fn(),
}));
vi.mock("@/server/patients/patient.service", () => ({
  listPatients: vi.fn(),
  createPatient: vi.fn(),
}));

import { GET, POST } from "./route";
import { requirePermission } from "@/server/lib/session";
import { listPatients, createPatient } from "@/server/patients/patient.service";

const admin = { id: "admin", email: "a@a.com", name: "Admin", role: "admin" as const };
const validBody = {
  firstName: "Jane",
  lastName: "Doe",
  email: "jane@doe.com",
  phoneNumber: "5551234567",
  dob: "1990-05-02",
};

function postReq(body: unknown) {
  return new NextRequest("http://localhost/api/patients", {
    method: "POST",
    body: JSON.stringify(body),
    headers: { "content-type": "application/json" },
  });
}

beforeEach(() => vi.clearAllMocks());

describe("GET /api/patients", () => {
  it("returns 200 with the list envelope for an authenticated user", async () => {
    vi.mocked(requirePermission).mockResolvedValue(admin);
    vi.mocked(listPatients).mockResolvedValue({ data: [], page: 1, limit: 10, total: 0 });

    const res = await GET(
      new NextRequest("http://localhost/api/patients?page=1&limit=10")
    );
    expect(res.status).toBe(200);
    await expect(res.json()).resolves.toMatchObject({ page: 1, limit: 10, total: 0 });
  });

  it("returns 401 when unauthenticated", async () => {
    vi.mocked(requirePermission).mockRejectedValue(new UnauthenticatedError());
    const res = await GET(new NextRequest("http://localhost/api/patients"));
    expect(res.status).toBe(401);
    await expect(res.json()).resolves.toMatchObject({
      error: { code: "UNAUTHENTICATED" },
    });
  });
});

describe("POST /api/patients", () => {
  it("returns 403 for a non-admin", async () => {
    vi.mocked(requirePermission).mockRejectedValue(new ForbiddenError());
    const res = await POST(postReq(validBody));
    expect(res.status).toBe(403);
  });

  it("returns 400 on invalid body", async () => {
    vi.mocked(requirePermission).mockResolvedValue(admin);
    const res = await POST(postReq({ firstName: "J" }));
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error.code).toBe("VALIDATION_ERROR");
    expect(body.error.fieldErrors).toBeTruthy();
  });

  it("returns 201 and passes creator id on success", async () => {
    vi.mocked(requirePermission).mockResolvedValue(admin);
    vi.mocked(createPatient).mockResolvedValue({
      id: "p1",
      ...validBody,
      createdAt: "2026-01-01T00:00:00.000Z",
      updatedAt: "2026-01-01T00:00:00.000Z",
    });
    const res = await POST(postReq(validBody));
    expect(res.status).toBe(201);
    expect(vi.mocked(createPatient)).toHaveBeenCalledWith(expect.any(Object), "admin");
  });

  it("returns 409 with a field error on duplicate email", async () => {
    vi.mocked(requirePermission).mockResolvedValue(admin);
    vi.mocked(createPatient).mockRejectedValue(
      new ConflictError("dupe", { email: "A patient with this email already exists." })
    );
    const res = await POST(postReq(validBody));
    expect(res.status).toBe(409);
    await expect(res.json()).resolves.toMatchObject({
      error: { code: "CONFLICT", fieldErrors: { email: expect.any(String) } },
    });
  });
});
