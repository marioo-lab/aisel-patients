// Role-based access control as a permission model.
//
// Code checks *permissions* (capabilities), never roles directly. Roles are
// just named bundles of permissions. To add a role or change what a role can
// do, edit ROLE_PERMISSIONS — nothing else. Shared by the server guards
// (enforcement) and the UI (gating), so the two can never drift.

export type Role = "admin" | "user";

export const PERMISSIONS = [
  "patient:read",
  "patient:create",
  "patient:update",
  "patient:delete",
] as const;

export type Permission = (typeof PERMISSIONS)[number];

const ROLE_PERMISSIONS: Record<Role, readonly Permission[]> = {
  admin: ["patient:read", "patient:create", "patient:update", "patient:delete"],
  user: ["patient:read"],
};

/** Every permission granted to a role. */
export function permissionsFor(role: Role): readonly Permission[] {
  return ROLE_PERMISSIONS[role];
}

/** Whether a role is granted a specific permission. */
export function can(role: Role, permission: Permission): boolean {
  return ROLE_PERMISSIONS[role].includes(permission);
}
