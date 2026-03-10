import "server-only";

import { DEFAULT_RECENT_TRANSACTIONS_LIMIT } from "@/features/accounts/constants";
import { normalizeDerivedBalance } from "@/features/accounts/balance";
import type {
  AccountDetail,
  AccountListItem,
  AccountRecentTransaction,
  TransactionDirection,
} from "@/features/accounts/types";
import { createServerSupabaseClient } from "@/lib/supabase/server-client";

type AccountWithBalanceRow = {
  id: string;
  name: string;
  type: string;
  currency: string;
  archived: boolean;
  created_at: string;
  updated_at: string;
  derived_balance: string | number | null;
};

type RecentTransactionRow = {
  id: string;
  amount: string | number;
  direction: string;
  currency: string;
  occurred_at: string;
  note: string | null;
};

function mapAccountRow(row: AccountWithBalanceRow): AccountListItem {
  return {
    id: row.id,
    name: row.name,
    type: row.type as AccountListItem["type"],
    currency: row.currency as AccountListItem["currency"],
    archived: row.archived,
    derivedBalance: normalizeDerivedBalance(row.derived_balance),
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function mapRecentTransactionRow(row: RecentTransactionRow): AccountRecentTransaction {
  return {
    id: row.id,
    amount: typeof row.amount === "string" ? row.amount : row.amount.toString(),
    direction: row.direction as TransactionDirection,
    currency: row.currency as AccountRecentTransaction["currency"],
    occurredAt: row.occurred_at,
    note: row.note,
  };
}

export async function listAccountsWithBalance(
  includeArchived: boolean
): Promise<AccountListItem[]> {
  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase.rpc("get_accounts_with_balance", {
    p_include_archived: includeArchived,
  });

  if (error) {
    throw error;
  }

  return (data as AccountWithBalanceRow[] | null)?.map(mapAccountRow) ?? [];
}

export async function getAccountByIdWithBalance(accountId: string): Promise<AccountDetail | null> {
  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase.rpc("get_account_with_balance", {
    p_account_id: accountId,
  });

  if (error) {
    throw error;
  }

  const row = (data as AccountWithBalanceRow[] | null)?.[0] ?? null;
  return row ? mapAccountRow(row) : null;
}

export async function listRecentTransactionsForAccount(
  accountId: string,
  limit = DEFAULT_RECENT_TRANSACTIONS_LIMIT
): Promise<AccountRecentTransaction[]> {
  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase
    .from("transactions")
    .select("id, amount, direction, currency, occurred_at, note")
    .eq("account_id", accountId)
    .order("occurred_at", { ascending: false })
    .limit(limit);

  if (error) {
    throw error;
  }

  return (data as RecentTransactionRow[] | null)?.map(mapRecentTransactionRow) ?? [];
}
