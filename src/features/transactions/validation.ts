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
const DATETIME_LOCAL_PATTERN = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})$/;
const MAX_TIMEZONE_OFFSET_MINUTES = 14 * 60;

type DateTimeLocalParts = {
  year: number;
  month: number;
  day: number;
  hours: number;
  minutes: number;
};

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

function parseDateTimeLocalParts(value: string): DateTimeLocalParts | null {
  const match = DATETIME_LOCAL_PATTERN.exec(value.trim());
  if (!match) {
    return null;
  }

  const [, year, month, day, hours, minutes] = match;

  return {
    year: Number(year),
    month: Number(month),
    day: Number(day),
    hours: Number(hours),
    minutes: Number(minutes),
  };
}

function isExactLocalDate(parts: DateTimeLocalParts): boolean {
  const date = new Date(parts.year, parts.month - 1, parts.day, parts.hours, parts.minutes);

  return (
    !Number.isNaN(date.valueOf()) &&
    date.getFullYear() === parts.year &&
    date.getMonth() === parts.month - 1 &&
    date.getDate() === parts.day &&
    date.getHours() === parts.hours &&
    date.getMinutes() === parts.minutes
  );
}

function normalizeOccurredAt(
  occurredAtRaw: string,
  occurredAtOffsetMinutesRaw: string
): ValidationResult<string> {
  const parts = parseDateTimeLocalParts(occurredAtRaw);
  if (!parts || !isExactLocalDate(parts)) {
    return {
      data: null,
      error: "La fecha del movimiento es inválida.",
    };
  }

  const occurredAtOffsetMinutes = Number.parseInt(occurredAtOffsetMinutesRaw.trim(), 10);
  if (
    !Number.isInteger(occurredAtOffsetMinutes) ||
    Math.abs(occurredAtOffsetMinutes) > MAX_TIMEZONE_OFFSET_MINUTES
  ) {
    return {
      data: null,
      error: "No pudimos interpretar la zona horaria del navegador.",
    };
  }

  const occurredAtUtc = new Date(
    Date.UTC(parts.year, parts.month - 1, parts.day, parts.hours, parts.minutes) +
      occurredAtOffsetMinutes * 60_000
  );

  return {
    data: occurredAtUtc.toISOString(),
    error: null,
  };
}

export function toDateTimeLocalValue(date: Date): string {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  const day = `${date.getDate()}`.padStart(2, "0");
  const hours = `${date.getHours()}`.padStart(2, "0");
  const minutes = `${date.getMinutes()}`.padStart(2, "0");

  return `${year}-${month}-${day}T${hours}:${minutes}`;
}

export function getDateTimeLocalOffsetMinutes(value: string): string | null {
  const parts = parseDateTimeLocalParts(value);
  if (!parts || !isExactLocalDate(parts)) {
    return null;
  }

  return String(
    new Date(parts.year, parts.month - 1, parts.day, parts.hours, parts.minutes).getTimezoneOffset()
  );
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
  occurredAtOffsetMinutes: string;
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

  const occurredAt = normalizeOccurredAt(occurredAtRaw, input.occurredAtOffsetMinutes);
  if (occurredAt.error || !occurredAt.data) {
    return {
      data: null,
      error: occurredAt.error ?? "La fecha del movimiento es inválida.",
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
      occurredAt: occurredAt.data,
      categoryId: categoryId || null,
      note: normalizeNote(input.note),
    },
    error: null,
  };
}
