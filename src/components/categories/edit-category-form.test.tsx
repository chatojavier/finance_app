import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import type { CategoryListItem } from "@/features/categories/types";

vi.mock("@/features/categories/actions", () => ({
  updateCategoryAction: vi.fn(),
}));

vi.mock("@/features/categories/action-state", () => ({
  INITIAL_CATEGORY_ACTION_STATE: {
    error: null,
  },
}));

import { EditCategoryForm } from "./edit-category-form";

const CATEGORY: CategoryListItem = {
  id: "11111111-1111-4111-8111-111111111111",
  name: "Gasto financiero",
  kind: "expense",
  createdAt: "2026-03-10T00:00:00.000Z",
  updatedAt: "2026-03-10T00:00:00.000Z",
};

describe("EditCategoryForm", () => {
  it("renders editable fields and allows kind changes when category has no transactions", () => {
    render(<EditCategoryForm category={CATEGORY} hasTransactions={false} />);

    expect(screen.getByLabelText(/nombre/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/tipo/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/tipo/i)).not.toBeDisabled();
    expect(screen.getByRole("button", { name: /guardar cambios/i })).toBeInTheDocument();
  });

  it("locks kind selector when category has transactions", () => {
    render(<EditCategoryForm category={CATEGORY} hasTransactions />);

    expect(screen.getByLabelText(/tipo/i)).toBeDisabled();
    expect(screen.getByText(/ya tiene movimientos/i)).toBeVisible();
  });
});
