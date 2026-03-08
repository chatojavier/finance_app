import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

vi.mock("@/features/auth/actions", () => ({
  signupAction: vi.fn(),
}));

vi.mock("@/features/auth/action-state", () => ({
  INITIAL_AUTH_ACTION_STATE: {
    error: null,
  },
}));

import { SignupForm } from "./signup-form";

describe("SignupForm", () => {
  it("renders the signup fields and CTA", () => {
    render(<SignupForm />);

    expect(screen.getByRole("heading", { name: /create your account/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /create account/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /log in/i })).toHaveAttribute("href", "/auth/login");
  });
});
