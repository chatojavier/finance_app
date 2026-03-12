import { getCategoryKindLabel } from "@/features/categories/constants";
import type { CategoryKind } from "@/features/categories/types";

type CategoryKindBadgeProps = {
  kind: CategoryKind;
};

export function CategoryKindBadge({ kind }: CategoryKindBadgeProps) {
  const classes =
    kind === "income"
      ? "border-emerald-200 bg-emerald-50 text-emerald-800"
      : "border-rose-200 bg-rose-50 text-rose-800";

  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold tracking-wide uppercase ${classes}`}
    >
      {getCategoryKindLabel(kind)}
    </span>
  );
}
