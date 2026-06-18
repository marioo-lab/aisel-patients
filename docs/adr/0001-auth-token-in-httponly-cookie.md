# Auth token is carried in an httpOnly cookie, not localStorage

## Context

The brief asks for route protection "via guards or middleware" and a strong security posture (JWT, bcrypt, 401/403). Next.js middleware runs on the edge before any React renders, so it can only read **cookies** — never `localStorage`. The prototype stored a mock token in `localStorage`, which the server cannot see.

## Decision

`POST /auth/login` verifies credentials and sets the signed JWT in an `httpOnly`, `SameSite=Lax`, `Secure` cookie. `middleware.ts` reads and verifies that cookie to gate navigation; API route handlers re-verify it for RBAC (defense in depth). The browser attaches the cookie automatically, so no `Authorization` header plumbing is needed.

## Consequences

- Client JS cannot read the token. The UI learns the current **User**'s identity and **Role** from the server (a server component reading the cookie and passing props), not by decoding a token in the browser. The prototype's `localStorage` token helpers are removed.
- **Deviation from the stated API contract:** `POST /auth/login` returns `{ user: { email, role } }` only — the `token` is delivered via the `Set-Cookie` header, not the JSON body, to avoid re-exposing it to JS. The contract's `{ token, user }` shape is intentionally not honored for the token field.
- XSS cannot exfiltrate the token. CSRF risk is mitigated by `SameSite=Lax` (acceptable for this app; no cross-site state-changing GETs).
