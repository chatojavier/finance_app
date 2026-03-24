import Link from "next/link";

import { AccountTypeBadge } from "@/components/accounts/account-type-badge";
import { formatDerivedBalance } from "@/features/accounts/balance";
import { listAccountsWithBalance } from "@/features/accounts/data";

type AccountsPageProps = {
  searchParams: Promise<{
    archived?: string;
  }>;
};

function getArchivedFilterHref(includeArchived: boolean): string {
  return includeArchived ? "/accounts?archived=1" : "/accounts";
}

export default async function AccountsPage({ searchParams }: AccountsPageProps) {
  const params = await searchParams;
  const includeArchived = params.archived === "1";
  const accounts = await listAccountsWithBalance(includeArchived);

  return (
    <div className="space-y-6">
      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <p className="text-xs font-semibold tracking-[0.18em] text-emerald-700 uppercase">
          Accounts MVP
        </p>
        <h3 className="mt-3 text-2xl font-semibold tracking-tight text-slate-950">
          Tus cuentas financieras
        </h3>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600">
          Crea y administra cuentas con moneda obligatoria y saldo derivado desde movimientos.
        </p>
        <div className="mt-6 flex flex-wrap items-center gap-3">
          <Link
            href="/accounts/new"
            className="inline-flex h-11 items-center justify-center rounded-xl bg-emerald-600 px-4 text-sm font-semibold text-white transition hover:bg-emerald-700"
          >
            Crear cuenta
          </Link>
          <Link
            href={getArchivedFilterHref(!includeArchived)}
            className="inline-flex h-11 items-center justify-center rounded-xl border border-slate-200 px-4 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-100"
          >
            {includeArchived ? "Ocultar archivadas" : "Mostrar archivadas"}
          </Link>
        </div>
      </section>

      {accounts.length === 0 ? (
        <section className="rounded-3xl border border-dashed border-slate-300 bg-white p-8 text-center shadow-sm">
          <h4 className="text-lg font-semibold text-slate-950">Aún no tienes cuentas</h4>
          <p className="mt-2 text-sm text-slate-600">
            Crea tu primera cuenta para empezar a registrar movimientos.
          </p>
          <div className="mt-5">
            <Link
              href="/accounts/new"
              className="inline-flex h-11 items-center justify-center rounded-xl bg-emerald-600 px-4 text-sm font-semibold text-white transition hover:bg-emerald-700"
            >
              Crear cuenta
            </Link>
          </div>
        </section>
      ) : (
        <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold tracking-wide text-slate-500 uppercase">
                    Cuenta
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold tracking-wide text-slate-500 uppercase">
                    Tipo
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold tracking-wide text-slate-500 uppercase">
                    Moneda
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold tracking-wide text-slate-500 uppercase">
                    Saldo derivado
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold tracking-wide text-slate-500 uppercase">
                    Estado
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-semibold tracking-wide text-slate-500 uppercase">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {accounts.map((account) => (
                  <tr key={account.id}>
                    <td className="px-4 py-4">
                      <p className="font-semibold text-slate-950">{account.name}</p>
                    </td>
                    <td className="px-4 py-4">
                      <AccountTypeBadge type={account.type} />
                    </td>
                    <td className="px-4 py-4 text-sm text-slate-700">{account.currency}</td>
                    <td className="px-4 py-4 text-sm font-semibold text-slate-900">
                      {formatDerivedBalance(account.derivedBalance, account.currency)}
                    </td>
                    <td className="px-4 py-4 text-sm text-slate-700">
                      {account.archived ? (
                        <span className="inline-flex items-center rounded-full border border-slate-300 bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-700 uppercase">
                          Archivada
                        </span>
                      ) : (
                        <span className="inline-flex items-center rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700 uppercase">
                          Activa
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-4 text-right">
                      <div className="inline-flex items-center gap-3">
                        <Link
                          href={`/accounts/${account.id}`}
                          className="text-sm font-semibold text-emerald-700 hover:text-emerald-800"
                        >
                          Ver
                        </Link>
                        <Link
                          href={`/accounts/${account.id}/edit`}
                          className="text-sm font-semibold text-slate-700 hover:text-slate-900"
                        >
                          Editar
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}
    </div>
  );
}
