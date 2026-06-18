"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Sheet, SheetContent, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { CloseIcon } from "@/components/icons";
import { ApiError } from "@/lib/api-error";
import {
  patientInputSchema,
  type PatientInput,
  type PatientDTO,
} from "@/lib/validations/patient";

const labelStyle: React.CSSProperties = {
  display: "block",
  fontSize: 12.5,
  fontWeight: 600,
  color: "var(--text-muted)",
  marginBottom: 6,
};

const errStyle: React.CSSProperties = {
  fontSize: 12,
  color: "#dc3838",
  marginTop: 5,
  fontWeight: 500,
};

const emptyDefaults: PatientInput = {
  firstName: "",
  lastName: "",
  email: "",
  phoneNumber: "",
  dob: "",
};

export function PatientFormSheet({
  open,
  mode,
  patient,
  onSubmit,
  onOpenChange,
}: {
  open: boolean;
  mode: "create" | "edit";
  patient: PatientDTO | null;
  onSubmit: (input: PatientInput) => Promise<void>;
  onOpenChange: (open: boolean) => void;
}) {
  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<PatientInput>({
    resolver: zodResolver(patientInputSchema),
    defaultValues: emptyDefaults,
  });

  // Re-seed the form whenever the sheet opens for a different record/mode.
  React.useEffect(() => {
    if (!open) return;
    reset(
      mode === "edit" && patient
        ? {
            firstName: patient.firstName,
            lastName: patient.lastName,
            email: patient.email,
            phoneNumber: patient.phoneNumber,
            dob: patient.dob,
          }
        : emptyDefaults
    );
  }, [open, mode, patient, reset]);

  const submit = handleSubmit(async (values) => {
    try {
      await onSubmit(values);
      onOpenChange(false);
    } catch (err) {
      if (err instanceof ApiError && err.fieldErrors) {
        for (const [field, message] of Object.entries(err.fieldErrors)) {
          setError(field as keyof PatientInput, { message });
        }
      }
      // non-field errors are surfaced as toasts by the caller
    }
  });

  const todayISO = new Date().toISOString().slice(0, 10);
  const title = mode === "edit" ? "Edit patient" : "New patient";
  const submitLabel = mode === "edit" ? "Save changes" : "Create patient";

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        showCloseButton={false}
        className="w-[min(440px,100vw)] max-w-none gap-0 p-0 bg-surface border-l border-border"
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 12,
            padding: "18px 20px",
            borderBottom: "1px solid var(--border)",
          }}
        >
          <SheetTitle
            style={{
              margin: 0,
              fontSize: 18,
              fontWeight: 750,
              letterSpacing: "-.02em",
              color: "var(--text)",
            }}
          >
            {title}
          </SheetTitle>
          <SheetDescription className="sr-only">
            {mode === "edit"
              ? "Edit this patient's details."
              : "Create a new patient record."}
          </SheetDescription>
          <button
            onClick={() => onOpenChange(false)}
            aria-label="Close"
            className="aisel-ghost"
            style={{
              width: 32,
              height: 32,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              borderRadius: 9,
              color: "var(--text-muted)",
            }}
          >
            <CloseIcon size={18} strokeWidth={2} />
          </button>
        </div>

        <form
          onSubmit={submit}
          style={{ flex: 1, display: "flex", flexDirection: "column", minHeight: 0 }}
        >
          <div
            style={{
              flex: 1,
              overflowY: "auto",
              padding: "22px 20px",
              display: "flex",
              flexDirection: "column",
              gap: 16,
            }}
          >
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
              <div>
                <label htmlFor="firstName" style={labelStyle}>
                  First name
                </label>
                <input
                  id="firstName"
                  className="aisel-input"
                  aria-invalid={!!errors.firstName}
                  placeholder="Jane"
                  {...register("firstName")}
                />
                {errors.firstName && (
                  <div style={errStyle}>{errors.firstName.message}</div>
                )}
              </div>
              <div>
                <label htmlFor="lastName" style={labelStyle}>
                  Last name
                </label>
                <input
                  id="lastName"
                  className="aisel-input"
                  aria-invalid={!!errors.lastName}
                  placeholder="Doe"
                  {...register("lastName")}
                />
                {errors.lastName && <div style={errStyle}>{errors.lastName.message}</div>}
              </div>
            </div>
            <div>
              <label htmlFor="email" style={labelStyle}>
                Email
              </label>
              <input
                id="email"
                type="email"
                className="aisel-input"
                aria-invalid={!!errors.email}
                placeholder="jane.doe@email.com"
                {...register("email")}
              />
              {errors.email && <div style={errStyle}>{errors.email.message}</div>}
            </div>
            <div>
              <label htmlFor="phoneNumber" style={labelStyle}>
                Phone number
              </label>
              <input
                id="phoneNumber"
                className="aisel-input"
                aria-invalid={!!errors.phoneNumber}
                placeholder="(555) 123-4567"
                {...register("phoneNumber")}
              />
              {errors.phoneNumber && (
                <div style={errStyle}>{errors.phoneNumber.message}</div>
              )}
            </div>
            <div>
              <label htmlFor="dob" style={labelStyle}>
                Date of birth
              </label>
              <input
                id="dob"
                type="date"
                max={todayISO}
                className="aisel-input"
                aria-invalid={!!errors.dob}
                style={{ fontVariantNumeric: "tabular-nums" }}
                {...register("dob")}
              />
              {errors.dob && <div style={errStyle}>{errors.dob.message}</div>}
            </div>
          </div>
          <div
            style={{
              display: "flex",
              gap: 10,
              padding: "16px 20px",
              borderTop: "1px solid var(--border)",
            }}
          >
            <button
              type="button"
              onClick={() => onOpenChange(false)}
              className="aisel-outline"
              style={{
                flex: 1,
                height: 42,
                borderRadius: 10,
                border: "1px solid var(--border-strong)",
                fontWeight: 600,
                fontSize: 14,
                background: "var(--surface)",
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="aisel-primary"
              style={{
                flex: 1,
                height: 42,
                borderRadius: 10,
                background: "var(--primary)",
                color: "var(--primary-fg)",
                fontWeight: 650,
                fontSize: 14,
                opacity: isSubmitting ? 0.85 : 1,
              }}
            >
              {submitLabel}
            </button>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  );
}
