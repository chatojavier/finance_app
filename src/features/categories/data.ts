import "server-only";

import type { CategoryKind, CategoryListItem, CategoryOption } from "@/features/categories/types";
import { toCategoryNameKey } from "@/features/categories/validation";
import { createServerSupabaseClient } from "@/lib/supabase/server-client";

type CategoryRow = {
  id: string;
  name: string;
  kind: string;
  created_at: string;
  updated_at: string;
};

type CategoryDuplicateCandidateRow = {
  id: string;
  name: string;
};

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function isUuid(value: string): boolean {
  return UUID_PATTERN.test(value);
}

function mapCategoryRow(row: CategoryRow): CategoryListItem {
  return {
    id: row.id,
    name: row.name,
    kind: row.kind as CategoryKind,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function mapCategoryOption(row: CategoryRow): CategoryOption {
  return {
    id: row.id,
    name: row.name,
    kind: row.kind as CategoryKind,
  };
}

export async function listCategories(): Promise<CategoryListItem[]> {
  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase
    .from("categories")
    .select("id, name, kind, created_at, updated_at")
    .order("created_at", { ascending: false });

  if (error) {
    throw error;
  }

  return (data as CategoryRow[] | null)?.map(mapCategoryRow) ?? [];
}

export async function getCategoryById(categoryId: string): Promise<CategoryListItem | null> {
  if (!isUuid(categoryId)) {
    return null;
  }

  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase
    .from("categories")
    .select("id, name, kind, created_at, updated_at")
    .eq("id", categoryId)
    .maybeSingle();

  if (error) {
    throw error;
  }

  if (!data) {
    return null;
  }

  return mapCategoryRow(data as CategoryRow);
}

export async function listCategoryOptions(): Promise<CategoryOption[]> {
  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase
    .from("categories")
    .select("id, name, kind, created_at, updated_at")
    .order("kind", { ascending: true })
    .order("name", { ascending: true });

  if (error) {
    throw error;
  }

  return (data as CategoryRow[] | null)?.map(mapCategoryOption) ?? [];
}

export async function hasCategoryTransactions(categoryId: string): Promise<boolean> {
  if (!isUuid(categoryId)) {
    return false;
  }

  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase
    .from("transactions")
    .select("id")
    .eq("category_id", categoryId)
    .limit(1);

  if (error) {
    throw error;
  }

  return (data?.length ?? 0) > 0;
}

export async function findCategoryByNormalizedName(
  kind: CategoryKind,
  name: string,
  excludeCategoryId?: string
): Promise<CategoryDuplicateCandidateRow | null> {
  const normalizedNameKey = toCategoryNameKey(name);
  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase.from("categories").select("id, name").eq("kind", kind);

  if (error) {
    throw error;
  }

  const duplicate =
    (data as CategoryDuplicateCandidateRow[] | null)?.find(
      (candidate) =>
        candidate.id !== excludeCategoryId &&
        toCategoryNameKey(candidate.name) === normalizedNameKey
    ) ?? null;

  return duplicate;
}
