import { z } from "zod";

// Shared by the client form (react-hook-form resolver) and the server route
// handlers. Single source of truth for patient input rules.

const nameField = (label: string) =>
  z
    .string()
    .trim()
    .min(2, `${label} is required (min 2 characters).`)
    .max(80, `${label} is too long.`);

export const patientInputSchema = z.object({
  firstName: nameField("First name"),
  lastName: nameField("Last name"),
  email: z.string().trim().email("Enter a valid email address."),
  phoneNumber: z
    .string()
    .trim()
    .refine((v) => v.replace(/\D/g, "").length >= 7, "Enter a valid phone number."),
  dob: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Use the date picker (YYYY-MM-DD).")
    .refine((v) => !Number.isNaN(Date.parse(v)), "Invalid date.")
    .refine((v) => new Date(v) <= new Date(), "Date cannot be in the future.")
    .refine((v) => new Date(v).getFullYear() >= 1900, "Year must be after 1900."),
});

export type PatientInput = z.infer<typeof patientInputSchema>;

export const SORT_KEYS = ["lastName", "email", "dob", "createdAt"] as const;

export const listQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
  q: z.string().trim().default(""),
  sort: z.enum(SORT_KEYS).default("createdAt"),
  order: z.enum(["asc", "desc"]).default("desc"),
});

export type ListQuery = z.infer<typeof listQuerySchema>;

/** Patient as returned by the API (dob normalized to YYYY-MM-DD). */
export type PatientDTO = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  dob: string;
  createdAt: string;
  updatedAt: string;
};

export type PatientListResponse = {
  data: PatientDTO[];
  page: number;
  limit: number;
  total: number;
};
