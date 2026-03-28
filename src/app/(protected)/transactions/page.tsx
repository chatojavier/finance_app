import Link from "next/link";
import { unstable_noStore as noStore } from "next/cache";

import { CreateTransactionForm } from "@/components/transactions/create-transaction-form";
import { formatDerivedBalance } from "@/features/accounts/balance";
import { getCategoryKindLabel } from "@/features/categories/constants";
import { listCategoryOptions } from "@/features/categories/data";
import {
  listTransactionAccountOptions,
  listTransactions,
  resolveTransactionAccountFilter,
} from "@/features/transactions/data";
import type { TransactionListItem } from "@/features/transactions/types";

type TransactionsPageProps = {
  searchParams: Promise<{
    accountId?: string;
  }>;
};

function formatTransactionDate(occurredAt: string): string {
  const date = new Date(occurredAt);
  if (Number.isNaN(date.valueOf())) {
    return occurredAt;
  }

  return date.toLocaleString("es-PE", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

function formatTransactionAmount(transaction: TransactionListItem): string {
  const formattedAmount = formatDerivedBalance(transaction.amount, transaction.currency);
  return `${transaction.direction === "in" ? "+" : "-"} ${formattedAmount}`;
}

export default async function TransactionsPage({ searchParams }: TransactionsPageProps) {
  noStore();

  const params = await searchParams;
  const requestedAccountId = params.accountId?.trim() || null;

  const [accountFilter, accountOptions, categoryOptions] = await Promise.all([
    resolveTransactionAccountFilter(requestedAccountId),
    listTransactionAccountOptions(),
    listCategoryOptions(),
  ]);

  const activeFilteredAccount =
    accountFilter.selectedAccount &&
    accountOptions.some((account) => account.id === accountFilter.selectedAccount?.id)
      ? accountFilter.selectedAccount
      : null;
  const effectiveFilterError =
    accountFilter.selectedAccount && !activeFilteredAccount
      ? "La cuenta preseleccionada está archivada. Desarchívala o limpia el filtro para registrar movimientos."
      : accountFilter.error;

  const transactions = await listTransactions(activeFilteredAccount?.id);

  return (
    <div className="space-y-6">
      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <p className="text-xs font-semibold tracking-[0.18em] text-emerald-700 uppercase">
          Transactions MVP
        </p>
        <h3 className="mt-3 text-2xl font-semibold tracking-tight text-slate-950">
          Tus movimientos
        </h3>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600">
          Registra ingresos y egresos, visualiza la actividad reciente y revisa cómo impactan en los
          saldos derivados de tus cuentas.
        </p>
        {activeFilteredAccount ? (
          <div className="mt-5 flex flex-wrap items-center gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-950">
            <span>
              Filtro activo: <span className="font-semibold">{activeFilteredAccount.name}</span>
            </span>
            <Link
              href="/transactions"
              className="inline-flex h-9 items-center justify-center rounded-lg border border-emerald-300 px-3 text-sm font-semibold text-emerald-900 transition hover:bg-emerald-100"
            >
              Limpiar filtro
            </Link>
          </div>
        ) : null}
        {!activeFilteredAccount && effectiveFilterError ? (
          <div className="mt-5 flex flex-wrap items-center gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-950">
            <span>{effectiveFilterError}</span>
            <Link
              href="/transactions"
              className="inline-flex h-9 items-center justify-center rounded-lg border border-amber-300 px-3 text-sm font-semibold text-amber-900 transition hover:bg-amber-100"
            >
              Limpiar filtro
            </Link>
          </div>
        ) : null}
      </section>

      <CreateTransactionForm
        accountOptions={accountOptions}
        categoryOptions={categoryOptions}
        initialAccountId={activeFilteredAccount?.id ?? null}
        lockedAccount={activeFilteredAccount}
        filterError={effectiveFilterError}
        returnAccountId={activeFilteredAccount?.id ?? null}
      />

      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h4 className="text-lg font-semibold text-slate-950">Actividad reciente</h4>
            <p className="mt-2 text-sm text-slate-600">
              {activeFilteredAccount
                ? `Mostrando movimientos de ${activeFilteredAccount.name}.`
                : "Mostrando movimientos de todas tus cuentas."}
            </p>
          </div>
        </div>

        {transactions.length === 0 ? (
          <div className="mt-5 rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center">
            <h5 className="text-lg font-semibold text-slate-950">Aún no tienes movimientos</h5>
            <p className="mt-2 text-sm text-slate-600">
              Registra tu primer ingreso o egreso para empezar a construir el historial de la
              cuenta.
            </p>
          </div>
        ) : (
          <ul className="mt-5 space-y-4">
            {transactions.map((transaction) => (
              <li
                key={transaction.id}
                className="rounded-2xl border border-slate-200 bg-slate-50 p-4"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="text-base font-semibold text-slate-950">
                      {formatTransactionAmount(transaction)}
                    </p>
                    <p className="mt-1 text-sm text-slate-600">{transaction.account.name}</p>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold uppercase ${
                        transaction.direction === "in"
                          ? "bg-emerald-100 text-emerald-800"
                          : "bg-rose-100 text-rose-800"
                      }`}
                    >
                      {transaction.direction === "in" ? "Ingreso" : "Egreso"}
                    </span>
                    {transaction.category ? (
                      <span className="inline-flex items-center rounded-full border border-slate-200 bg-white px-2.5 py-1 text-xs font-semibold text-slate-700">
                        {getCategoryKindLabel(transaction.category.kind)} ·{" "}
                        {transaction.category.name}
                      </span>
                    ) : (
                      <span className="inline-flex items-center rounded-full border border-slate-200 bg-white px-2.5 py-1 text-xs font-semibold text-slate-500">
                        Sin categoría
                      </span>
                    )}
                  </div>
                </div>
                <p className="mt-3 text-sm text-slate-600">{transaction.note || "Sin nota"}</p>
                <p className="mt-2 text-xs text-slate-500">
                  {formatTransactionDate(transaction.occurredAt)}
                </p>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
