"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api-client";
import { ApiError } from "@/lib/api-error";
import { PlusIcon, EyeIcon, AlertCircleIcon } from "@/components/icons";

const APP_NAME = "Aisel Patients";

const inputStyle: React.CSSProperties = {
  width: "100%",
  height: 42,
  padding: "0 13px",
  border: "1px solid var(--border-strong)",
  borderRadius: 10,
  background: "var(--surface)",
  outline: "none",
  fontSize: 14.5,
  transition: "box-shadow .15s,border-color .15s",
};

function focusRing(e: React.FocusEvent<HTMLInputElement>, on: boolean) {
  e.currentTarget.style.borderColor = on ? "var(--primary)" : "var(--border-strong)";
  e.currentTarget.style.boxShadow = on ? "0 0 0 3px var(--ring)" : "none";
}

const demoBtnStyle: React.CSSProperties = {
  textAlign: "left",
  border: "1px solid var(--border)",
  borderRadius: 11,
  padding: "11px 12px",
  background: "var(--surface-2)",
  transition: "border-color .15s,background .15s",
};

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
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 24,
        position: "relative",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "radial-gradient(900px 480px at 80% -10%,var(--primary-soft),transparent 70%)",
          pointerEvents: "none",
        }}
      />
      <div
        style={{
          position: "relative",
          width: "min(424px,94vw)",
          background: "var(--surface)",
          border: "1px solid var(--border)",
          borderRadius: 18,
          boxShadow: "var(--shadow-lg)",
          padding: "38px 34px",
          animation: "aiselFadeUp .45s cubic-bezier(.2,.8,.2,1)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 11, marginBottom: 26 }}>
          <div
            style={{
              width: 38,
              height: 38,
              borderRadius: 11,
              background: "var(--primary)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 4px 12px var(--ring)",
            }}
          >
            <PlusIcon size={20} style={{ stroke: "var(--primary-fg)" }} />
          </div>
          <div style={{ display: "flex", flexDirection: "column", lineHeight: 1.05 }}>
            <span style={{ fontWeight: 800, fontSize: 17, letterSpacing: "-.02em" }}>
              {APP_NAME}
            </span>
            <span style={{ fontSize: 12, color: "var(--text-faint)", fontWeight: 500 }}>
              Patient Management
            </span>
          </div>
        </div>
        <h1
          style={{
            margin: "0 0 4px",
            fontSize: 23,
            fontWeight: 700,
            letterSpacing: "-.02em",
          }}
        >
          Sign in to your workspace
        </h1>
        <p style={{ margin: "0 0 22px", color: "var(--text-muted)", fontSize: 14 }}>
          Use a demo account below to explore both roles.
        </p>

        {error && (
          <div
            role="alert"
            style={{
              display: "flex",
              gap: 8,
              alignItems: "flex-start",
              background: "color-mix(in srgb,#dc3838 12%,var(--surface))",
              border: "1px solid color-mix(in srgb,#dc3838 30%,transparent)",
              color: "#c62f2f",
              borderRadius: 10,
              padding: "9px 12px",
              fontSize: 13,
              marginBottom: 16,
              fontWeight: 500,
            }}
          >
            <AlertCircleIcon size={16} style={{ flex: "none", marginTop: 1 }} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={onSubmit}>
          <label htmlFor="email" style={labelStyle}>
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
            style={inputStyle}
            onFocus={(e) => focusRing(e, true)}
            onBlur={(e) => focusRing(e, false)}
          />
          <label htmlFor="password" style={{ ...labelStyle, margin: "15px 0 6px" }}>
            Password
          </label>
          <div style={{ position: "relative" }}>
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
              style={{ ...inputStyle, padding: "0 42px 0 13px" }}
              onFocus={(e) => focusRing(e, true)}
              onBlur={(e) => focusRing(e, false)}
            />
            <button
              type="button"
              onClick={() => setShowPw((v) => !v)}
              aria-label="Toggle password visibility"
              className="aisel-ghost"
              style={{
                position: "absolute",
                right: 6,
                top: 6,
                width: 30,
                height: 30,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                borderRadius: 8,
                color: "var(--text-faint)",
              }}
            >
              <EyeIcon size={17} />
            </button>
          </div>
          <button
            type="submit"
            disabled={submitting}
            className="aisel-primary"
            style={{
              marginTop: 22,
              width: "100%",
              height: 44,
              borderRadius: 10,
              background: "var(--primary)",
              color: "var(--primary-fg)",
              fontWeight: 650,
              fontSize: 14.5,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 9,
              boxShadow: "0 4px 12px var(--ring)",
              transition: "filter .15s,transform .06s",
              opacity: submitting ? 0.85 : 1,
            }}
          >
            {submitting && (
              <span
                style={{
                  width: 16,
                  height: 16,
                  borderRadius: "50%",
                  border:
                    "2px solid color-mix(in srgb,var(--primary-fg) 40%,transparent)",
                  borderTopColor: "var(--primary-fg)",
                  animation: "aiselSpin .7s linear infinite",
                }}
              />
            )}
            <span>{submitting ? "Signing in…" : "Sign in"}</span>
          </button>
        </form>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            margin: "22px 0 14px",
          }}
        >
          <div style={{ flex: 1, height: 1, background: "var(--border)" }} />
          <span
            style={{
              fontSize: 11.5,
              fontWeight: 600,
              letterSpacing: ".04em",
              textTransform: "uppercase",
              color: "var(--text-faint)",
            }}
          >
            Demo accounts
          </span>
          <div style={{ flex: 1, height: 1, background: "var(--border)" }} />
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          <button
            type="button"
            className="aisel-demo-card"
            onClick={() => {
              setEmail("admin@aisel.health");
              setPassword("aisel1234");
              setError("");
            }}
            style={demoBtnStyle}
          >
            <div style={{ fontSize: 13, fontWeight: 700 }}>Admin</div>
            <div style={{ fontSize: 11.5, color: "var(--text-muted)" }}>Full access</div>
          </button>
          <button
            type="button"
            className="aisel-demo-card"
            onClick={() => {
              setEmail("user@aisel.health");
              setPassword("aisel1234");
              setError("");
            }}
            style={demoBtnStyle}
          >
            <div style={{ fontSize: 13, fontWeight: 700 }}>Member</div>
            <div style={{ fontSize: 11.5, color: "var(--text-muted)" }}>View only</div>
          </button>
        </div>
      </div>
    </div>
  );
}

const labelStyle: React.CSSProperties = {
  display: "block",
  fontSize: 12.5,
  fontWeight: 600,
  color: "var(--text-muted)",
  marginBottom: 6,
};
