import { describe, expect, it } from "vitest";

import { isUuid } from "@/features/accounts/id";

describe("accounts id helpers", () => {
  it("accepts valid UUID values", () => {
    expect(isUuid("11111111-1111-1111-1111-111111111111")).toBe(true);
    expect(isUuid("AAAAAAAA-AAAA-4AAA-8AAA-AAAAAAAAAAAA")).toBe(true);
  });

  it("rejects invalid UUID values", () => {
    expect(isUuid("not-a-uuid")).toBe(false);
    expect(isUuid("11111111-1111-1111-1111")).toBe(false);
  });
});
