import { describe, expect, it } from "vitest";

import {
  normalizeCategoryName,
  toCategoryNameKey,
  validateCreateCategoryInput,
  validateUpdateCategoryInput,
} from "@/features/categories/validation";

describe("categories validation", () => {
  it("normalizes category names and accepts valid kind", () => {
    const result = validateCreateCategoryInput({
      name: "  Gasto   Hogar  ",
      kind: "expense",
    });

    expect(result.error).toBeNull();
    expect(result.data).toEqual({
      name: "Gasto Hogar",
      kind: "expense",
    });
  });

  it("rejects empty names", () => {
    const result = validateCreateCategoryInput({
      name: "   ",
      kind: "income",
    });

    expect(result.error).toMatch(/nombre de la categoría es obligatorio/i);
    expect(result.data).toBeNull();
  });

  it("rejects unsupported category kind", () => {
    const result = validateUpdateCategoryInput({
      name: "Sueldo",
      kind: "transfer",
    });

    expect(result.error).toMatch(/tipo de categoría inválido/i);
    expect(result.data).toBeNull();
  });

  it("builds duplicate-comparison key from normalized name", () => {
    expect(normalizeCategoryName("  CAFE   mensual ")).toBe("CAFE mensual");
    expect(toCategoryNameKey("  CAFE   mensual ")).toBe("cafe mensual");
  });
});
