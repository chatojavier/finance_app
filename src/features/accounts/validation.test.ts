import { describe, expect, it } from "vitest";

import {
  hasCurrencyMutationAttempt,
  validateCreateAccountInput,
  validateUpdateAccountInput,
} from "@/features/accounts/validation";

describe("accounts validation", () => {
  it("validates create payload for supported currency/type", () => {
    const result = validateCreateAccountInput({
      name: "  Cuenta principal  ",
      type: "asset",
      currency: "PEN",
    });

    expect(result.error).toBeNull();
    expect(result.data).toEqual({
      name: "Cuenta principal",
      type: "asset",
      currency: "PEN",
    });
  });

  it("rejects unsupported currencies", () => {
    const result = validateCreateAccountInput({
      name: "Cuenta",
      type: "asset",
      currency: "GBP",
    });

    expect(result.error).toMatch(/Moneda inválida/i);
    expect(result.data).toBeNull();
  });

  it("rejects unsupported account types", () => {
    const result = validateUpdateAccountInput({
      name: "Cuenta",
      type: "cash",
      archived: false,
    });

    expect(result.error).toMatch(/Tipo de cuenta inválido/i);
    expect(result.data).toBeNull();
  });

  it("detects forbidden currency mutation attempts on update", () => {
    expect(hasCurrencyMutationAttempt("USD")).toBe(true);
    expect(hasCurrencyMutationAttempt("   ")).toBe(false);
  });
});
