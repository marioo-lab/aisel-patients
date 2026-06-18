"use client";

import * as React from "react";
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
      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
          gap: 11,
          background: "var(--surface)",
          border: "1px solid var(--border)",
          borderRadius: 12,
          boxShadow: "var(--shadow-lg)",
          padding: "13px 14px",
          width: "min(360px,calc(100vw - 40px))",
        }}
      >
        <span
          style={{
            width: 8,
            height: 8,
            borderRadius: "50%",
            background: barColor || "var(--primary)",
            marginTop: 5,
            flex: "none",
          }}
        />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 13.5, fontWeight: 700, color: "var(--text)" }}>
            {title}
          </div>
          <div style={{ fontSize: 12.5, color: "var(--text-muted)", marginTop: 1 }}>
            {msg}
          </div>
        </div>
        {hasUndo && (
          <button
            onClick={() => {
              onUndo?.();
              toast.dismiss(id);
            }}
            style={{
              flex: "none",
              fontSize: 13,
              fontWeight: 700,
              color: "var(--primary)",
              padding: "3px 6px",
              borderRadius: 6,
            }}
          >
            Undo
          </button>
        )}
        <button
          onClick={() => toast.dismiss(id)}
          aria-label="Dismiss"
          style={{
            flex: "none",
            width: 22,
            height: 22,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            borderRadius: 6,
            color: "var(--text-faint)",
          }}
        >
          <CloseIcon size={13} strokeWidth={2.3} />
        </button>
      </div>
    ),
    { duration: hasUndo ? 6000 : 4200, unstyled: true }
  );
}
