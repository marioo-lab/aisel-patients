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
import { can } from "@/lib/permissions";
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
const SORTABLE = new Set<SortKey>(["lastName", "email", "dob"]);
// Reserve constant rows-area height so the footer never shifts.
const TABLE_MIN_H = "min-h-[580px]"; // 10 rows × 58px
const CARD_MIN_H = "min-h-[710px]"; // 10 cards × 71px

const primaryBtn =
  "flex h-10 items-center gap-2 rounded-[10px] bg-primary px-4.5 text-sm font-[650] text-primary-fg transition hover:brightness-105 active:translate-y-px";

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
  const canCreate = can(user.role, "patient:create");
  const canEdit = can(user.role, "patient:update");
  const canDelete = can(user.role, "patient:delete");
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
        canEdit,
        canDelete,
        isDark,
        onView: openView,
        onEdit: openEdit,
        onDelete: requestDelete,
      }),
    [canEdit, canDelete, isDark, openView, openEdit, requestDelete]
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
        showToast({ title: "Couldn't save changes", msg: errMsg(e), barColor: "#dc3838" });
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
      showToast({ title: "Couldn't delete patient", msg: errMsg(e), barColor: "#dc3838" });
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

      <main className="mx-auto max-w-[1180px] px-5 pt-6.5 pb-20">
        {/* toolbar */}
        <div className="mb-4.5 flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="m-0 text-[25px] font-extrabold tracking-[-0.025em]">Patients</h1>
            <p className="mt-1 text-[13.5px] text-text-muted">{countLabel}</p>
          </div>
          <div className="flex flex-wrap items-center gap-2.5">
            <div className="relative">
              <SearchIcon
                size={16}
                className="absolute top-2.75 left-2.75 text-text-faint"
              />
              <input
                value={qInput}
                onChange={(e) => setQInput(e.target.value)}
                placeholder="Search name, email, phone…"
                aria-label="Search patients"
                className="h-9.5 w-62 max-w-[54vw] rounded-[10px] border border-border-strong bg-surface pr-8 pl-8.5 text-[13.5px] outline-none focus:border-primary focus:shadow-[0_0_0_3px_var(--ring)]"
              />
              {qInput && (
                <button
                  onClick={() => setQInput("")}
                  aria-label="Clear search"
                  className="absolute top-2.25 right-1.75 flex size-[21px] items-center justify-center rounded-md text-text-faint transition-colors hover:bg-row-hover hover:text-text"
                >
                  <CloseIcon size={13} />
                </button>
              )}
            </div>
            <button
              onClick={() => mutate()}
              aria-label="Refresh"
              className="flex size-9.5 items-center justify-center rounded-[10px] border border-border-strong bg-surface text-text-muted transition-colors hover:bg-row-hover hover:text-text"
            >
              <RefreshIcon size={16} />
            </button>
            {canCreate && (
              <button
                onClick={() => setForm({ mode: "create", patient: null })}
                className="flex h-9.5 items-center gap-1.75 rounded-[10px] bg-primary px-3.75 text-[13.5px] font-[650] text-primary-fg shadow-[0_3px_10px_var(--ring)] transition hover:brightness-105 active:translate-y-px"
              >
                <PlusIcon size={16} strokeWidth={2.3} />
                New patient
              </button>
            )}
          </div>
        </div>

        {/* card */}
        <div className="overflow-hidden rounded-[14px] border border-border bg-surface shadow-(--shadow)">
          {showSkeleton && <TableSkeleton isMobile={isMobile} />}

          {showError && (
            <StatePanel
              icon={<TriangleAlertIcon size={26} className="text-[#dc3838]" />}
              danger
              title="Couldn't load patients"
              body="The request to the patients service failed. Check your connection and try again."
              action={
                <button onClick={() => mutate()} className={primaryBtn}>
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
                    className="h-9.5 rounded-[10px] border border-border-strong bg-surface px-4 text-[13.5px] font-semibold transition hover:bg-row-hover"
                  >
                    Clear search
                  </button>
                ) : canCreate ? (
                  <button
                    onClick={() => setForm({ mode: "create", patient: null })}
                    className="flex h-9.5 items-center rounded-[10px] bg-primary px-4 text-[13.5px] font-[650] text-primary-fg transition hover:brightness-105 active:translate-y-px"
                  >
                    Add first patient
                  </button>
                ) : null
              }
            />
          )}

          {showData &&
            (isMobile ? (
              <div className={CARD_MIN_H}>
                {rows.map((p) => {
                  const av = avatar(p, isDark);
                  return (
                    <div
                      key={p.id}
                      onClick={() => openView(p)}
                      className="flex cursor-pointer items-center gap-3 border-b border-border px-4 py-3.5 transition-colors hover:bg-row-hover"
                    >
                      <span
                        className="flex size-[42px] shrink-0 items-center justify-center rounded-full text-[15px] font-bold"
                        style={{ background: av.bg, color: av.fg }}
                      >
                        {av.initials}
                      </span>
                      <div className="min-w-0 flex-1">
                        <div className="overflow-hidden text-[15px] font-[650] text-ellipsis whitespace-nowrap">
                          {p.firstName} {p.lastName}
                        </div>
                        <div className="overflow-hidden text-[13px] text-ellipsis whitespace-nowrap text-text-muted">
                          {p.email}
                        </div>
                        <div className="text-[12.5px] text-text-faint tabular-nums">
                          {p.phoneNumber} · age {age(p.dob)}
                        </div>
                      </div>
                      <ChevronRightIcon size={18} className="shrink-0 text-text-faint" />
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className={TABLE_MIN_H}>
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
        canEdit={canEdit}
        canDelete={canDelete}
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
    <div className="flex flex-col items-center px-6 py-16 text-center">
      <div
        className={`mb-4 flex size-[54px] items-center justify-center rounded-[14px] text-text-faint ${
          danger
            ? "bg-[color-mix(in_srgb,#dc3838_13%,var(--surface))]"
            : "border border-border bg-surface-2"
        }`}
      >
        {icon}
      </div>
      <h3 className="mb-1.5 text-[17px] font-bold">{title}</h3>
      <p className="mb-5 max-w-[340px] text-sm text-text-muted">{body}</p>
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
  const navBtn =
    "flex h-8 min-w-8 items-center justify-center rounded-lg border border-border bg-surface px-2 transition-colors hover:bg-row-hover";
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 px-4.5 py-3">
      <span className="text-[13px] text-text-muted">
        {total === 0 ? "0 results" : `${from}–${to} of ${total}`}
      </span>
      <div className="flex items-center gap-1">
        <button
          onClick={() => onPage(Math.max(1, page - 1))}
          disabled={page <= 1}
          aria-label="Previous page"
          className={`${navBtn} ${page <= 1 ? "text-text-faint" : "text-text"}`}
        >
          <ChevronLeftIcon size={15} />
        </button>
        {buildPageList(page, pageCount).map((pg, i) =>
          pg === "…" ? (
            <span
              key={`e${i}`}
              className="min-w-[30px] text-center text-[13px] text-text-faint"
            >
              …
            </span>
          ) : (
            <button
              key={pg}
              onClick={() => onPage(pg)}
              aria-current={pg === page}
              className={
                pg === page
                  ? "flex h-8 min-w-8 items-center justify-center rounded-lg border border-primary bg-primary px-2 text-[13px] font-semibold text-primary-fg"
                  : "flex h-8 min-w-8 items-center justify-center rounded-lg border border-border bg-surface px-2 text-[13px] font-semibold text-text transition-colors hover:bg-row-hover"
              }
            >
              {pg}
            </button>
          )
        )}
        <button
          onClick={() => onPage(Math.min(pageCount, page + 1))}
          disabled={page >= pageCount}
          aria-label="Next page"
          className={`${navBtn} ${page >= pageCount ? "text-text-faint" : "text-text"}`}
        >
          <ChevronRightIcon size={15} strokeWidth={2.2} />
        </button>
      </div>
    </div>
  );
}

function TableSkeleton({ isMobile }: { isMobile: boolean }) {
  return (
    <div className={isMobile ? CARD_MIN_H : TABLE_MIN_H}>
      {Array.from({ length: LIMIT }).map((_, i) => (
        <div
          key={i}
          className={`flex items-center gap-3 border-b border-border ${
            isMobile ? "px-4 py-3.75" : "px-4.5 py-3.25"
          }`}
        >
          <div className="aisel-shimmer size-[34px] shrink-0 rounded-full" />
          <div className="aisel-shimmer h-3 w-[32%] rounded-md" />
          {!isMobile && (
            <>
              <div className="aisel-shimmer h-3 w-[26%] rounded-md" />
              <div className="aisel-shimmer h-3 w-[16%] rounded-md" />
            </>
          )}
        </div>
      ))}
    </div>
  );
}
