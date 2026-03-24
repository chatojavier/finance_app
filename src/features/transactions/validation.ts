import { isUuid } from "@/features/accounts/id";
import type { CategoryOption } from "@/features/categories/types";
import { TRANSACTION_DIRECTIONS } from "@/features/transactions/constants";
import type { CreateTransactionInput, TransactionDirection } from "@/features/transactions/types";

type ValidationResult<T> =
  | {
      data: T;
      error: null;
    }
  | {
      data: null;
      error: string;
    };

const MAX_DECIMAL_PLACES = 8;
const DECIMAL_NUMBER_PATTERN = /^\d+(?:[.,]\d+)?$/;

function isValidDirection(value: string): value is TransactionDirection {
  return TRANSACTION_DIRECTIONS.includes(value as TransactionDirection);
}

function normalizeAmount(value: string): string {
  return value.trim().replace(",", ".");
}

function normalizeNote(value: string): string | null {
  const note = value.trim().replace(/\s+/g, " ");
  return note ? note : null;
}

function getDecimalPlaces(value: string): number {
  const [, decimals = ""] = value.split(".");
  return decimals.length;
}

export function toDateTimeLocalValue(date: Date): string {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  const day = `${date.getDate()}`.padStart(2, "0");
  const hours = `${date.getHours()}`.padStart(2, "0");
  const minutes = `${date.getMinutes()}`.padStart(2, "0");

  return `${year}-${month}-${day}T${hours}:${minutes}`;
}

export function filterCategoryOptionsByDirection(
  categoryOptions: CategoryOption[],
  direction: TransactionDirection
): CategoryOption[] {
  const expectedKind = direction === "in" ? "income" : "expense";
  return categoryOptions.filter((category) => category.kind === expectedKind);
}

export function validateCreateTransactionInput(input: {
  accountId: string;
  amount: string;
  direction: string;
  occurredAt: string;
  categoryId: string;
  note: string;
}): ValidationResult<CreateTransactionInput> {
  const accountId = input.accountId.trim();
  if (!isUuid(accountId)) {
    return {
      data: null,
      error: "La cuenta es obligatoria.",
    };
  }

  const amount = normalizeAmount(input.amount);
  if (!amount || !DECIMAL_NUMBER_PATTERN.test(amount)) {
    return {
      data: null,
      error: "El monto es obligatorio y debe ser un número válido.",
    };
  }

  if (getDecimalPlaces(amount) > MAX_DECIMAL_PLACES || Number(amount) <= 0) {
    return {
      data: null,
      error: "El monto debe ser mayor que 0 y admitir hasta 8 decimales.",
    };
  }

  if (!isValidDirection(input.direction)) {
    return {
      data: null,
      error: "La dirección del movimiento es inválida. Usa in o out.",
    };
  }

  const occurredAtRaw = input.occurredAt.trim();
  if (!occurredAtRaw) {
    return {
      data: null,
      error: "La fecha del movimiento es obligatoria.",
    };
  }

  const occurredAt = new Date(occurredAtRaw);
  if (Number.isNaN(occurredAt.valueOf())) {
    return {
      data: null,
      error: "La fecha del movimiento es inválida.",
    };
  }

  const categoryId = input.categoryId.trim();
  if (categoryId && !isUuid(categoryId)) {
    return {
      data: null,
      error: "La categoría seleccionada es inválida.",
    };
  }

  return {
    data: {
      accountId,
      amount,
      direction: input.direction,
      occurredAt: occurredAt.toISOString(),
      categoryId: categoryId || null,
      note: normalizeNote(input.note),
    },
    error: null,
  };
}
