import type { PostgrestError } from "@supabase/supabase-js";

function isPostgrestError(error: unknown): error is PostgrestError {
  return (
    typeof error === "object" &&
    error !== null &&
    "message" in error &&
    typeof (error as { message: unknown }).message === "string"
  );
}

export function getAccountErrorMessage(error: unknown, fallback: string): string {
  if (!isPostgrestError(error)) {
    return fallback;
  }

  if (error.code === "42501") {
    return "No tienes permiso para operar esta cuenta.";
  }

  if (error.code === "23514" && error.message.includes("transactions are not allowed")) {
    return "Las cuentas archivadas no aceptan movimientos nuevos.";
  }

  if (error.code === "23514" && error.message.includes("immutable")) {
    return "La moneda de la cuenta es inmutable en el MVP.";
  }

  if (error.code === "23503") {
    return "La referencia enviada no es válida para esta operación.";
  }

  if (error.code === "PGRST116") {
    return "No se encontró la cuenta solicitada.";
  }

  return fallback;
}
