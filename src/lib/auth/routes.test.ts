import { describe, expect, it } from "vitest";

import { getRouteConfig, matchesAppPath } from "@/config/navigation";
import { isAuthPath, isPrivatePath } from "@/lib/auth/routes";

describe("auth route helpers", () => {
  it("identifies auth routes", () => {
    expect(isAuthPath("/auth/login")).toBe(true);
    expect(isAuthPath("/auth/signup")).toBe(true);
    expect(isAuthPath("/accounts")).toBe(false);
  });

  it("identifies private routes", () => {
    expect(isPrivatePath("/")).toBe(true);
    expect(isPrivatePath("/transactions")).toBe(true);
    expect(isPrivatePath("/transactions/monthly")).toBe(true);
    expect(isPrivatePath("/auth/login")).toBe(false);
    expect(isPrivatePath("/unknown")).toBe(false);
  });

  it("matches nested app paths without overmatching root", () => {
    expect(matchesAppPath("/", "/")).toBe(true);
    expect(matchesAppPath("/reports/2026", "/reports")).toBe(true);
    expect(matchesAppPath("/reports", "/")).toBe(false);
  });

  it("resolves route metadata from the current pathname", () => {
    expect(getRouteConfig("/accounts")?.title).toBe("Accounts");
    expect(getRouteConfig("/credit-card/details")?.title).toBe("Credit Card");
  });
});
