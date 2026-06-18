import { NextRequest, NextResponse } from "next/server";
import { patientInputSchema } from "@/lib/validations/patient";
import {
  getPatient,
  updatePatient,
  deletePatient,
} from "@/server/patients/patient.service";
import { requirePermission } from "@/server/lib/session";
import { toErrorResponse } from "@/server/lib/errors";

export const runtime = "nodejs";

type Ctx = { params: Promise<{ id: string }> };

// GET /patients/:id — read (admin or user)
export async function GET(_req: NextRequest, { params }: Ctx) {
  try {
    await requirePermission("patient:read");
    const { id } = await params;
    const patient = await getPatient(id);
    return NextResponse.json(patient);
  } catch (err) {
    return toErrorResponse(err);
  }
}

// PUT /patients/:id — update (admin only)
export async function PUT(req: NextRequest, { params }: Ctx) {
  try {
    await requirePermission("patient:update");
    const { id } = await params;
    const body = await req.json().catch(() => ({}));
    const input = patientInputSchema.parse(body);
    const patient = await updatePatient(id, input);
    return NextResponse.json(patient);
  } catch (err) {
    return toErrorResponse(err);
  }
}

// DELETE /patients/:id — delete (admin only)
export async function DELETE(_req: NextRequest, { params }: Ctx) {
  try {
    await requirePermission("patient:delete");
    const { id } = await params;
    await deletePatient(id);
    return NextResponse.json({ ok: true });
  } catch (err) {
    return toErrorResponse(err);
  }
}
