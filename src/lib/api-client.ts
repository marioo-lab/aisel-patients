import { ApiError, type ApiErrorBody } from "./api-error";
import type {
  PatientDTO,
  PatientListResponse,
  PatientInput,
} from "./validations/patient";

async function apiFetch<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    ...init,
    headers: {
      ...(init?.body ? { "content-type": "application/json" } : {}),
      ...init?.headers,
    },
  });

  if (!res.ok) {
    let body: ApiErrorBody | undefined;
    try {
      body = (await res.json()) as ApiErrorBody;
    } catch {
      // non-JSON error
    }
    throw new ApiError(
      res.status,
      body?.error.code ?? "INTERNAL",
      body?.error.message ?? "Request failed.",
      body?.error.fieldErrors
    );
  }

  if (res.status === 204) return undefined as T;
  return (await res.json()) as T;
}

export const api = {
  listPatients: (qs: string) => apiFetch<PatientListResponse>(`/api/patients?${qs}`),
  getPatient: (id: string) => apiFetch<PatientDTO>(`/api/patients/${id}`),
  createPatient: (input: PatientInput) =>
    apiFetch<PatientDTO>("/api/patients", {
      method: "POST",
      body: JSON.stringify(input),
    }),
  updatePatient: (id: string, input: PatientInput) =>
    apiFetch<PatientDTO>(`/api/patients/${id}`, {
      method: "PUT",
      body: JSON.stringify(input),
    }),
  deletePatient: (id: string) =>
    apiFetch<{ ok: true }>(`/api/patients/${id}`, { method: "DELETE" }),
  login: (email: string, password: string) =>
    apiFetch<{ user: { email: string; role: "admin" | "user" } }>("/api/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    }),
  logout: () => apiFetch<{ ok: true }>("/api/auth/logout", { method: "POST" }),
};
