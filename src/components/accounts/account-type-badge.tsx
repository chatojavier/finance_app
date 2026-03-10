import type { AccountType } from "@/features/accounts/types";

type AccountTypeBadgeProps = {
  type: AccountType;
};

export function AccountTypeBadge({ type }: AccountTypeBadgeProps) {
  const isAsset = type === "asset";
  const label = isAsset ? "Asset" : "Liability";
  const classes = isAsset
    ? "border-emerald-200 bg-emerald-50 text-emerald-800"
    : "border-amber-200 bg-amber-50 text-amber-900";

  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold tracking-wide uppercase ${classes}`}
    >
      {label}
    </span>
  );
}
