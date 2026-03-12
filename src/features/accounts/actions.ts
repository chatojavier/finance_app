"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { getFormCheckboxValue, getFormValue } from "@/features/accounts/form-data";
import { getAccountErrorMessage } from "@/features/accounts/errors";
import type { AccountActionState } from "@/features/accounts/types";
import {
  hasCurrencyMutationAttempt,
  validateCreateAccountInput,
  validateUpdateAccountInput,
} from "@/features/accounts/validation";
import { requireUser } from "@/lib/auth/server";
import { createServerSupabaseClient } from "@/lib/supabase/server-client";

export async function createAccountAction(
  _previousState: AccountActionState,
  formData: FormData
): Promise<AccountActionState> {
  const user = await requireUser();
  const validation = validateCreateAccountInput({
    name: getFormValue(formData, "name"),
    type: getFormValue(formData, "type"),
    currency: getFormValue(formData, "currency"),
  });

  if (validation.error) {
    return {
      error: validation.error,
    };
  }

  if (!validation.data) {
    return {
      error: "No se pudo validar la cuenta a crear.",
    };
  }

  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase
    .from("accounts")
    .insert({
      user_id: user.id,
      name: validation.data.name,
      type: validation.data.type,
      currency: validation.data.currency,
    })
    .select("id")
    .single();

  if (error) {
    return {
      error: getAccountErrorMessage(error, "No se pudo crear la cuenta. Intenta de nuevo."),
    };
  }

  revalidatePath("/accounts");
  redirect(`/accounts/${data.id}`);
}

export async function updateAccountAction(
  accountId: string,
  _previousState: AccountActionState,
  formData: FormData
): Promise<AccountActionState> {
  await requireUser();

  const requestedCurrency = getFormValue(formData, "currency");
  if (hasCurrencyMutationAttempt(requestedCurrency)) {
    return {
      error: "La moneda de la cuenta es inmutable en el MVP.",
    };
  }

  const validation = validateUpdateAccountInput({
    name: getFormValue(formData, "name"),
    type: getFormValue(formData, "type"),
    archived: getFormCheckboxValue(formData, "archived"),
  });

  if (validation.error) {
    return {
      error: validation.error,
    };
  }

  if (!validation.data) {
    return {
      error: "No se pudo validar la cuenta a actualizar.",
    };
  }

  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase
    .from("accounts")
    .update({
      name: validation.data.name,
      type: validation.data.type,
      archived: validation.data.archived,
    })
    .eq("id", accountId)
    .select("id")
    .single();

  if (error) {
    return {
      error: getAccountErrorMessage(error, "No se pudo actualizar la cuenta. Intenta de nuevo."),
    };
  }

  revalidatePath("/accounts");
  revalidatePath(`/accounts/${accountId}`);
  redirect(`/accounts/${data.id}`);
}
