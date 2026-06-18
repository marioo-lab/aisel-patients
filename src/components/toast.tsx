"use client";

import { toast } from "sonner";
import { CloseIcon } from "./icons";

type AiselToast = {
  title: string;
  msg: string;
  barColor?: string;
  hasUndo?: boolean;
  onUndo?: () => void;
};

export function showToast({ title, msg, barColor, hasUndo, onUndo }: AiselToast) {
  toast.custom(
    (id) => (
      <div className="flex w-[min(360px,calc(100vw-40px))] items-start gap-2.75 rounded-xl border border-border bg-surface px-3.5 py-3.25 shadow-(--shadow-lg)">
        <span
          className="mt-1.25 size-2 shrink-0 rounded-full"
          style={{ background: barColor || "var(--primary)" }}
        />
        <div className="min-w-0 flex-1">
          <div className="text-[13.5px] font-bold text-text">{title}</div>
          <div className="mt-px text-[12.5px] text-text-muted">{msg}</div>
        </div>
        {hasUndo && (
          <button
            onClick={() => {
              onUndo?.();
              toast.dismiss(id);
            }}
            className="shrink-0 rounded-md px-1.5 py-[3px] text-[13px] font-bold text-primary transition-colors hover:bg-primary-soft"
          >
            Undo
          </button>
        )}
        <button
          onClick={() => toast.dismiss(id)}
          aria-label="Dismiss"
          className="flex size-[22px] shrink-0 items-center justify-center rounded-md text-text-faint transition-colors hover:bg-row-hover hover:text-text"
        >
          <CloseIcon size={13} strokeWidth={2.3} />
        </button>
      </div>
    ),
    { duration: hasUndo ? 6000 : 4200, unstyled: true }
  );
}
