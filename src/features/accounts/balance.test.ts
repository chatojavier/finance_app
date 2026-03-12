import { describe, expect, it } from "vitest";

import { formatDerivedBalance, normalizeDerivedBalance } from "@/features/accounts/balance";

describe("accounts derived balance helpers", () => {
  it("normalizes nullable and numeric values", () => {
    expect(normalizeDerivedBalance(null)).toBe("0");
    expect(normalizeDerivedBalance(10.25)).toBe("10.25");
    expect(normalizeDerivedBalance("45.00")).toBe("45.00");
  });

  it("formats fiat and BTC balances for UI", () => {
    expect(formatDerivedBalance("10", "USD")).toMatch(/USD|\$/);
    expect(formatDerivedBalance("0.1234", "BTC")).toBe("₿0.12340000");
  });
});
