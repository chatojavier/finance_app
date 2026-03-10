"use client";

import Link from "next/link";
import { useActionState } from "react";

import { ACCOUNT_TYPES } from "@/features/accounts/constants";
import { updateAccountAction } from "@/features/accounts/actions";
import { INITIAL_ACCOUNT_ACTION_STATE } from "@/features/accounts/action-state";
import type { AccountDetail } from "@/features/accounts/types";

import { AccountSubmitButton } from "./account-submit-button";

type EditAccountFormProps = {
  account: AccountDetail;
};

export function EditAccountForm({ account }: EditAccountFormProps) {
  const updateAccountActionWithId = updateAccountAction.bind(null, account.id);
  const [state, formAction] = useActionState(
    updateAccountActionWithId,
    INITIAL_ACCOUNT_ACTION_STATE
  );

  return (
    <form
      action={formAction}
      className="space-y-5 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm"
    >
      <label className="block space-y-2">
        <span className="text-sm font-medium text-slate-900">Nombre</span>
        <input
          name="name"
          required
          defaultValue={account.name}
          className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm text-slate-950 transition outline-none focus:border-emerald-500 focus:bg-white"
        />
      </label>

      <label className="block space-y-2">
        <span className="text-sm font-medium text-slate-900">Tipo</span>
        <select
          name="type"
          required
          defaultValue={account.type}
          className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm text-slate-950 transition outline-none focus:border-emerald-500 focus:bg-white"
        >
          {ACCOUNT_TYPES.map((type) => (
            <option key={type} value={type}>
              {type === "asset" ? "Asset" : "Liability"}
            </option>
          ))}
        </select>
      </label>

      <label className="block space-y-2">
        <span className="text-sm font-medium text-slate-900">Moneda (inmutable)</span>
        <input
          value={account.currency}
          readOnly
          aria-readonly="true"
          className="h-11 w-full cursor-not-allowed rounded-xl border border-slate-200 bg-slate-100 px-3 text-sm text-slate-700"
        />
      </label>

      <label className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 p-3">
        <input
          name="archived"
          type="checkbox"
          defaultChecked={account.archived}
          className="h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
        />
        <span className="text-sm font-medium text-slate-900">Cuenta archivada</span>
      </label>

      {state.error ? (
        <p className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
          {state.error}
        </p>
      ) : null}

      <div className="flex flex-wrap items-center gap-3">
        <AccountSubmitButton pendingLabel="Guardando cambios...">
          Guardar cambios
        </AccountSubmitButton>
        <Link
          href={`/accounts/${account.id}`}
          className="inline-flex h-11 items-center justify-center rounded-xl border border-slate-200 px-4 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-100"
        >
          Cancelar
        </Link>
      </div>
    </form>
  );
}
