import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

vi.mock("next/navigation", () => ({
  usePathname: vi.fn(() => "/accounts"),
}));

vi.mock("@/features/auth/actions", () => ({
  logoutAction: vi.fn(),
}));

import { AppShell } from "./app-shell";

describe("AppShell", () => {
  it("renders the current route metadata and logout controls", () => {
    render(
      <AppShell userEmail="user@example.com">
        <div>Protected body</div>
      </AppShell>
    );

    expect(screen.getAllByText("Accounts").length).toBeGreaterThan(0);
    expect(screen.getByText(/user@example.com/i)).toBeInTheDocument();
    expect(screen.getAllByRole("button", { name: /log out/i }).length).toBeGreaterThan(0);
    expect(screen.getByText("Protected body")).toBeInTheDocument();
  });
});
