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
        className="w-[min(412px,94vw)] max-w-none gap-0 rounded-2xl border border-border bg-surface p-6 shadow-(--shadow-lg) ring-0"
      >
        <div className="mb-[15px] flex size-[46px] items-center justify-center rounded-xl bg-[color-mix(in_srgb,#dc3838_13%,var(--surface))]">
          <TrashIcon size={22} className="text-[#dc3838]" />
        </div>
        <DialogTitle className="mb-[7px] text-[18px] font-[750] text-text">
          Delete patient?
        </DialogTitle>
        <DialogDescription className="mb-[22px] text-sm leading-[1.5] text-text-muted">
          This will permanently remove{" "}
          <strong className="font-[650] text-text">{patientName}</strong> from the directory.
          This action cannot be undone.
        </DialogDescription>
        <div className="flex justify-end gap-2.5">
          <button
            onClick={() => onOpenChange(false)}
            className="h-10 rounded-[10px] border border-border-strong bg-surface px-4 text-sm font-semibold transition hover:bg-row-hover"
          >
            Cancel
          </button>
          <button
            onClick={confirm}
            disabled={busy}
            className="h-10 rounded-[10px] bg-[#dc3838] px-[18px] text-sm font-[650] text-white transition hover:brightness-105 disabled:opacity-85"
          >
            Delete
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
