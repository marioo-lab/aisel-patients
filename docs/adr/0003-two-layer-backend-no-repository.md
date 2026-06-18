# Two-layer backend: services call Prisma directly, no repository

## Context

The brief asks for "clean architecture" and "separation of concerns" but also "keep the code simple ... no over engineering." A common clean-architecture reflex is to put a repository abstraction between services and the ORM.

## Decision

The backend has two meaningful layers: thin **route handlers** (`app/api/**/route.ts`) handle HTTP concerns only (param parsing, auth + role guards, status-code/error mapping) and delegate to **services** (`src/server/<feature>/*.service.ts`) that hold business rules and call the Prisma client **directly**. Code is organized by feature (`auth`, `patients`), not by technical layer. There is no repository interface over Prisma.

## Consequences

- Prisma is treated as the data-access layer; services are unit-tested by mocking the Prisma client. A hand-written repository over a two-table CRUD app was judged over-engineering and deliberately omitted — do not add one without a concrete reason (e.g., a second data source).
- HTTP concerns (401/403/404/409 mapping) live only in route handlers; services throw typed domain errors that the handler maps to responses.
