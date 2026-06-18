import { describe, it, expect } from "vitest";
import { can, permissionsFor } from "./permissions";

describe("permissions", () => {
  it("grants admin full patient CRUD", () => {
    expect(can("admin", "patient:read")).toBe(true);
    expect(can("admin", "patient:create")).toBe(true);
    expect(can("admin", "patient:update")).toBe(true);
    expect(can("admin", "patient:delete")).toBe(true);
  });

  it("grants the user role read-only access", () => {
    expect(can("user", "patient:read")).toBe(true);
    expect(can("user", "patient:create")).toBe(false);
    expect(can("user", "patient:update")).toBe(false);
    expect(can("user", "patient:delete")).toBe(false);
  });

  it("exposes the full permission set per role", () => {
    expect(permissionsFor("user")).toEqual(["patient:read"]);
    expect(permissionsFor("admin")).toHaveLength(4);
  });
});
