import type { ACCOUNT_CURRENCIES, ACCOUNT_TYPES } from "@/features/accounts/constants";

export type AccountType = (typeof ACCOUNT_TYPES)[number];
export type AccountCurrency = (typeof ACCOUNT_CURRENCIES)[number];
export type TransactionDirection = "in" | "out";

export type AccountListItem = {
  id: string;
  name: string;
  type: AccountType;
  currency: AccountCurrency;
  archived: boolean;
  derivedBalance: string;
  createdAt: string;
  updatedAt: string;
};

export type AccountDetail = AccountListItem;

export type AccountRecentTransaction = {
  id: string;
  amount: string;
  direction: TransactionDirection;
  currency: AccountCurrency;
  occurredAt: string;
  note: string | null;
};

export type CreateAccountInput = {
  name: string;
  type: AccountType;
  currency: AccountCurrency;
};

export type UpdateAccountInput = {
  name: string;
  type: AccountType;
  archived: boolean;
};

export type AccountActionState = {
  error: string | null;
};
