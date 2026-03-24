import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

vi.mock("@/features/transactions/actions", () => ({
  createTransactionAction: vi.fn(),
}));

vi.mock("@/features/transactions/action-state", () => ({
  INITIAL_TRANSACTION_ACTION_STATE: {
    error: null,
  },
}));

import { CreateTransactionForm } from "./create-transaction-form";

describe("CreateTransactionForm", () => {
  it("renders required fields and CTA", () => {
    render(
      <CreateTransactionForm
        accountOptions={[
          {
            id: "11111111-1111-4111-8111-111111111111",
            name: "Cuenta principal",
            currency: "PEN",
            archived: false,
          },
        ]}
        categoryOptions={[]}
        initialAccountId={null}
        lockedAccount={null}
        filterError={null}
        returnAccountId={null}
        defaultOccurredAt="2026-03-23T10:30"
      />
    );

    expect(screen.getByLabelText(/cuenta/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/monto/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/dirección/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/fecha/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /guardar movimiento/i })).toBeInTheDocument();
  });

  it("filters categories when direction changes and clears incompatible selection", () => {
    render(
      <CreateTransactionForm
        accountOptions={[
          {
            id: "11111111-1111-4111-8111-111111111111",
            name: "Cuenta principal",
            currency: "PEN",
            archived: false,
          },
        ]}
        categoryOptions={[
          {
            id: "22222222-2222-4222-8222-222222222222",
            name: "Comida",
            kind: "expense",
          },
          {
            id: "33333333-3333-4333-8333-333333333333",
            name: "Sueldo",
            kind: "income",
          },
        ]}
        initialAccountId={null}
        lockedAccount={null}
        filterError={null}
        returnAccountId={null}
        defaultOccurredAt="2026-03-23T10:30"
      />
    );

    const categorySelect = screen.getByLabelText(/categoría/i);
    fireEvent.change(categorySelect, {
      target: { value: "22222222-2222-4222-8222-222222222222" },
    });
    expect(categorySelect).toHaveValue("22222222-2222-4222-8222-222222222222");

    fireEvent.change(screen.getByLabelText(/dirección/i), {
      target: { value: "in" },
    });

    expect(categorySelect).toHaveValue("");
    expect(screen.queryByRole("option", { name: "Comida" })).not.toBeInTheDocument();
    expect(screen.getByRole("option", { name: "Sueldo" })).toBeInTheDocument();
  });
});
