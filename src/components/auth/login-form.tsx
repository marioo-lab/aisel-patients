"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api-client";
import { ApiError } from "@/lib/api-error";
import { PlusIcon, EyeIcon, AlertCircleIcon } from "@/components/icons";

const APP_NAME = "Aisel Patients";

const inputBase =
  "h-[42px] w-full rounded-[10px] border border-border-strong bg-surface text-[14.5px] outline-none transition focus:border-primary focus:shadow-[0_0_0_3px_var(--ring)]";
const fieldLabel = "block text-[12.5px] font-semibold text-text-muted";
const demoCard =
  "rounded-[11px] border border-border bg-surface-2 px-3 py-2.75 text-left transition hover:border-primary hover:bg-primary-soft";

export function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [showPw, setShowPw] = React.useState(false);
  const [error, setError] = React.useState("");
  const [submitting, setSubmitting] = React.useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const em = email.trim();
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(em)) {
      setError("Enter a valid email address.");
      return;
    }
    if (!password) {
      setError("Password is required.");
      return;
    }
    setError("");
    setSubmitting(true);
    try {
      await api.login(em, password);
      router.replace("/patients");
      router.refresh();
    } catch (err) {
      setError(
        err instanceof ApiError ? err.message : "Something went wrong. Try again."
      );
      setSubmitting(false);
    }
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden p-6">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(900px_480px_at_80%_-10%,var(--primary-soft),transparent_70%)]" />
      <div className="relative w-[min(424px,94vw)] rounded-[18px] border border-border bg-surface px-[34px] py-[38px] shadow-(--shadow-lg) [animation:aiselFadeUp_.45s_cubic-bezier(.2,.8,.2,1)]">
        <div className="mb-[26px] flex items-center gap-[11px]">
          <div className="flex size-[38px] items-center justify-center rounded-[11px] bg-primary shadow-[0_4px_12px_var(--ring)]">
            <PlusIcon size={20} className="text-primary-fg" />
          </div>
          <div className="flex flex-col leading-[1.05]">
            <span className="text-[17px] font-extrabold tracking-[-0.02em]">{APP_NAME}</span>
            <span className="text-xs font-medium text-text-faint">Patient Management</span>
          </div>
        </div>
        <h1 className="mb-1 text-[23px] font-bold tracking-[-0.02em]">
          Sign in to your workspace
        </h1>
        <p className="mb-[22px] text-sm text-text-muted">
          Use a demo account below to explore both roles.
        </p>

        {error && (
          <div
            role="alert"
            className="mb-4 flex items-start gap-2 rounded-[10px] border border-[color-mix(in_srgb,#dc3838_30%,transparent)] bg-[color-mix(in_srgb,#dc3838_12%,var(--surface))] px-3 py-[9px] text-[13px] font-medium text-[#c62f2f]"
          >
            <AlertCircleIcon size={16} className="mt-px shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={onSubmit}>
          <label htmlFor="email" className={`${fieldLabel} mb-1.5`}>
            Email
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              setError("");
            }}
            placeholder="you@aisel.health"
            autoComplete="username"
            className={`${inputBase} px-[13px]`}
          />
          <label htmlFor="password" className={`${fieldLabel} mt-[15px] mb-1.5`}>
            Password
          </label>
          <div className="relative">
            <input
              id="password"
              type={showPw ? "text" : "password"}
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setError("");
              }}
              placeholder="••••••••"
              autoComplete="current-password"
              className={`${inputBase} pr-[42px] pl-[13px]`}
            />
            <button
              type="button"
              onClick={() => setShowPw((v) => !v)}
              aria-label="Toggle password visibility"
              className="absolute top-1.5 right-1.5 flex size-7.5 items-center justify-center rounded-lg text-text-faint transition-colors hover:bg-row-hover hover:text-text-muted"
            >
              <EyeIcon size={17} />
            </button>
          </div>
          <button
            type="submit"
            disabled={submitting}
            className="mt-[22px] flex h-11 w-full items-center justify-center gap-2.25 rounded-[10px] bg-primary text-[14.5px] font-[650] text-primary-fg shadow-[0_4px_12px_var(--ring)] transition hover:brightness-105 active:translate-y-px disabled:opacity-85"
          >
            {submitting && (
              <span className="size-4 rounded-full border-2 border-[color-mix(in_srgb,var(--primary-fg)_40%,transparent)] border-t-primary-fg [animation:aiselSpin_.7s_linear_infinite]" />
            )}
            <span>{submitting ? "Signing in…" : "Sign in"}</span>
          </button>
        </form>

        <div className="mt-[22px] mb-3.5 flex items-center gap-3">
          <div className="h-px flex-1 bg-border" />
          <span className="text-[11.5px] font-semibold tracking-[0.04em] text-text-faint uppercase">
            Demo accounts
          </span>
          <div className="h-px flex-1 bg-border" />
        </div>
        <div className="grid grid-cols-2 gap-2.5">
          <button
            type="button"
            className={demoCard}
            onClick={() => {
              setEmail("admin@aisel.health");
              setPassword("aisel1234");
              setError("");
            }}
          >
            <div className="text-[13px] font-bold">Admin</div>
            <div className="text-[11.5px] text-text-muted">Full access</div>
          </button>
          <button
            type="button"
            className={demoCard}
            onClick={() => {
              setEmail("user@aisel.health");
              setPassword("aisel1234");
              setError("");
            }}
          >
            <div className="text-[13px] font-bold">Member</div>
            <div className="text-[11.5px] text-text-muted">View only</div>
          </button>
        </div>
      </div>
    </div>
  );
}
