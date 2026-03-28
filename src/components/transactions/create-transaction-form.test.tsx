import { fireEvent, render, screen, waitFor } from "@testing-library/react";
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
  it("renders required fields and CTA", async () => {
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
      />
    );

    expect(screen.getByLabelText(/cuenta/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/monto/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/dirección/i)).toBeInTheDocument();
    const dateInput = screen.getByLabelText(/fecha/i) as HTMLInputElement;
    expect(dateInput).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /guardar movimiento/i })).toBeInTheDocument();

    await waitFor(() => {
      expect(dateInput.value).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/);
    });

    const offsetInput = document.querySelector(
      'input[name="occurred_at_offset_minutes"]'
    ) as HTMLInputElement | null;

    expect(offsetInput?.value).toBe(String(new Date().getTimezoneOffset()));
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
