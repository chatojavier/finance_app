import Link from "next/link";
import { notFound } from "next/navigation";

import { AccountTypeBadge } from "@/components/accounts/account-type-badge";
import { formatDerivedBalance } from "@/features/accounts/balance";
import {
  getAccountByIdWithBalance,
  listRecentTransactionsForAccount,
} from "@/features/accounts/data";

type AccountDetailPageProps = {
  params: Promise<{
    id: string;
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

export default async function AccountDetailPage({ params }: AccountDetailPageProps) {
  const { id } = await params;
  const [account, recentTransactions] = await Promise.all([
    getAccountByIdWithBalance(id),
    listRecentTransactionsForAccount(id),
  ]);

  if (!account) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold tracking-[0.18em] text-emerald-700 uppercase">
              Detalle de cuenta
            </p>
            <h3 className="mt-3 text-2xl font-semibold tracking-tight text-slate-950">
              {account.name}
            </h3>
            <p className="mt-2 text-sm text-slate-600">
              Revisa metadata de la cuenta, su saldo derivado y actividad reciente.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <Link
              href={`/accounts/${account.id}/edit`}
              className="inline-flex h-11 items-center justify-center rounded-xl border border-slate-200 px-4 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-100"
            >
              Editar cuenta
            </Link>
            <Link
              href={`/transactions?accountId=${account.id}`}
              className="inline-flex h-11 items-center justify-center rounded-xl bg-emerald-600 px-4 text-sm font-semibold text-white transition hover:bg-emerald-700"
            >
              Crear movimiento
            </Link>
          </div>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-xs font-semibold tracking-wide text-slate-500 uppercase">Tipo</p>
          <div className="mt-2">
            <AccountTypeBadge type={account.type} />
          </div>
        </article>
        <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-xs font-semibold tracking-wide text-slate-500 uppercase">Moneda</p>
          <p className="mt-2 text-lg font-semibold text-slate-950">{account.currency}</p>
        </article>
        <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-xs font-semibold tracking-wide text-slate-500 uppercase">
            Saldo derivado
          </p>
          <p className="mt-2 text-lg font-semibold text-slate-950">
            {formatDerivedBalance(account.derivedBalance, account.currency)}
          </p>
        </article>
        <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-xs font-semibold tracking-wide text-slate-500 uppercase">Estado</p>
          <p className="mt-2 text-lg font-semibold text-slate-950">
            {account.archived ? "Archivada" : "Activa"}
          </p>
        </article>
      </section>

      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <h4 className="text-lg font-semibold text-slate-950">Movimientos recientes</h4>
        {recentTransactions.length === 0 ? (
          <div className="mt-4 rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-5">
            <p className="text-sm text-slate-600">
              Esta cuenta aún no tiene movimientos registrados.
            </p>
          </div>
        ) : (
          <ul className="mt-4 space-y-3">
            {recentTransactions.map((transaction) => (
              <li
                key={transaction.id}
                className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm"
              >
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <p className="font-semibold text-slate-900">
                    {formatDerivedBalance(transaction.amount, transaction.currency)}
                  </p>
                  <span
                    className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold uppercase ${
                      transaction.direction === "in"
                        ? "bg-emerald-100 text-emerald-800"
                        : "bg-rose-100 text-rose-800"
                    }`}
                  >
                    {transaction.direction}
                  </span>
                </div>
                <p className="mt-2 text-slate-600">{transaction.note?.trim() || "Sin nota"}</p>
                <p className="mt-1 text-xs text-slate-500">
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
