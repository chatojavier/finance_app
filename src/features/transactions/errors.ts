import type { PostgrestError } from "@supabase/supabase-js";

function isPostgrestError(error: unknown): error is PostgrestError {
  return (
    typeof error === "object" &&
    error !== null &&
    "message" in error &&
    typeof (error as { message: unknown }).message === "string"
  );
}

export function getTransactionErrorMessage(error: unknown, fallback: string): string {
  if (!isPostgrestError(error)) {
    return fallback;
  }

  if (error.code === "42501") {
    return "La cuenta o categoría seleccionada no está disponible para tu usuario.";
  }

  if (error.code === "23514") {
    if (error.message.includes("archived accounts")) {
      return "No puedes registrar movimientos en una cuenta archivada.";
    }

    if (error.message.includes("must match account currency")) {
      return "La moneda del movimiento debe coincidir con la moneda de la cuenta.";
    }

    if (error.message.includes("kind must match direction")) {
      return "La categoría seleccionada no es compatible con la dirección del movimiento.";
    }

    if (error.message.includes("transactions_amount_positive")) {
      return "El monto debe ser mayor que 0.";
    }
  }

  return fallback;
}
