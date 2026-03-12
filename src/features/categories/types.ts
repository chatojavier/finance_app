import type { CATEGORY_KINDS } from "@/features/categories/constants";

export type CategoryKind = (typeof CATEGORY_KINDS)[number];

export type CategoryListItem = {
  id: string;
  name: string;
  kind: CategoryKind;
  createdAt: string;
  updatedAt: string;
};

export type CategoryOption = {
  id: string;
  name: string;
  kind: CategoryKind;
};

export type CreateCategoryInput = {
  name: string;
  kind: CategoryKind;
};

export type UpdateCategoryInput = CreateCategoryInput;

export type CategoryActionState = {
  error: string | null;
};
