import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

vi.mock("@/features/categories/actions", () => ({
  createCategoryAction: vi.fn(),
}));

vi.mock("@/features/categories/action-state", () => ({
  INITIAL_CATEGORY_ACTION_STATE: {
    error: null,
  },
}));

import { CreateCategoryForm } from "./create-category-form";

describe("CreateCategoryForm", () => {
  it("renders required fields and CTA", () => {
    render(<CreateCategoryForm />);

    expect(screen.getByLabelText(/nombre/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/tipo/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /crear categoría/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /cancelar/i })).toHaveAttribute("href", "/categories");
  });
});
