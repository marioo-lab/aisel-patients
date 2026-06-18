"use client";

import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { CloseIcon, EditIcon, TrashIcon } from "@/components/icons";
import { Skeleton } from "@/components/ui/skeleton";
import { usePatient } from "@/hooks/use-patients";
import { avatar, age, formatDob } from "@/lib/patient-display";
import type { PatientDTO } from "@/lib/validations/patient";

export function PatientViewSheet({
  open,
  patientId,
  canEdit,
  canDelete,
  isDark,
  onEdit,
  onDelete,
  onOpenChange,
}: {
  open: boolean;
  patientId: string | null;
  canEdit: boolean;
  canDelete: boolean;
  isDark: boolean;
  onEdit: (p: PatientDTO) => void;
  onDelete: (p: PatientDTO) => void;
  onOpenChange: (open: boolean) => void;
}) {
  const { patient, error, isLoading } = usePatient(open ? patientId : null);
  const av = patient ? avatar(patient, isDark) : null;

  const rows: [string, string, boolean][] = patient
    ? [
        ["Email", patient.email, false],
        ["Phone", patient.phoneNumber, true],
        ["Date of birth", formatDob(patient.dob), false],
        ["Age", `${age(patient.dob)} years`, true],
      ]
    : [];

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        showCloseButton={false}
        className="w-[min(440px,100vw)] max-w-none gap-0 border-l border-border bg-surface p-0"
      >
        <div className="flex items-center justify-between gap-3 border-b border-border px-5 py-[18px]">
          <SheetTitle className="m-0 text-[18px] font-[750] tracking-[-0.02em] text-text">
            {patient ? `${patient.firstName} ${patient.lastName}` : "Patient"}
          </SheetTitle>
          <SheetDescription className="sr-only">Patient details</SheetDescription>
          <button
            onClick={() => onOpenChange(false)}
            aria-label="Close"
            className="flex size-8 items-center justify-center rounded-[9px] text-text-muted transition-colors hover:bg-row-hover hover:text-text"
          >
            <CloseIcon size={18} strokeWidth={2} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-[22px]">
          {isLoading && <ViewSkeleton />}
          {error && !isLoading && (
            <div className="text-sm text-[#dc3838]">Couldn&apos;t load this patient.</div>
          )}
          {patient && av && (
            <>
              <div className="mb-6 flex items-center gap-3.5">
                <span
                  className="flex size-[58px] shrink-0 items-center justify-center rounded-full text-[21px] font-[750]"
                  style={{ background: av.bg, color: av.fg }}
                >
                  {av.initials}
                </span>
                <div className="min-w-0">
                  <div className="text-xl font-[750] tracking-[-0.02em]">
                    {patient.firstName} {patient.lastName}
                  </div>
                </div>
              </div>
              <div className="flex flex-col gap-0.5 overflow-hidden rounded-xl border border-border">
                {rows.map(([label, value, shaded]) => (
                  <div
                    key={label}
                    className={`flex justify-between gap-4 px-[15px] py-3.25 ${shaded ? "bg-surface-2" : ""}`}
                  >
                    <span className="text-[13px] font-[550] text-text-muted">{label}</span>
                    <span
                      className={`text-right text-[13.5px] font-semibold tabular-nums ${label === "Email" ? "break-all" : ""}`}
                    >
                      {value}
                    </span>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        {patient && (canEdit || canDelete) && (
          <div className="flex gap-2.5 border-t border-border px-5 py-4">
            {canDelete && (
              <button
                onClick={() => onDelete(patient)}
                className="flex h-[42px] shrink-0 items-center gap-1.75 rounded-[10px] border border-[color-mix(in_srgb,#dc3838_35%,transparent)] bg-surface px-4 text-sm font-semibold text-[#dc3838] transition hover:bg-[color-mix(in_srgb,#dc3838_10%,transparent)]"
              >
                <TrashIcon size={16} />
                Delete
              </button>
            )}
            {canEdit && (
              <button
                onClick={() => onEdit(patient)}
                className="flex h-[42px] flex-1 items-center justify-center gap-1.75 rounded-[10px] bg-primary text-sm font-[650] text-primary-fg transition hover:brightness-105"
              >
                <EditIcon size={16} />
                Edit patient
              </button>
            )}
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}

/** Loading placeholder that mirrors the detail layout (avatar + name + info rows). */
function ViewSkeleton() {
  return (
    <>
      <div className="mb-6 flex items-center gap-3.5">
        <Skeleton className="size-[58px] shrink-0 rounded-full" />
        <Skeleton className="h-5 w-40" />
      </div>
      <div className="flex flex-col gap-0.5 overflow-hidden rounded-xl border border-border">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="flex justify-between gap-4 px-[15px] py-3.25">
            <Skeleton className="h-[13px] w-[72px]" />
            <Skeleton className="h-[13px] w-[110px]" />
          </div>
        ))}
      </div>
    </>
  );
}
