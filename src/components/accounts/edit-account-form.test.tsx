import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

vi.mock("@/features/accounts/actions", () => ({
  updateAccountAction: vi.fn(),
}));

vi.mock("@/features/accounts/action-state", () => ({
  INITIAL_ACCOUNT_ACTION_STATE: {
    error: null,
  },
}));

import { EditAccountForm } from "./edit-account-form";

describe("EditAccountForm", () => {
  it("renders editable fields and keeps currency read-only", () => {
    render(
      <EditAccountForm
        account={{
          id: "11111111-1111-1111-1111-111111111111",
          name: "Wallet",
          type: "asset",
          currency: "USD",
          archived: false,
          derivedBalance: "0",
          createdAt: "2026-03-09T00:00:00.000Z",
          updatedAt: "2026-03-09T00:00:00.000Z",
        }}
      />
    );

    expect(screen.getByLabelText(/nombre/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/tipo/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/cuenta archivada/i)).toBeInTheDocument();
    expect(screen.getByDisplayValue("USD")).toHaveAttribute("readonly");
  });
});
