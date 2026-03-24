import { CATEGORY_KINDS } from "@/features/categories/constants";
import type {
  CategoryKind,
  CreateCategoryInput,
  UpdateCategoryInput,
} from "@/features/categories/types";

type ValidationResult<T> =
  | {
      data: T;
      error: null;
    }
  | {
      data: null;
      error: string;
    };

export function normalizeCategoryName(name: string): string {
  return name.trim().replace(/\s+/g, " ");
}

function isValidCategoryKind(value: string): value is CategoryKind {
  return CATEGORY_KINDS.includes(value as CategoryKind);
}

export function validateCreateCategoryInput(input: {
  name: string;
  kind: string;
}): ValidationResult<CreateCategoryInput> {
  const name = normalizeCategoryName(input.name);

  if (!name) {
    return {
      data: null,
      error: "El nombre de la categoría es obligatorio.",
    };
  }

  if (!isValidCategoryKind(input.kind)) {
    return {
      data: null,
      error: "Tipo de categoría inválido. Usa income o expense.",
    };
  }

  return {
    data: {
      name,
      kind: input.kind,
    },
    error: null,
  };
}

export function validateUpdateCategoryInput(input: {
  name: string;
  kind: string;
}): ValidationResult<UpdateCategoryInput> {
  return validateCreateCategoryInput(input);
}
