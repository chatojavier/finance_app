import { describe, expect, it } from "vitest";

import { validateCreateTransactionInput } from "./validation";

describe("validateCreateTransactionInput", () => {
  const validInput = {
    accountId: "11111111-1111-4111-8111-111111111111",
    amount: "10.25",
    direction: "out",
    occurredAt: "2026-03-23T10:30",
    categoryId: "",
    note: "  Compra   semanal  ",
  };

  it("validates a complete input and normalizes note/category", () => {
    const result = validateCreateTransactionInput(validInput);

    expect(result.error).toBeNull();
    expect(result.data).toMatchObject({
      accountId: validInput.accountId,
      amount: "10.25",
      direction: "out",
      categoryId: null,
      note: "Compra semanal",
    });
    expect(result.data?.occurredAt).toMatch(/^2026-03-23T/);
  });

  it("rejects missing account ids", () => {
    const result = validateCreateTransactionInput({
      ...validInput,
      accountId: "",
    });

    expect(result.error).toMatch(/cuenta es obligatoria/i);
  });

  it("rejects zero or negative amounts", () => {
    const result = validateCreateTransactionInput({
      ...validInput,
      amount: "0",
    });

    expect(result.error).toMatch(/monto debe ser mayor que 0/i);
  });

  it("rejects more than 8 decimal places", () => {
    const result = validateCreateTransactionInput({
      ...validInput,
      amount: "0.123456789",
    });

    expect(result.error).toMatch(/hasta 8 decimales/i);
  });

  it("rejects invalid directions", () => {
    const result = validateCreateTransactionInput({
      ...validInput,
      direction: "sideways",
    });

    expect(result.error).toMatch(/dirección del movimiento es inválida/i);
  });

  it("rejects invalid category ids", () => {
    const result = validateCreateTransactionInput({
      ...validInput,
      categoryId: "not-a-uuid",
    });

    expect(result.error).toMatch(/categoría seleccionada es inválida/i);
  });

  it("rejects invalid dates", () => {
    const result = validateCreateTransactionInput({
      ...validInput,
      occurredAt: "not-a-date",
    });

    expect(result.error).toMatch(/fecha del movimiento es inválida/i);
  });
});
