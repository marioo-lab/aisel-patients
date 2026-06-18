# Aisel Patients

A patient-records management system. Authenticated staff browse a directory of patients; some can edit it, some can only read it.

## Language

**Patient**:
A person whose record is held in the directory. The core domain entity that is listed, viewed, created, edited, and removed.
_Avoid_: record (ambiguous), contact, client.

**User**:
An authenticated account that signs in to the system. Has exactly one **Role**.
_Avoid_: account, member (the entity is a User; "Member" is a role label — see below).

**Role**:
The authorization level carried by a **User**. One of two values: **Admin** or `user`.

- **Admin** — may create, edit, and delete **Patients**, in addition to reading them.
- `user` — read-only access to **Patients**. Surfaced in the UI under the label **Member**.

## Relationships

- A **User** has exactly one **Role**.
- **Role** governs which actions a **User** may perform on **Patients** (Admin = full CRUD; `user` = read-only).
- A **Patient** is created by exactly one **User** (its creator, an Admin); that authorship is recorded on the Patient.

## Flagged ambiguities

- **"user" is overloaded.** It names both (a) the authenticated-account entity (**User**) and (b) the read-only **Role** (claim value `user`, UI label **Member**). Canonical resolution: the entity is always **User**; the read-only role is written `user` in code/JWT claims and shown as **Member** in the UI. Never call the entity a "Member".
