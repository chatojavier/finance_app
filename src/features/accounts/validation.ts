import { ACCOUNT_CURRENCIES, ACCOUNT_TYPES } from "@/features/accounts/constants";
import type { CreateAccountInput, UpdateAccountInput } from "@/features/accounts/types";

type ValidationResult<T> =
  | {
      data: T;
      error: null;
    }
  | {
      data: null;
      error: string;
    };

function normalizeName(name: string): string {
  return name.trim().replace(/\s+/g, " ");
}

function isValidAccountType(value: string): boolean {
  return ACCOUNT_TYPES.includes(value as (typeof ACCOUNT_TYPES)[number]);
}

function isValidAccountCurrency(value: string): boolean {
  return ACCOUNT_CURRENCIES.includes(value as (typeof ACCOUNT_CURRENCIES)[number]);
}

export function validateCreateAccountInput(input: {
  name: string;
  type: string;
  currency: string;
}): ValidationResult<CreateAccountInput> {
  const name = normalizeName(input.name);

  if (!name) {
    return {
      data: null,
      error: "El nombre de la cuenta es obligatorio.",
    };
  }

  if (!isValidAccountType(input.type)) {
    return {
      data: null,
      error: "Tipo de cuenta inválido. Usa asset o liability.",
    };
  }

  if (!isValidAccountCurrency(input.currency)) {
    return {
      data: null,
      error: "Moneda inválida. Usa PEN, USD, EUR o BTC.",
    };
  }

  return {
    data: {
      name,
      type: input.type as CreateAccountInput["type"],
      currency: input.currency as CreateAccountInput["currency"],
    },
    error: null,
  };
}

export function validateUpdateAccountInput(input: {
  name: string;
  type: string;
  archived: boolean;
}): ValidationResult<UpdateAccountInput> {
  const name = normalizeName(input.name);

  if (!name) {
    return {
      data: null,
      error: "El nombre de la cuenta es obligatorio.",
    };
  }

  if (!isValidAccountType(input.type)) {
    return {
      data: null,
      error: "Tipo de cuenta inválido. Usa asset o liability.",
    };
  }

  return {
    data: {
      name,
      type: input.type as UpdateAccountInput["type"],
      archived: input.archived,
    },
    error: null,
  };
}

export function hasCurrencyMutationAttempt(value: string): boolean {
  return value.trim().length > 0;
}
