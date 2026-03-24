import "server-only";

import { isUuid } from "@/features/accounts/id";
import { getCategoryById } from "@/features/categories/data";
import { createServerSupabaseClient } from "@/lib/supabase/server-client";
import type {
  TransactionAccountFilterResult,
  TransactionAccountOption,
  TransactionListItem,
} from "./types";

type AccountOptionRow = {
  id: string;
  name: string;
  currency: string;
  archived: boolean;
};

type TransactionRow = {
  id: string;
  amount: string | number;
  direction: string;
  currency: string;
  occurred_at: string;
  created_at: string;
  note: string | null;
  account:
    | {
        id: string;
        name: string;
        currency: string;
      }
    | Array<{
        id: string;
        name: string;
        currency: string;
      }>
    | null;
  category:
    | {
        id: string;
        name: string;
        kind: string;
      }
    | Array<{
        id: string;
        name: string;
        kind: string;
      }>
    | null;
};

function mapAccountOption(row: AccountOptionRow): TransactionAccountOption {
  return {
    id: row.id,
    name: row.name,
    currency: row.currency as TransactionAccountOption["currency"],
    archived: row.archived,
  };
}

function unwrapRelation<T>(value: T | T[] | null): T | null {
  if (Array.isArray(value)) {
    return value[0] ?? null;
  }

  return value;
}

function mapTransactionRow(row: TransactionRow): TransactionListItem | null {
  const account = unwrapRelation(row.account);
  const category = unwrapRelation(row.category);

  if (!account) {
    return null;
  }

  return {
    id: row.id,
    amount: typeof row.amount === "string" ? row.amount : row.amount.toString(),
    direction: row.direction as TransactionListItem["direction"],
    currency: row.currency as TransactionListItem["currency"],
    occurredAt: row.occurred_at,
    createdAt: row.created_at,
    note: row.note,
    account: {
      id: account.id,
      name: account.name,
      currency: account.currency as TransactionListItem["account"]["currency"],
    },
    category: category
      ? {
          id: category.id,
          name: category.name,
          kind: category.kind as NonNullable<TransactionListItem["category"]>["kind"],
        }
      : null,
  };
}

export async function listTransactionAccountOptions(): Promise<TransactionAccountOption[]> {
  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase
    .from("accounts")
    .select("id, name, currency, archived")
    .eq("archived", false)
    .order("name", { ascending: true });

  if (error) {
    throw error;
  }

  return (data as AccountOptionRow[] | null)?.map(mapAccountOption) ?? [];
}

export async function getOwnedTransactionAccountById(
  accountId: string
): Promise<TransactionAccountOption | null> {
  if (!isUuid(accountId)) {
    return null;
  }

  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase
    .from("accounts")
    .select("id, name, currency, archived")
    .eq("id", accountId)
    .maybeSingle();

  if (error) {
    throw error;
  }

  if (!data) {
    return null;
  }

  return mapAccountOption(data as AccountOptionRow);
}

export async function resolveTransactionAccountFilter(
  requestedAccountId: string | null
): Promise<TransactionAccountFilterResult> {
  if (!requestedAccountId) {
    return {
      requestedAccountId,
      selectedAccount: null,
      error: null,
    };
  }

  const account = await getOwnedTransactionAccountById(requestedAccountId);
  if (!account) {
    return {
      requestedAccountId,
      selectedAccount: null,
      error: "La cuenta preseleccionada no existe o no te pertenece.",
    };
  }

  if (account.archived) {
    return {
      requestedAccountId,
      selectedAccount: null,
      error:
        "La cuenta preseleccionada está archivada. Desarchívala o limpia el filtro para registrar movimientos.",
    };
  }

  return {
    requestedAccountId,
    selectedAccount: account,
    error: null,
  };
}

export async function listTransactions(accountId?: string): Promise<TransactionListItem[]> {
  const supabase = await createServerSupabaseClient();
  let query = supabase
    .from("transactions")
    .select(
      "id, amount, direction, currency, occurred_at, created_at, note, account:accounts!transactions_account_id_fkey(id, name, currency), category:categories!transactions_category_id_fkey(id, name, kind)"
    )
    .order("occurred_at", { ascending: false })
    .order("created_at", { ascending: false });

  if (accountId) {
    query = query.eq("account_id", accountId);
  }

  const { data, error } = await query;

  if (error) {
    throw error;
  }

  return ((data as TransactionRow[] | null) ?? [])
    .map(mapTransactionRow)
    .filter((transaction): transaction is TransactionListItem => transaction !== null);
}

export async function getOwnedTransactionCategoryById(categoryId: string) {
  return getCategoryById(categoryId);
}
