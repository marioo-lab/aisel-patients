"use client";

import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { TrashIcon } from "@/components/icons";

export function DeleteDialog({
  open,
  patientName,
  onConfirm,
  onOpenChange,
}: {
  open: boolean;
  patientName: string;
  onConfirm: () => void | Promise<void>;
  onOpenChange: (open: boolean) => void;
}) {
  const [busy, setBusy] = React.useState(false);

  async function confirm() {
    setBusy(true);
    try {
      await onConfirm();
    } finally {
      setBusy(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        className="w-[min(412px,94vw)] max-w-none gap-0 rounded-2xl border border-border bg-surface p-6 ring-0 shadow-(--shadow-lg)"
      >
        <div
          style={{
            width: 46,
            height: 46,
            borderRadius: 12,
            background: "color-mix(in srgb,#dc3838 13%,var(--surface))",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            marginBottom: 15,
          }}
        >
          <TrashIcon size={22} style={{ stroke: "#dc3838" }} />
        </div>
        <DialogTitle
          style={{
            margin: "0 0 7px",
            fontSize: 18,
            fontWeight: 750,
            color: "var(--text)",
          }}
        >
          Delete patient?
        </DialogTitle>
        <DialogDescription
          style={{
            margin: "0 0 22px",
            color: "var(--text-muted)",
            fontSize: 14,
            lineHeight: 1.5,
          }}
        >
          This will permanently remove{" "}
          <strong style={{ color: "var(--text)", fontWeight: 650 }}>{patientName}</strong>{" "}
          from the directory. This action cannot be undone.
        </DialogDescription>
        <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
          <button
            onClick={() => onOpenChange(false)}
            className="aisel-outline"
            style={{
              height: 40,
              padding: "0 16px",
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
            onClick={confirm}
            disabled={busy}
            className="aisel-primary"
            style={{
              height: 40,
              padding: "0 18px",
              borderRadius: 10,
              background: "#dc3838",
              color: "#fff",
              fontWeight: 650,
              fontSize: 14,
              opacity: busy ? 0.85 : 1,
            }}
          >
            Delete
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
