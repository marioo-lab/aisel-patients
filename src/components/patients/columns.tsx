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

const muted: React.CSSProperties = {
  fontSize: 13.5,
  color: "var(--text-muted)",
  overflow: "hidden",
  textOverflow: "ellipsis",
  whiteSpace: "nowrap",
};

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
          <div style={{ display: "flex", alignItems: "center", gap: 11, minWidth: 0 }}>
            <span
              style={{
                width: 32,
                height: 32,
                borderRadius: "50%",
                background: av.bg,
                color: av.fg,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 12,
                fontWeight: 700,
                flex: "none",
              }}
            >
              {av.initials}
            </span>
            <span
              style={{
                fontSize: 14,
                fontWeight: 600,
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
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
      cell: ({ row }) => <div style={muted}>{row.original.email}</div>,
    },
    {
      id: "phoneNumber",
      header: "Phone",
      enableSorting: false,
      cell: ({ row }) => (
        <div style={{ ...muted, fontVariantNumeric: "tabular-nums" }}>
          {row.original.phoneNumber}
        </div>
      ),
    },
    {
      id: "dob",
      header: "Date of birth",
      enableSorting: true,
      cell: ({ row }) => (
        <div style={{ ...muted, fontVariantNumeric: "tabular-nums" }}>
          {formatDob(row.original.dob)}
        </div>
      ),
    },
    {
      id: "age",
      header: "Age",
      enableSorting: false,
      meta: { align: "right" },
      cell: ({ row }) => (
        <div style={{ ...muted, textAlign: "right", fontVariantNumeric: "tabular-nums" }}>
          {age(row.original.dob)}
        </div>
      ),
    },
    {
      id: "actions",
      header: "",
      enableSorting: false,
      cell: ({ row }) => (
        <div style={{ display: "flex", justifyContent: "flex-end" }}>
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
