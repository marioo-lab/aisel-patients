import { describe, it, expect, beforeEach, vi } from "vitest";
import { Prisma } from "@prisma/client";
import { ConflictError, NotFoundError } from "@/server/lib/errors";

const prismaMock = vi.hoisted(() => ({
  patient: {
    create: vi.fn(),
    findUnique: vi.fn(),
    findMany: vi.fn(),
    count: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  },
  $transaction: vi.fn(),
}));

vi.mock("@/server/lib/prisma", () => ({ prisma: prismaMock }));

import {
  createPatient,
  updatePatient,
  deletePatient,
  getPatient,
  listPatients,
} from "./patient.service";

const row = {
  id: "p1",
  firstName: "Jane",
  lastName: "Doe",
  email: "jane@doe.com",
  phoneNumber: "(555) 123-4567",
  dob: new Date("1990-05-02T00:00:00.000Z"),
  createdAt: new Date("2026-01-01T00:00:00.000Z"),
  updatedAt: new Date("2026-01-01T00:00:00.000Z"),
  createdById: "admin",
};

const input = {
  firstName: "Jane",
  lastName: "Doe",
  email: "jane@doe.com",
  phoneNumber: "(555) 123-4567",
  dob: "1990-05-02",
};

function uniqueViolation() {
  return new Prisma.PrismaClientKnownRequestError("unique", {
    code: "P2002",
    clientVersion: "6",
  });
}
function recordNotFound() {
  return new Prisma.PrismaClientKnownRequestError("missing", {
    code: "P2025",
    clientVersion: "6",
  });
}

beforeEach(() => vi.clearAllMocks());

describe("createPatient", () => {
  it("stores creator id and returns a DTO with dob as YYYY-MM-DD", async () => {
    prismaMock.patient.create.mockResolvedValue(row);
    const dto = await createPatient(input, "admin");

    expect(prismaMock.patient.create).toHaveBeenCalledWith({
      data: expect.objectContaining({ createdById: "admin", email: "jane@doe.com" }),
    });
    expect(dto.dob).toBe("1990-05-02");
    expect(dto.createdAt).toBe("2026-01-01T00:00:00.000Z");
  });

  it("maps a unique-violation to a 409 ConflictError on email", async () => {
    prismaMock.patient.create.mockRejectedValue(uniqueViolation());
    await expect(createPatient(input, "admin")).rejects.toMatchObject({
      status: 409,
      code: "CONFLICT",
      fieldErrors: { email: expect.any(String) },
    });
  });
});

describe("updatePatient", () => {
  it("maps a missing record to 404", async () => {
    prismaMock.patient.update.mockRejectedValue(recordNotFound());
    await expect(updatePatient("nope", input)).rejects.toBeInstanceOf(NotFoundError);
  });

  it("maps a unique violation to 409", async () => {
    prismaMock.patient.update.mockRejectedValue(uniqueViolation());
    await expect(updatePatient("p1", input)).rejects.toBeInstanceOf(ConflictError);
  });
});

describe("getPatient", () => {
  it("throws 404 when not found", async () => {
    prismaMock.patient.findUnique.mockResolvedValue(null);
    await expect(getPatient("missing")).rejects.toBeInstanceOf(NotFoundError);
  });
});

describe("deletePatient", () => {
  it("maps a missing record to 404", async () => {
    prismaMock.patient.delete.mockRejectedValue(recordNotFound());
    await expect(deletePatient("missing")).rejects.toBeInstanceOf(NotFoundError);
  });
});

describe("listPatients", () => {
  it("builds a case-insensitive OR filter and returns the envelope", async () => {
    prismaMock.patient.findMany.mockResolvedValue([row]);
    prismaMock.patient.count.mockResolvedValue(1);
    prismaMock.$transaction.mockImplementation((ops: Promise<unknown>[]) =>
      Promise.all(ops)
    );

    const res = await listPatients({
      page: 2,
      limit: 10,
      q: "jane",
      sort: "lastName",
      order: "asc",
    });

    expect(prismaMock.patient.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        skip: 10,
        take: 10,
        orderBy: { lastName: "asc" },
        where: {
          OR: expect.arrayContaining([
            { firstName: { contains: "jane", mode: "insensitive" } },
          ]),
        },
      })
    );
    expect(res).toMatchObject({ page: 2, limit: 10, total: 1 });
    expect(res.data[0].dob).toBe("1990-05-02");
  });
});
