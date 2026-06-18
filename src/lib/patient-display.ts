// Pure display helpers for patient data (client + server safe).

export function initials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]!.toUpperCase())
    .join("");
}

/** Parse a YYYY-MM-DD string as a local date (no timezone drift). */
function parseDateOnly(iso: string): Date {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y!, (m ?? 1) - 1, d ?? 1);
}

export function formatDob(iso: string): string {
  const d = parseDateOnly(iso);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function age(iso: string): number {
  const d = parseDateOnly(iso);
  const now = new Date();
  let a = now.getFullYear() - d.getFullYear();
  const m = now.getMonth() - d.getMonth();
  if (m < 0 || (m === 0 && now.getDate() < d.getDate())) a--;
  return a;
}

/** Deterministic avatar colors derived from the name. */
export function avatar(p: { firstName: string; lastName: string }, isDark: boolean) {
  const str = p.firstName + p.lastName;
  let h = 0;
  for (let i = 0; i < str.length; i++) h = (h * 31 + str.charCodeAt(i)) % 360;
  return {
    initials: initials(`${p.firstName} ${p.lastName}`),
    bg: isDark ? `hsl(${h} 34% 22%)` : `hsl(${h} 68% 92%)`,
    fg: isDark ? `hsl(${h} 70% 75%)` : `hsl(${h} 46% 34%)`,
  };
}
