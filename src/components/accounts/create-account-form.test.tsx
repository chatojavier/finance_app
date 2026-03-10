import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

vi.mock("@/features/accounts/actions", () => ({
  createAccountAction: vi.fn(),
}));

vi.mock("@/features/accounts/action-state", () => ({
  INITIAL_ACCOUNT_ACTION_STATE: {
    error: null,
  },
}));

import { CreateAccountForm } from "./create-account-form";

describe("CreateAccountForm", () => {
  it("renders required fields and CTA", () => {
    render(<CreateAccountForm />);

    expect(screen.getByLabelText(/nombre/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/tipo/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/moneda/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /crear cuenta/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /cancelar/i })).toHaveAttribute("href", "/accounts");
  });
});
