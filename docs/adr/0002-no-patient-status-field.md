# Patient has no status field — the API contract is honored verbatim

## Context

The prototype and the Airtable-style design were built around a Patient `status` (`Active | Pending | Inactive`): status pills in every row, a sortable Status column, a status row in the detail view, and a segmented status control in the form. The API contract, however, defines Patient with exactly five fields — `firstName, lastName, email, phoneNumber, dob` — and no status.

## Decision

We honor the contract literally. `Patient` has no `status` field. All status UI (pills, the Status column and its sort, the detail-drawer status row, the form's segmented control) and the `statusColor`/`PatientStatus` helpers are removed.

## Consequences

- The list is plainer than the original mock — columns are Name, Email, Phone, Date of birth, Age (derived from `dob`), and row actions. This is intentional, not an oversight.
- Status-pill design tokens may remain in the theme but go unused; do not re-introduce a status field without revisiting the contract.
