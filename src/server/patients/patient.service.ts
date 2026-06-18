import { Prisma, type Patient } from "@prisma/client";
import { prisma } from "@/server/lib/prisma";
import { ConflictError, NotFoundError } from "@/server/lib/errors";
import type {
  ListQuery,
  PatientInput,
  PatientDTO,
  PatientListResponse,
} from "@/lib/validations/patient";

/** Map a Prisma Patient to the API DTO (dob as YYYY-MM-DD). */
function serialize(p: Patient): PatientDTO {
  return {
    id: p.id,
    firstName: p.firstName,
    lastName: p.lastName,
    email: p.email,
    phoneNumber: p.phoneNumber,
    dob: p.dob.toISOString().slice(0, 10),
    createdAt: p.createdAt.toISOString(),
    updatedAt: p.updatedAt.toISOString(),
  };
}

const EMAIL_TAKEN = { email: "A patient with this email already exists." };

function isUniqueViolation(err: unknown): boolean {
  return err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2002";
}
function isRecordNotFound(err: unknown): boolean {
  return err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2025";
}

export async function listPatients(query: ListQuery): Promise<PatientListResponse> {
  const { page, limit, q, sort, order } = query;
  const where: Prisma.PatientWhereInput = q
    ? {
        OR: [
          { firstName: { contains: q, mode: "insensitive" } },
          { lastName: { contains: q, mode: "insensitive" } },
          { email: { contains: q, mode: "insensitive" } },
          { phoneNumber: { contains: q, mode: "insensitive" } },
        ],
      }
    : {};

  const [rows, total] = await prisma.$transaction([
    prisma.patient.findMany({
      where,
      orderBy: { [sort]: order } as Prisma.PatientOrderByWithRelationInput,
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.patient.count({ where }),
  ]);

  return { data: rows.map(serialize), page, limit, total };
}

export async function getPatient(id: string): Promise<PatientDTO> {
  const patient = await prisma.patient.findUnique({ where: { id } });
  if (!patient) throw new NotFoundError("Patient not found.");
  return serialize(patient);
}

export async function createPatient(
  input: PatientInput,
  creatorId: string
): Promise<PatientDTO> {
  try {
    const created = await prisma.patient.create({
      data: {
        firstName: input.firstName,
        lastName: input.lastName,
        email: input.email,
        phoneNumber: input.phoneNumber,
        dob: new Date(input.dob),
        createdById: creatorId,
      },
    });
    return serialize(created);
  } catch (err) {
    if (isUniqueViolation(err))
      throw new ConflictError("A patient with this email already exists.", EMAIL_TAKEN);
    throw err;
  }
}

export async function updatePatient(
  id: string,
  input: PatientInput
): Promise<PatientDTO> {
  try {
    const updated = await prisma.patient.update({
      where: { id },
      data: {
        firstName: input.firstName,
        lastName: input.lastName,
        email: input.email,
        phoneNumber: input.phoneNumber,
        dob: new Date(input.dob),
      },
    });
    return serialize(updated);
  } catch (err) {
    if (isRecordNotFound(err)) throw new NotFoundError("Patient not found.");
    if (isUniqueViolation(err))
      throw new ConflictError("A patient with this email already exists.", EMAIL_TAKEN);
    throw err;
  }
}

export async function deletePatient(id: string): Promise<void> {
  try {
    await prisma.patient.delete({ where: { id } });
  } catch (err) {
    if (isRecordNotFound(err)) throw new NotFoundError("Patient not found.");
    throw err;
  }
}
