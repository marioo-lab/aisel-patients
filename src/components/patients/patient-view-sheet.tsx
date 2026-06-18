"use client";

import * as React from "react";
import { Sheet, SheetContent, SheetTitle, SheetDescription } from "@/components/ui/sheet";
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
            {patient ? `${patient.firstName} ${patient.lastName}` : "Patient"}
          </SheetTitle>
          <SheetDescription className="sr-only">Patient details</SheetDescription>
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

        <div style={{ flex: 1, overflowY: "auto", padding: "22px 20px" }}>
          {isLoading && <ViewSkeleton />}
          {error && !isLoading && (
            <div style={{ color: "#dc3838", fontSize: 14 }}>
              Couldn&apos;t load this patient.
            </div>
          )}
          {patient && av && (
            <>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 14,
                  marginBottom: 24,
                }}
              >
                <span
                  style={{
                    width: 58,
                    height: 58,
                    borderRadius: "50%",
                    background: av.bg,
                    color: av.fg,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 21,
                    fontWeight: 750,
                    flex: "none",
                  }}
                >
                  {av.initials}
                </span>
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontSize: 20, fontWeight: 750, letterSpacing: "-.02em" }}>
                    {patient.firstName} {patient.lastName}
                  </div>
                </div>
              </div>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 2,
                  border: "1px solid var(--border)",
                  borderRadius: 12,
                  overflow: "hidden",
                }}
              >
                {rows.map(([label, value, shaded]) => (
                  <div
                    key={label}
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      gap: 16,
                      padding: "13px 15px",
                      background: shaded ? "var(--surface-2)" : "transparent",
                    }}
                  >
                    <span
                      style={{
                        fontSize: 13,
                        color: "var(--text-muted)",
                        fontWeight: 550,
                      }}
                    >
                      {label}
                    </span>
                    <span
                      style={{
                        fontSize: 13.5,
                        fontWeight: 600,
                        textAlign: "right",
                        fontVariantNumeric: "tabular-nums",
                        wordBreak: label === "Email" ? "break-all" : "normal",
                      }}
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
          <div
            style={{
              display: "flex",
              gap: 10,
              padding: "16px 20px",
              borderTop: "1px solid var(--border)",
            }}
          >
            {canDelete && (
              <button
                onClick={() => onDelete(patient)}
                className="aisel-danger"
                style={{
                  flex: "none",
                  display: "flex",
                  alignItems: "center",
                  gap: 7,
                  height: 42,
                  padding: "0 16px",
                  borderRadius: 10,
                  border: "1px solid color-mix(in srgb,#dc3838 35%,transparent)",
                  color: "#dc3838",
                  fontWeight: 600,
                  fontSize: 14,
                  background: "var(--surface)",
                }}
              >
                <TrashIcon size={16} />
                Delete
              </button>
            )}
            {canEdit && (
              <button
                onClick={() => onEdit(patient)}
                className="aisel-primary"
                style={{
                  flex: 1,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 7,
                  height: 42,
                  borderRadius: 10,
                  background: "var(--primary)",
                  color: "var(--primary-fg)",
                  fontWeight: 650,
                  fontSize: 14,
                }}
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
      <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 24 }}>
        <Skeleton className="rounded-full" style={{ width: 58, height: 58, flex: "none" }} />
        <Skeleton style={{ height: 20, width: 160 }} />
      </div>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 2,
          border: "1px solid var(--border)",
          borderRadius: 12,
          overflow: "hidden",
        }}
      >
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            style={{
              display: "flex",
              justifyContent: "space-between",
              gap: 16,
              padding: "13px 15px",
            }}
          >
            <Skeleton style={{ height: 13, width: 72 }} />
            <Skeleton style={{ height: 13, width: 110 }} />
          </div>
        ))}
      </div>
    </>
  );
}
