"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { INITIAL_CATEGORY_ACTION_STATE } from "@/features/categories/action-state";
import {
  findCategoryByNormalizedName,
  getCategoryById,
  hasCategoryTransactions,
} from "@/features/categories/data";
import { getCategoryErrorMessage } from "@/features/categories/errors";
import type { CategoryActionState } from "@/features/categories/types";
import {
  validateCreateCategoryInput,
  validateUpdateCategoryInput,
} from "@/features/categories/validation";
import { requireUser } from "@/lib/auth/server";
import { createServerSupabaseClient } from "@/lib/supabase/server-client";

function getFormValue(formData: FormData, key: string): string {
  const value = formData.get(key);
  return typeof value === "string" ? value : "";
}

export async function createCategoryAction(
  _previousState: CategoryActionState,
  formData: FormData
): Promise<CategoryActionState> {
  const user = await requireUser();
  const validation = validateCreateCategoryInput({
    name: getFormValue(formData, "name"),
    kind: getFormValue(formData, "kind"),
  });

  if (validation.error) {
    return {
      error: validation.error,
    };
  }

  if (!validation.data) {
    return INITIAL_CATEGORY_ACTION_STATE;
  }

  const duplicate = await findCategoryByNormalizedName(validation.data.kind, validation.data.name);
  if (duplicate) {
    return {
      error: "Ya existe una categoría con ese nombre y tipo.",
    };
  }

  const supabase = await createServerSupabaseClient();
  const { error } = await supabase.from("categories").insert({
    user_id: user.id,
    name: validation.data.name,
    kind: validation.data.kind,
  });

  if (error) {
    return {
      error: getCategoryErrorMessage(error, "No se pudo crear la categoría. Intenta de nuevo."),
    };
  }

  revalidatePath("/categories");
  revalidatePath("/transactions");
  redirect("/categories");
}

export async function updateCategoryAction(
  categoryId: string,
  _previousState: CategoryActionState,
  formData: FormData
): Promise<CategoryActionState> {
  await requireUser();
  const validation = validateUpdateCategoryInput({
    name: getFormValue(formData, "name"),
    kind: getFormValue(formData, "kind"),
  });

  if (validation.error) {
    return {
      error: validation.error,
    };
  }

  if (!validation.data) {
    return INITIAL_CATEGORY_ACTION_STATE;
  }

  const category = await getCategoryById(categoryId);
  if (!category) {
    return {
      error: "No se encontró la categoría solicitada.",
    };
  }

  const duplicate = await findCategoryByNormalizedName(
    validation.data.kind,
    validation.data.name,
    categoryId
  );
  if (duplicate) {
    return {
      error: "Ya existe una categoría con ese nombre y tipo.",
    };
  }

  if (validation.data.kind !== category.kind) {
    const alreadyUsed = await hasCategoryTransactions(categoryId);
    if (alreadyUsed) {
      return {
        error: "No puedes cambiar el tipo de una categoría que ya tiene movimientos.",
      };
    }
  }

  const supabase = await createServerSupabaseClient();
  const { error } = await supabase
    .from("categories")
    .update({
      name: validation.data.name,
      kind: validation.data.kind,
    })
    .eq("id", categoryId)
    .select("id")
    .single();

  if (error) {
    return {
      error: getCategoryErrorMessage(
        error,
        "No se pudo actualizar la categoría. Intenta de nuevo."
      ),
    };
  }

  revalidatePath("/categories");
  revalidatePath("/transactions");
  redirect("/categories");
}
