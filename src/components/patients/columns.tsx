"use client";

import type { ColumnDef } from "@tanstack/react-table";
import type { PatientDTO } from "@/lib/validations/patient";
import { avatar, age, formatDob } from "@/lib/patient-display";
import { RowActions } from "./row-actions";

export type ColumnCallbacks = {
  canEdit: boolean;
  canDelete: boolean;
  isDark: boolean;
  onView: (p: PatientDTO) => void;
  onEdit: (p: PatientDTO) => void;
  onDelete: (p: PatientDTO) => void;
};

const muted = "overflow-hidden text-[13.5px] text-ellipsis whitespace-nowrap text-text-muted";

export function getColumns({
  canEdit,
  canDelete,
  isDark,
  onView,
  onEdit,
  onDelete,
}: ColumnCallbacks): ColumnDef<PatientDTO>[] {
  return [
    {
      id: "lastName",
      header: "Name",
      enableSorting: true,
      cell: ({ row }) => {
        const p = row.original;
        const av = avatar(p, isDark);
        return (
          <div className="flex min-w-0 items-center gap-2.75">
            <span
              className="flex size-8 shrink-0 items-center justify-center rounded-full text-xs font-bold"
              style={{ background: av.bg, color: av.fg }}
            >
              {av.initials}
            </span>
            <span className="overflow-hidden text-sm font-semibold text-ellipsis whitespace-nowrap">
              {p.firstName} {p.lastName}
            </span>
          </div>
        );
      },
    },
    {
      id: "email",
      header: "Email",
      enableSorting: true,
      cell: ({ row }) => <div className={muted}>{row.original.email}</div>,
    },
    {
      id: "phoneNumber",
      header: "Phone",
      enableSorting: false,
      cell: ({ row }) => (
        <div className={`${muted} tabular-nums`}>{row.original.phoneNumber}</div>
      ),
    },
    {
      id: "dob",
      header: "Date of birth",
      enableSorting: true,
      cell: ({ row }) => (
        <div className={`${muted} tabular-nums`}>{formatDob(row.original.dob)}</div>
      ),
    },
    {
      id: "age",
      header: "Age",
      enableSorting: false,
      meta: { align: "right" },
      cell: ({ row }) => (
        <div className={`${muted} text-right tabular-nums`}>{age(row.original.dob)}</div>
      ),
    },
    {
      id: "actions",
      header: "",
      enableSorting: false,
      cell: ({ row }) => (
        <div className="flex justify-end">
          <RowActions
            canEdit={canEdit}
            canDelete={canDelete}
            onView={() => onView(row.original)}
            onEdit={() => onEdit(row.original)}
            onDelete={() => onDelete(row.original)}
          />
        </div>
      ),
    },
  ];
}
