"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import { api } from "@/lib/api-client";
import { initials } from "@/lib/patient-display";
import {
  PlusIcon,
  SunIcon,
  MoonIcon,
  ChevronDownIcon,
  LogoutIcon,
} from "@/components/icons";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";

const APP_NAME = "Aisel Patients";

const iconBtn: React.CSSProperties = {
  width: 34,
  height: 34,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  borderRadius: 9,
  color: "var(--text-muted)",
  border: "1px solid var(--border)",
};

export function Topbar({
  user,
}: {
  user: { email: string; name: string; role: "admin" | "user" };
}) {
  const router = useRouter();
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => setMounted(true), []);
  const isDark = resolvedTheme === "dark";
  const isAdmin = user.role === "admin";

  async function signOut() {
    try {
      await api.logout();
    } finally {
      router.replace("/login");
      router.refresh();
    }
  }

  return (
    <header
      style={{
        position: "sticky",
        top: 0,
        zIndex: 40,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 14,
        height: 60,
        padding: "0 20px",
        background: "color-mix(in srgb,var(--surface) 88%,transparent)",
        backdropFilter: "blur(10px)",
        borderBottom: "1px solid var(--border)",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 10, minWidth: 0 }}>
        <div
          style={{
            width: 32,
            height: 32,
            borderRadius: 9,
            background: "var(--primary)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flex: "none",
          }}
        >
          <PlusIcon size={17} style={{ stroke: "var(--primary-fg)" }} />
        </div>
        <span
          style={{
            fontWeight: 800,
            fontSize: 15.5,
            letterSpacing: "-.02em",
            whiteSpace: "nowrap",
          }}
        >
          {APP_NAME}
        </span>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <span
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            height: 28,
            padding: "0 11px",
            borderRadius: 999,
            fontSize: 12,
            fontWeight: 650,
            background: "var(--primary-soft)",
            color: "var(--primary)",
            border: "1px solid color-mix(in srgb,var(--primary) 22%,transparent)",
          }}
        >
          <span
            style={{
              width: 6,
              height: 6,
              borderRadius: "50%",
              background: "var(--primary)",
            }}
          />
          {isAdmin ? "Admin" : "Member"}
        </span>

        <button
          onClick={() => setTheme(isDark ? "light" : "dark")}
          aria-label="Toggle theme"
          className="aisel-ghost"
          style={iconBtn}
        >
          {mounted && isDark ? <SunIcon size={17} /> : <MoonIcon size={17} />}
        </button>

        <div
          style={{ width: 1, height: 24, background: "var(--border)", margin: "0 2px" }}
        />

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              className="aisel-ghost"
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                height: 38,
                padding: "0 8px 0 4px",
                borderRadius: 10,
              }}
            >
              <span
                style={{
                  width: 30,
                  height: 30,
                  borderRadius: "50%",
                  background: "var(--primary-soft)",
                  color: "var(--primary)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 12,
                  fontWeight: 700,
                }}
              >
                {initials(user.name)}
              </span>
              <span
                style={{
                  fontSize: 13.5,
                  fontWeight: 600,
                  maxWidth: 120,
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {user.name}
              </span>
              <ChevronDownIcon size={14} style={{ stroke: "var(--text-faint)" }} />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="end"
            sideOffset={8}
            className="w-59 border border-border bg-popover shadow-(--shadow-lg) ring-0 rounded-[13px] p-2"
          >
            <div
              style={{
                padding: "8px 9px 10px",
                borderBottom: "1px solid var(--border)",
                marginBottom: 6,
              }}
            >
              <div style={{ fontSize: 13.5, fontWeight: 700 }}>{user.name}</div>
              <div
                style={{
                  fontSize: 12,
                  color: "var(--text-muted)",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
              >
                {user.email}
              </div>
            </div>
            <DropdownMenuItem
              variant="destructive"
              onSelect={signOut}
              className="rounded-[9px] px-2.25 py-2.25 text-[13.5px] font-[550] gap-2.5"
            >
              <LogoutIcon size={16} />
              Sign out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
