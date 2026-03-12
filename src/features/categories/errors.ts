import type { PostgrestError } from "@supabase/supabase-js";

function isPostgrestError(error: unknown): error is PostgrestError {
  return (
    typeof error === "object" &&
    error !== null &&
    "message" in error &&
    typeof (error as { message: unknown }).message === "string"
  );
}

export function getCategoryErrorMessage(error: unknown, fallback: string): string {
  if (!isPostgrestError(error)) {
    return fallback;
  }

  if (error.code === "42501") {
    return "No tienes permiso para operar esta categoría.";
  }

  if (error.code === "23505") {
    return "Ya existe una categoría con ese nombre y tipo.";
  }

  if (error.code === "23514" && error.message.includes("cannot change")) {
    return "No puedes cambiar el tipo de una categoría que ya tiene movimientos.";
  }

  if (error.code === "PGRST116") {
    return "No se encontró la categoría solicitada.";
  }

  return fallback;
}
