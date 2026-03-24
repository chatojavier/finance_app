"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { INITIAL_TRANSACTION_ACTION_STATE } from "@/features/transactions/action-state";
import { getTransactionErrorMessage } from "@/features/transactions/errors";
import {
  getOwnedTransactionAccountById,
  getOwnedTransactionCategoryById,
} from "@/features/transactions/data";
import type { TransactionActionState } from "@/features/transactions/types";
import { validateCreateTransactionInput } from "@/features/transactions/validation";
import { requireUser } from "@/lib/auth/server";
import { createServerSupabaseClient } from "@/lib/supabase/server-client";

function getFormValue(formData: FormData, key: string): string {
  const value = formData.get(key);
  return typeof value === "string" ? value : "";
}

export async function createTransactionAction(
  _previousState: TransactionActionState,
  formData: FormData
): Promise<TransactionActionState> {
  const user = await requireUser();
  const validation = validateCreateTransactionInput({
    accountId: getFormValue(formData, "account_id"),
    amount: getFormValue(formData, "amount"),
    direction: getFormValue(formData, "direction"),
    occurredAt: getFormValue(formData, "occurred_at"),
    categoryId: getFormValue(formData, "category_id"),
    note: getFormValue(formData, "note"),
  });

  if (validation.error) {
    return {
      error: validation.error,
    };
  }

  if (!validation.data) {
    return INITIAL_TRANSACTION_ACTION_STATE;
  }

  const account = await getOwnedTransactionAccountById(validation.data.accountId);
  if (!account) {
    return {
      error: "La cuenta seleccionada no existe o no te pertenece.",
    };
  }

  if (account.archived) {
    return {
      error: "No puedes registrar movimientos en una cuenta archivada.",
    };
  }

  if (validation.data.categoryId) {
    const category = await getOwnedTransactionCategoryById(validation.data.categoryId);
    if (!category) {
      return {
        error: "La categoría seleccionada no existe o no te pertenece.",
      };
    }

    const expectedKind = validation.data.direction === "in" ? "income" : "expense";
    if (category.kind !== expectedKind) {
      return {
        error: "La categoría seleccionada no es compatible con la dirección del movimiento.",
      };
    }
  }

  const supabase = await createServerSupabaseClient();
  const { error } = await supabase.from("transactions").insert({
    user_id: user.id,
    account_id: account.id,
    category_id: validation.data.categoryId,
    amount: validation.data.amount,
    direction: validation.data.direction,
    currency: account.currency,
    occurred_at: validation.data.occurredAt,
    note: validation.data.note,
  });

  if (error) {
    return {
      error: getTransactionErrorMessage(
        error,
        "No se pudo registrar el movimiento. Intenta de nuevo."
      ),
    };
  }

  revalidatePath("/transactions");
  revalidatePath("/accounts");
  revalidatePath(`/accounts/${account.id}`);

  const returnAccountId = getFormValue(formData, "return_account_id").trim();
  const redirectPath =
    returnAccountId && returnAccountId === account.id
      ? `/transactions?accountId=${account.id}`
      : "/transactions";

  redirect(redirectPath);
}
