"use client";

import useSWR from "swr";
import { api } from "@/lib/api-client";
import type {
  ListQuery,
  PatientDTO,
  PatientInput,
  PatientListResponse,
} from "@/lib/validations/patient";

export type PatientsParams = Pick<ListQuery, "page" | "limit" | "q" | "sort" | "order">;

function toQueryString(params: PatientsParams): string {
  return new URLSearchParams({
    page: String(params.page),
    limit: String(params.limit),
    q: params.q,
    sort: params.sort,
    order: params.order,
  }).toString();
}

function optimisticRow(input: PatientInput): PatientDTO {
  const now = new Date().toISOString();
  return {
    id: `temp-${Date.now()}`,
    firstName: input.firstName,
    lastName: input.lastName,
    email: input.email,
    phoneNumber: input.phoneNumber,
    dob: input.dob,
    createdAt: now,
    updatedAt: now,
  };
}

/**
 * List hook + optimistic mutations bound to the current list key.
 * Mutations show optimistic state, then revalidate from the server; on error
 * SWR rolls the cache back and the rejection bubbles to the caller (for toasts
 * / field errors).
 */
export function usePatients(params: PatientsParams) {
  const qs = toQueryString(params);
  const key = `/api/patients?${qs}`;
  const { data, error, isLoading, mutate } = useSWR<PatientListResponse>(
    key,
    () => api.listPatients(qs),
    { keepPreviousData: true }
  );

  const create = (input: PatientInput) =>
    mutate(
      async () => {
        await api.createPatient(input);
        return undefined;
      },
      {
        optimisticData: (cur) =>
          cur
            ? {
                ...cur,
                data: [optimisticRow(input), ...cur.data].slice(0, cur.limit),
                total: cur.total + 1,
              }
            : (cur as unknown as PatientListResponse),
        rollbackOnError: true,
        revalidate: true,
        populateCache: false,
      }
    );

  const update = (id: string, input: PatientInput) =>
    mutate(
      async () => {
        await api.updatePatient(id, input);
        return undefined;
      },
      {
        optimisticData: (cur) =>
          cur
            ? {
                ...cur,
                data: cur.data.map((p) =>
                  p.id === id
                    ? { ...p, ...input, updatedAt: new Date().toISOString() }
                    : p
                ),
              }
            : (cur as unknown as PatientListResponse),
        rollbackOnError: true,
        revalidate: true,
        populateCache: false,
      }
    );

  const remove = (id: string) =>
    mutate(
      async () => {
        await api.deletePatient(id);
        return undefined;
      },
      {
        optimisticData: (cur) =>
          cur
            ? {
                ...cur,
                data: cur.data.filter((p) => p.id !== id),
                total: Math.max(0, cur.total - 1),
              }
            : (cur as unknown as PatientListResponse),
        rollbackOnError: true,
        revalidate: true,
        populateCache: false,
      }
    );

  return { data, error, isLoading, mutate, create, update, remove };
}

export function usePatient(id: string | null) {
  const { data, error, isLoading } = useSWR<PatientDTO>(
    id ? `/api/patients/${id}` : null,
    () => api.getPatient(id!)
  );
  return { patient: data, error, isLoading };
}
