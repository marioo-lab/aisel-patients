"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { CloseIcon } from "@/components/icons";
import { ApiError } from "@/lib/api-error";
import {
  patientInputSchema,
  type PatientInput,
  type PatientDTO,
} from "@/lib/validations/patient";

const labelCls = "mb-1.5 block text-[12.5px] font-semibold text-text-muted";
const errCls = "mt-1.25 text-xs font-medium text-[#dc3838]";

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
        className="w-[min(440px,100vw)] max-w-none gap-0 border-l border-border bg-surface p-0"
      >
        <div className="flex items-center justify-between gap-3 border-b border-border px-5 py-[18px]">
          <SheetTitle className="m-0 text-[18px] font-[750] tracking-[-0.02em] text-text">
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
            className="flex size-8 items-center justify-center rounded-[9px] text-text-muted transition-colors hover:bg-row-hover hover:text-text"
          >
            <CloseIcon size={18} strokeWidth={2} />
          </button>
        </div>

        <form onSubmit={submit} className="flex min-h-0 flex-1 flex-col">
          <div className="flex flex-1 flex-col gap-4 overflow-y-auto px-5 py-[22px]">
            <div className="grid grid-cols-2 gap-3.5">
              <div>
                <label htmlFor="firstName" className={labelCls}>
                  First name
                </label>
                <input
                  id="firstName"
                  className="aisel-input"
                  aria-invalid={!!errors.firstName}
                  placeholder="Jane"
                  {...register("firstName")}
                />
                {errors.firstName && <div className={errCls}>{errors.firstName.message}</div>}
              </div>
              <div>
                <label htmlFor="lastName" className={labelCls}>
                  Last name
                </label>
                <input
                  id="lastName"
                  className="aisel-input"
                  aria-invalid={!!errors.lastName}
                  placeholder="Doe"
                  {...register("lastName")}
                />
                {errors.lastName && <div className={errCls}>{errors.lastName.message}</div>}
              </div>
            </div>
            <div>
              <label htmlFor="email" className={labelCls}>
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
              {errors.email && <div className={errCls}>{errors.email.message}</div>}
            </div>
            <div>
              <label htmlFor="phoneNumber" className={labelCls}>
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
                <div className={errCls}>{errors.phoneNumber.message}</div>
              )}
            </div>
            <div>
              <label htmlFor="dob" className={labelCls}>
                Date of birth
              </label>
              <input
                id="dob"
                type="date"
                max={todayISO}
                className="aisel-input tabular-nums"
                aria-invalid={!!errors.dob}
                {...register("dob")}
              />
              {errors.dob && <div className={errCls}>{errors.dob.message}</div>}
            </div>
          </div>
          <div className="flex gap-2.5 border-t border-border px-5 py-4">
            <button
              type="button"
              onClick={() => onOpenChange(false)}
              className="h-[42px] flex-1 rounded-[10px] border border-border-strong bg-surface text-sm font-semibold transition hover:bg-row-hover"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="h-[42px] flex-1 rounded-[10px] bg-primary text-sm font-[650] text-primary-fg transition hover:brightness-105 disabled:opacity-85"
            >
              {submitLabel}
            </button>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  );
}
