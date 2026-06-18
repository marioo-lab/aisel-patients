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

const iconBtn =
  "flex size-8.5 items-center justify-center rounded-[9px] border border-border text-text-muted transition-colors hover:bg-row-hover hover:text-text";

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
    <header className="sticky top-0 z-40 flex h-15 items-center justify-between gap-3.5 border-b border-border bg-[color-mix(in_srgb,var(--surface)_88%,transparent)] px-5 backdrop-blur-[10px] max-sm:gap-2 max-sm:px-3">
      <div className="flex min-w-0 items-center gap-2.5">
        <div className="flex size-8 shrink-0 items-center justify-center rounded-[9px] bg-primary">
          <PlusIcon size={17} className="text-primary-fg" />
        </div>
        <span className="text-[15.5px] font-extrabold tracking-[-0.02em] whitespace-nowrap max-sm:hidden">
          {APP_NAME}
        </span>
      </div>

      <div className="flex items-center gap-2">
        <span className="inline-flex h-7 items-center gap-1.5 rounded-full border border-[color-mix(in_srgb,var(--primary)_22%,transparent)] bg-primary-soft px-2.75 text-xs font-[650] text-primary">
          <span className="size-1.5 rounded-full bg-primary" />
          {isAdmin ? "Admin" : "Member"}
        </span>

        <button
          onClick={() => setTheme(isDark ? "light" : "dark")}
          aria-label="Toggle theme"
          className={iconBtn}
        >
          {mounted && isDark ? <SunIcon size={17} /> : <MoonIcon size={17} />}
        </button>

        <div className="mx-0.5 h-6 w-px bg-border" />

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex h-9.5 items-center gap-2 rounded-[10px] pr-2 pl-1 transition-colors hover:bg-row-hover">
              <span className="flex size-7.5 items-center justify-center rounded-full bg-primary-soft text-xs font-bold text-primary">
                {initials(user.name)}
              </span>
              <span className="max-w-30 overflow-hidden text-[13.5px] font-semibold text-ellipsis whitespace-nowrap max-sm:hidden">
                {user.name}
              </span>
              <ChevronDownIcon size={14} className="text-text-faint" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="end"
            sideOffset={8}
            className="w-59 rounded-[13px] border border-border bg-popover p-2 shadow-(--shadow-lg) ring-0"
          >
            <div className="mb-1.5 border-b border-border px-2.25 pt-2 pb-2.5">
              <div className="text-[13.5px] font-bold">{user.name}</div>
              <div className="overflow-hidden text-xs text-ellipsis text-text-muted">
                {user.email}
              </div>
            </div>
            <DropdownMenuItem
              variant="destructive"
              onSelect={signOut}
              className="gap-2.5 rounded-[9px] px-2.25 py-2.25 text-[13.5px] font-[550]"
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
