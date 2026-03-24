import type { AccountCurrency } from "@/features/accounts/types";
import type { CategoryKind, CategoryOption } from "@/features/categories/types";
import type { TRANSACTION_DIRECTIONS } from "@/features/transactions/constants";

export type TransactionDirection = (typeof TRANSACTION_DIRECTIONS)[number];

export type TransactionAccountOption = {
  id: string;
  name: string;
  currency: AccountCurrency;
  archived: boolean;
};

export type TransactionCategoryOption = CategoryOption;

export type TransactionListItem = {
  id: string;
  amount: string;
  direction: TransactionDirection;
  currency: AccountCurrency;
  occurredAt: string;
  createdAt: string;
  note: string | null;
  account: {
    id: string;
    name: string;
    currency: AccountCurrency;
  };
  category: {
    id: string;
    name: string;
    kind: CategoryKind;
  } | null;
};

export type CreateTransactionInput = {
  accountId: string;
  amount: string;
  direction: TransactionDirection;
  occurredAt: string;
  categoryId: string | null;
  note: string | null;
};

export type TransactionActionState = {
  error: string | null;
};

export type TransactionAccountFilterResult =
  | {
      requestedAccountId: string | null;
      selectedAccount: TransactionAccountOption;
      error: null;
    }
  | {
      requestedAccountId: string | null;
      selectedAccount: null;
      error: string;
    }
  | {
      requestedAccountId: string | null;
      selectedAccount: null;
      error: null;
    };
