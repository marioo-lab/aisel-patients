import { NextRequest, NextResponse } from "next/server";
import { listQuerySchema, patientInputSchema } from "@/lib/validations/patient";
import { listPatients, createPatient } from "@/server/patients/patient.service";
import { requirePermission } from "@/server/lib/session";
import { toErrorResponse } from "@/server/lib/errors";

export const runtime = "nodejs";

// GET /patients — list (admin or user)
export async function GET(req: NextRequest) {
  try {
    await requirePermission("patient:read");
    const query = listQuerySchema.parse(Object.fromEntries(req.nextUrl.searchParams));
    const result = await listPatients(query);
    return NextResponse.json(result);
  } catch (err) {
    return toErrorResponse(err);
  }
}

// POST /patients — create (admin only)
export async function POST(req: NextRequest) {
  try {
    const user = await requirePermission("patient:create");
    const body = await req.json().catch(() => ({}));
    const input = patientInputSchema.parse(body);
    const patient = await createPatient(input, user.id);
    return NextResponse.json(patient, { status: 201 });
  } catch (err) {
    return toErrorResponse(err);
  }
}
