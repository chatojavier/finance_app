import type { AccountCurrency } from "@/features/accounts/types";

const BTC_DECIMALS = 8;

export function normalizeDerivedBalance(value: unknown): string {
  if (typeof value === "string") {
    return value;
  }

  if (typeof value === "number" && Number.isFinite(value)) {
    return value.toString();
  }

  return "0";
}

export function formatDerivedBalance(amount: string, currency: AccountCurrency): string {
  const numericAmount = Number(amount);

  if (!Number.isFinite(numericAmount)) {
    return amount;
  }

  if (currency === "BTC") {
    return `₿${numericAmount.toFixed(BTC_DECIMALS)}`;
  }

  try {
    return new Intl.NumberFormat("es-PE", {
      style: "currency",
      currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(numericAmount);
  } catch {
    return `${numericAmount.toFixed(2)} ${currency}`;
  }
}
