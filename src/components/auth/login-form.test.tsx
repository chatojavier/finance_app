import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

vi.mock("@/features/auth/actions", () => ({
  loginAction: vi.fn(),
}));

vi.mock("@/features/auth/action-state", () => ({
  INITIAL_AUTH_ACTION_STATE: {
    error: null,
  },
}));

import { LoginForm } from "./login-form";

describe("LoginForm", () => {
  it("renders the login fields and CTA", () => {
    render(<LoginForm />);

    expect(screen.getByRole("heading", { name: /log in to your account/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /log in/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /sign up/i })).toHaveAttribute("href", "/auth/signup");
  });
});
