"use client";

import * as React from "react";
import { useTheme } from "next-themes";
import type { SortingState } from "@tanstack/react-table";
import { Topbar } from "@/components/layout/topbar";
import { DataTable } from "./data-table";
import { getColumns } from "./columns";
import { PatientFormSheet } from "./patient-form-sheet";
import { PatientViewSheet } from "./patient-view-sheet";
import { DeleteDialog } from "./delete-dialog";
import { usePatients, type PatientsParams } from "@/hooks/use-patients";
import { showToast } from "@/components/toast";
import { ApiError } from "@/lib/api-error";
import { avatar, age } from "@/lib/patient-display";
import {
  SearchIcon,
  RefreshIcon,
  CloseIcon,
  PlusIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  TriangleAlertIcon,
} from "@/components/icons";
import type { PatientDTO, PatientInput, SORT_KEYS } from "@/lib/validations/patient";

type SortKey = (typeof SORT_KEYS)[number];
const LIMIT = 10;
const ROW_H = 58;
const CARD_H = 71;
const SORTABLE = new Set<SortKey>(["lastName", "email", "dob"]);

function useWindowWidth() {
  const [vw, setVw] = React.useState(1280);
  React.useEffect(() => {
    const onResize = () => setVw(window.innerWidth);
    onResize();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);
  return vw;
}

function buildPageList(page: number, count: number): (number | "…")[] {
  if (count <= 7) return Array.from({ length: count }, (_, i) => i + 1);
  const out: (number | "…")[] = [1];
  const l = Math.max(2, page - 1);
  const r = Math.min(count - 1, page + 1);
  if (l > 2) out.push("…");
  for (let i = l; i <= r; i++) out.push(i);
  if (r < count - 1) out.push("…");
  out.push(count);
  return out;
}

function errMsg(e: unknown): string {
  return e instanceof ApiError ? e.message : "Please try again.";
}

export function PatientsClient({
  user,
}: {
  user: { email: string; name: string; role: "admin" | "user" };
}) {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";
  const isAdmin = user.role === "admin";
  const vw = useWindowWidth();
  const isMobile = vw < 720;
  const isTablet = vw >= 720 && vw < 1040;

  const [qInput, setQInput] = React.useState("");
  const [q, setQ] = React.useState("");
  const [page, setPage] = React.useState(1);
  const [sort, setSort] = React.useState<SortKey>("createdAt");
  const [order, setOrder] = React.useState<"asc" | "desc">("desc");

  const [viewId, setViewId] = React.useState<string | null>(null);
  const [viewOpen, setViewOpen] = React.useState(false);
  const [form, setForm] = React.useState<{
    mode: "create" | "edit";
    patient: PatientDTO | null;
  } | null>(null);
  const [deleteTarget, setDeleteTarget] = React.useState<PatientDTO | null>(null);

  // Debounce the search box → query param.
  React.useEffect(() => {
    const t = setTimeout(() => {
      setQ(qInput.trim());
      setPage(1);
    }, 300);
    return () => clearTimeout(t);
  }, [qInput]);

  const params: PatientsParams = { page, limit: LIMIT, q, sort, order };
  const { data, error, isLoading, mutate, create, update, remove } = usePatients(params);

  const rows = data?.data ?? [];
  const total = data?.total ?? 0;
  const pageCount = Math.max(1, Math.ceil(total / LIMIT));
  const searchActive = q.length > 0;

  const openView = React.useCallback((p: PatientDTO) => {
    setViewId(p.id);
    setViewOpen(true);
  }, []);
  const openEdit = React.useCallback((p: PatientDTO) => {
    setViewOpen(false);
    setForm({ mode: "edit", patient: p });
  }, []);
  const requestDelete = React.useCallback((p: PatientDTO) => {
    setViewOpen(false);
    setDeleteTarget(p);
  }, []);

  const columns = React.useMemo(
    () =>
      getColumns({
        isAdmin,
        isDark,
        onView: openView,
        onEdit: openEdit,
        onDelete: requestDelete,
      }),
    [isAdmin, isDark, openView, openEdit, requestDelete]
  );

  const sorting: SortingState = SORTABLE.has(sort)
    ? [{ id: sort, desc: order === "desc" }]
    : [];
  const onSortingChange = (
    updater: SortingState | ((s: SortingState) => SortingState)
  ) => {
    const next = typeof updater === "function" ? updater(sorting) : updater;
    if (next.length) {
      setSort(next[0].id as SortKey);
      setOrder(next[0].desc ? "desc" : "asc");
      setPage(1);
    }
  };
  const columnVisibility = { phoneNumber: !isTablet, age: !isTablet };

  // ---- mutations + toasts ----
  async function handleCreate(values: PatientInput) {
    try {
      await create(values);
    } catch (e) {
      if (!(e instanceof ApiError && e.fieldErrors))
        showToast({ title: "Couldn't add patient", msg: errMsg(e), barColor: "#dc3838" });
      throw e;
    }
    showToast({
      title: "Patient added",
      msg: `${values.firstName} ${values.lastName} was created.`,
      barColor: "#15994f",
    });
  }

  async function handleEdit(id: string, values: PatientInput) {
    try {
      await update(id, values);
    } catch (e) {
      if (!(e instanceof ApiError && e.fieldErrors))
        showToast({
          title: "Couldn't save changes",
          msg: errMsg(e),
          barColor: "#dc3838",
        });
      throw e;
    }
    showToast({
      title: "Changes saved",
      msg: `${values.firstName} ${values.lastName} was updated.`,
      barColor: "#15994f",
    });
  }

  async function handleDelete() {
    const t = deleteTarget;
    if (!t) return;
    setDeleteTarget(null);
    try {
      await remove(t.id);
      showToast({
        title: "Patient deleted",
        msg: `${t.firstName} ${t.lastName} was removed.`,
        barColor: "var(--text-muted)",
      });
    } catch (e) {
      showToast({
        title: "Couldn't delete patient",
        msg: errMsg(e),
        barColor: "#dc3838",
      });
    }
  }

  const countLabel = searchActive
    ? `${total} result${total === 1 ? "" : "s"} for “${q}”`
    : `${total} patient${total === 1 ? "" : "s"}`;

  const showSkeleton = isLoading && !data;
  const showError = !!error && !data;
  const showEmpty = !!data && total === 0;
  const showData = !!data && total > 0;

  return (
    <div>
      <Topbar user={user} />

      <main style={{ maxWidth: 1180, margin: "0 auto", padding: "26px 20px 80px" }}>
        {/* toolbar */}
        <div
          style={{
            display: "flex",
            alignItems: "flex-end",
            justifyContent: "space-between",
            gap: 16,
            flexWrap: "wrap",
            marginBottom: 18,
          }}
        >
          <div>
            <h1
              style={{
                margin: 0,
                fontSize: 25,
                fontWeight: 800,
                letterSpacing: "-.025em",
              }}
            >
              Patients
            </h1>
            <p style={{ margin: "4px 0 0", color: "var(--text-muted)", fontSize: 13.5 }}>
              {countLabel}
            </p>
          </div>
          <div
            style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}
          >
            <div style={{ position: "relative" }}>
              <SearchIcon
                size={16}
                style={{
                  stroke: "var(--text-faint)",
                  position: "absolute",
                  left: 11,
                  top: 11,
                }}
              />
              <input
                value={qInput}
                onChange={(e) => setQInput(e.target.value)}
                placeholder="Search name, email, phone…"
                aria-label="Search patients"
                style={{
                  width: 248,
                  maxWidth: "54vw",
                  height: 38,
                  padding: "0 32px 0 34px",
                  border: "1px solid var(--border-strong)",
                  borderRadius: 10,
                  background: "var(--surface)",
                  outline: "none",
                  fontSize: 13.5,
                }}
              />
              {qInput && (
                <button
                  onClick={() => setQInput("")}
                  aria-label="Clear search"
                  className="aisel-ghost"
                  style={{
                    position: "absolute",
                    right: 7,
                    top: 9,
                    width: 21,
                    height: 21,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    borderRadius: 6,
                    color: "var(--text-faint)",
                  }}
                >
                  <CloseIcon size={13} />
                </button>
              )}
            </div>
            <button
              onClick={() => mutate()}
              aria-label="Refresh"
              className="aisel-ghost"
              style={{
                width: 38,
                height: 38,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                borderRadius: 10,
                border: "1px solid var(--border-strong)",
                color: "var(--text-muted)",
                background: "var(--surface)",
              }}
            >
              <RefreshIcon size={16} />
            </button>
            {isAdmin && (
              <button
                onClick={() => setForm({ mode: "create", patient: null })}
                className="aisel-primary"
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 7,
                  height: 38,
                  padding: "0 15px",
                  borderRadius: 10,
                  background: "var(--primary)",
                  color: "var(--primary-fg)",
                  fontWeight: 650,
                  fontSize: 13.5,
                  boxShadow: "0 3px 10px var(--ring)",
                }}
              >
                <PlusIcon size={16} strokeWidth={2.3} />
                New patient
              </button>
            )}
          </div>
        </div>

        {/* card */}
        <div
          style={{
            background: "var(--surface)",
            border: "1px solid var(--border)",
            borderRadius: 14,
            boxShadow: "var(--shadow)",
            overflow: "hidden",
          }}
        >
          {showSkeleton && <TableSkeleton isMobile={isMobile} />}

          {showError && (
            <StatePanel
              icon={<TriangleAlertIcon size={26} style={{ stroke: "#dc3838" }} />}
              danger
              title="Couldn't load patients"
              body="The request to the patients service failed. Check your connection and try again."
              action={
                <button
                  onClick={() => mutate()}
                  className="aisel-primary"
                  style={primaryBtn}
                >
                  <RefreshIcon size={16} strokeWidth={2} /> Retry
                </button>
              }
            />
          )}

          {showEmpty && (
            <StatePanel
              icon={<SearchIcon size={26} strokeWidth={1.7} />}
              title={searchActive ? "No matches found" : "No patients yet"}
              body={
                searchActive
                  ? `No patients match “${q}”. Try a different search.`
                  : "Get started by adding your first patient record."
              }
              action={
                searchActive ? (
                  <button
                    onClick={() => setQInput("")}
                    className="aisel-outline"
                    style={outlineBtn}
                  >
                    Clear search
                  </button>
                ) : isAdmin ? (
                  <button
                    onClick={() => setForm({ mode: "create", patient: null })}
                    className="aisel-primary"
                    style={{ ...primaryBtn, height: 38, fontSize: 13.5 }}
                  >
                    Add first patient
                  </button>
                ) : null
              }
            />
          )}

          {showData &&
            (isMobile ? (
              <div style={{ minHeight: LIMIT * CARD_H }}>
                {rows.map((p) => {
                  const av = avatar(p, isDark);
                  return (
                    <div
                      key={p.id}
                      onClick={() => openView(p)}
                      className="aisel-row"
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 12,
                        padding: "14px 16px",
                        borderBottom: "1px solid var(--border)",
                        cursor: "pointer",
                      }}
                    >
                      <span
                        style={{
                          width: 42,
                          height: 42,
                          borderRadius: "50%",
                          background: av.bg,
                          color: av.fg,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: 15,
                          fontWeight: 700,
                          flex: "none",
                        }}
                      >
                        {av.initials}
                      </span>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div
                          style={{
                            fontSize: 15,
                            fontWeight: 650,
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {p.firstName} {p.lastName}
                        </div>
                        <div
                          style={{
                            fontSize: 13,
                            color: "var(--text-muted)",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {p.email}
                        </div>
                        <div
                          style={{
                            fontSize: 12.5,
                            color: "var(--text-faint)",
                            fontVariantNumeric: "tabular-nums",
                          }}
                        >
                          {p.phoneNumber} · age {age(p.dob)}
                        </div>
                      </div>
                      <ChevronRightIcon
                        size={18}
                        style={{ stroke: "var(--text-faint)", flex: "none" }}
                      />
                    </div>
                  );
                })}
              </div>
            ) : (
              <div style={{ minHeight: LIMIT * ROW_H }}>
                <DataTable
                  columns={columns}
                  data={rows}
                  sorting={sorting}
                  onSortingChange={onSortingChange}
                  columnVisibility={columnVisibility}
                  onRowClick={openView}
                />
              </div>
            ))}

          {showData && (
            <Pagination
              page={page}
              pageCount={pageCount}
              total={total}
              limit={LIMIT}
              onPage={setPage}
            />
          )}
        </div>
      </main>

      {/* overlays */}
      <PatientViewSheet
        open={viewOpen}
        patientId={viewId}
        isAdmin={isAdmin}
        isDark={isDark}
        onEdit={openEdit}
        onDelete={requestDelete}
        onOpenChange={setViewOpen}
      />

      {form && (
        <PatientFormSheet
          open
          mode={form.mode}
          patient={form.patient}
          onSubmit={(values) =>
            form.mode === "create"
              ? handleCreate(values)
              : handleEdit(form.patient!.id, values)
          }
          onOpenChange={(o) => !o && setForm(null)}
        />
      )}

      <DeleteDialog
        open={!!deleteTarget}
        patientName={
          deleteTarget ? `${deleteTarget.firstName} ${deleteTarget.lastName}` : ""
        }
        onConfirm={handleDelete}
        onOpenChange={(o) => !o && setDeleteTarget(null)}
      />
    </div>
  );
}

const primaryBtn: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 8,
  height: 40,
  padding: "0 18px",
  borderRadius: 10,
  background: "var(--primary)",
  color: "var(--primary-fg)",
  fontWeight: 650,
  fontSize: 14,
};

const outlineBtn: React.CSSProperties = {
  height: 38,
  padding: "0 16px",
  borderRadius: 10,
  border: "1px solid var(--border-strong)",
  fontWeight: 600,
  fontSize: 13.5,
  background: "var(--surface)",
};

function StatePanel({
  icon,
  title,
  body,
  action,
  danger,
}: {
  icon: React.ReactNode;
  title: string;
  body: string;
  action?: React.ReactNode;
  danger?: boolean;
}) {
  return (
    <div
      style={{
        padding: "64px 24px",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        textAlign: "center",
      }}
    >
      <div
        style={{
          width: 54,
          height: 54,
          borderRadius: 14,
          background: danger
            ? "color-mix(in srgb,#dc3838 13%,var(--surface))"
            : "var(--surface-2)",
          border: danger ? "none" : "1px solid var(--border)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          marginBottom: 16,
          color: "var(--text-faint)",
        }}
      >
        {icon}
      </div>
      <h3 style={{ margin: "0 0 6px", fontSize: 17, fontWeight: 700 }}>{title}</h3>
      <p
        style={{
          margin: "0 0 20px",
          color: "var(--text-muted)",
          fontSize: 14,
          maxWidth: 340,
        }}
      >
        {body}
      </p>
      {action}
    </div>
  );
}

function Pagination({
  page,
  pageCount,
  total,
  limit,
  onPage,
}: {
  page: number;
  pageCount: number;
  total: number;
  limit: number;
  onPage: (p: number) => void;
}) {
  const from = total === 0 ? 0 : (page - 1) * limit + 1;
  const to = Math.min(page * limit, total);
  const pageBtnBase: React.CSSProperties = {
    height: 32,
    minWidth: 32,
    padding: "0 8px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 8,
    border: "1px solid var(--border)",
    background: "var(--surface)",
  };
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 12,
        padding: "12px 18px",
        flexWrap: "wrap",
      }}
    >
      <span style={{ fontSize: 13, color: "var(--text-muted)" }}>
        {total === 0 ? "0 results" : `${from}–${to} of ${total}`}
      </span>
      <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
        <button
          onClick={() => onPage(Math.max(1, page - 1))}
          disabled={page <= 1}
          aria-label="Previous page"
          className="aisel-outline"
          style={{
            ...pageBtnBase,
            color: page <= 1 ? "var(--text-faint)" : "var(--text)",
          }}
        >
          <ChevronLeftIcon size={15} />
        </button>
        {buildPageList(page, pageCount).map((pg, i) =>
          pg === "…" ? (
            <span
              key={`e${i}`}
              style={{
                minWidth: 30,
                textAlign: "center",
                color: "var(--text-faint)",
                fontSize: 13,
              }}
            >
              …
            </span>
          ) : (
            <button
              key={pg}
              onClick={() => onPage(pg)}
              aria-current={pg === page}
              className="aisel-outline"
              style={{
                ...pageBtnBase,
                fontSize: 13,
                fontWeight: 600,
                border: `1px solid ${pg === page ? "var(--primary)" : "var(--border)"}`,
                background: pg === page ? "var(--primary)" : "var(--surface)",
                color: pg === page ? "var(--primary-fg)" : "var(--text)",
              }}
            >
              {pg}
            </button>
          )
        )}
        <button
          onClick={() => onPage(Math.min(pageCount, page + 1))}
          disabled={page >= pageCount}
          aria-label="Next page"
          className="aisel-outline"
          style={{
            ...pageBtnBase,
            color: page >= pageCount ? "var(--text-faint)" : "var(--text)",
          }}
        >
          <ChevronRightIcon size={15} strokeWidth={2.2} />
        </button>
      </div>
    </div>
  );
}

function TableSkeleton({ isMobile }: { isMobile: boolean }) {
  const shimmer: React.CSSProperties = {
    background:
      "linear-gradient(90deg,var(--surface-2),var(--row-hover),var(--surface-2))",
    backgroundSize: "420px 100%",
    animation: "aiselShimmer 1.4s infinite",
  };
  return (
    <div style={{ minHeight: LIMIT * (isMobile ? CARD_H : ROW_H) }}>
      {Array.from({ length: LIMIT }).map((_, i) => (
        <div
          key={i}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            padding: isMobile ? "15px 16px" : "13px 18px",
            borderBottom: "1px solid var(--border)",
          }}
        >
          <div
            style={{
              width: 34,
              height: 34,
              borderRadius: "50%",
              flex: "none",
              ...shimmer,
            }}
          />
          <div style={{ height: 12, width: "32%", borderRadius: 6, ...shimmer }} />
          {!isMobile && (
            <>
              <div style={{ height: 12, width: "26%", borderRadius: 6, ...shimmer }} />
              <div style={{ height: 12, width: "16%", borderRadius: 6, ...shimmer }} />
            </>
          )}
        </div>
      ))}
    </div>
  );
}
