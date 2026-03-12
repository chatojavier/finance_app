export const CATEGORY_KINDS = ["income", "expense"] as const;

export function getCategoryKindLabel(kind: (typeof CATEGORY_KINDS)[number]): string {
  return kind === "income" ? "Ingreso" : "Gasto";
}
