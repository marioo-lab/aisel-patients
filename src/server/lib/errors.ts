import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { logger } from "./logger";

export type FieldErrors = Record<string, string>;

/** Base class for errors that map to a known HTTP status + stable code. */
export class AppError extends Error {
  constructor(
    readonly status: number,
    readonly code: string,
    message: string,
    readonly fieldErrors?: FieldErrors
  ) {
    super(message);
    this.name = new.target.name;
  }
}

export class UnauthenticatedError extends AppError {
  constructor(message = "Authentication required.") {
    super(401, "UNAUTHENTICATED", message);
  }
}

export class ForbiddenError extends AppError {
  constructor(message = "You don't have permission to do that.") {
    super(403, "FORBIDDEN", message);
  }
}

export class NotFoundError extends AppError {
  constructor(message = "Not found.") {
    super(404, "NOT_FOUND", message);
  }
}

export class ConflictError extends AppError {
  constructor(message: string, fieldErrors?: FieldErrors) {
    super(409, "CONFLICT", message, fieldErrors);
  }
}

export class ValidationError extends AppError {
  constructor(fieldErrors: FieldErrors, message = "Validation failed.") {
    super(400, "VALIDATION_ERROR", message, fieldErrors);
  }
}

/** Flatten a ZodError into `{ field: message }` for the form layer. */
export function fromZodError(err: ZodError): ValidationError {
  const fieldErrors: FieldErrors = {};
  for (const issue of err.issues) {
    const key = issue.path.join(".") || "_";
    if (!fieldErrors[key]) fieldErrors[key] = issue.message;
  }
  return new ValidationError(fieldErrors);
}

/**
 * Single place that turns any thrown error into the structured error envelope.
 * Known AppErrors map to their status; everything else is a logged 500.
 */
export function toErrorResponse(err: unknown): NextResponse {
  if (err instanceof AppError) {
    if (err.status >= 500) logger.error(err.message, { code: err.code });
    return NextResponse.json(
      {
        error: {
          code: err.code,
          message: err.message,
          ...(err.fieldErrors ? { fieldErrors: err.fieldErrors } : {}),
        },
      },
      { status: err.status }
    );
  }

  if (err instanceof ZodError) {
    return toErrorResponse(fromZodError(err));
  }

  logger.error("Unhandled error", {
    error: err instanceof Error ? err.message : String(err),
  });
  return NextResponse.json(
    { error: { code: "INTERNAL", message: "Something went wrong." } },
    { status: 500 }
  );
}
