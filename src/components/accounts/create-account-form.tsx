"use client";

import Link from "next/link";
import { useActionState } from "react";

import { ACCOUNT_CURRENCIES, ACCOUNT_TYPES } from "@/features/accounts/constants";
import { createAccountAction } from "@/features/accounts/actions";
import { INITIAL_ACCOUNT_ACTION_STATE } from "@/features/accounts/action-state";

import { AccountSubmitButton } from "./account-submit-button";

export function CreateAccountForm() {
  const [state, formAction] = useActionState(createAccountAction, INITIAL_ACCOUNT_ACTION_STATE);

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
          className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm text-slate-950 transition outline-none focus:border-emerald-500 focus:bg-white"
          placeholder="Ej. Cuenta principal"
        />
      </label>

      <label className="block space-y-2">
        <span className="text-sm font-medium text-slate-900">Tipo</span>
        <select
          name="type"
          required
          className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm text-slate-950 transition outline-none focus:border-emerald-500 focus:bg-white"
          defaultValue={ACCOUNT_TYPES[0]}
        >
          {ACCOUNT_TYPES.map((type) => (
            <option key={type} value={type}>
              {type === "asset" ? "Asset" : "Liability"}
            </option>
          ))}
        </select>
      </label>

      <label className="block space-y-2">
        <span className="text-sm font-medium text-slate-900">Moneda</span>
        <select
          name="currency"
          required
          className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm text-slate-950 transition outline-none focus:border-emerald-500 focus:bg-white"
          defaultValue={ACCOUNT_CURRENCIES[0]}
        >
          {ACCOUNT_CURRENCIES.map((currency) => (
            <option key={currency} value={currency}>
              {currency}
            </option>
          ))}
        </select>
      </label>

      {state.error ? (
        <p className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
          {state.error}
        </p>
      ) : null}

      <div className="flex flex-wrap items-center gap-3">
        <AccountSubmitButton pendingLabel="Creando cuenta...">Crear cuenta</AccountSubmitButton>
        <Link
          href="/accounts"
          className="inline-flex h-11 items-center justify-center rounded-xl border border-slate-200 px-4 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-100"
        >
          Cancelar
        </Link>
      </div>
    </form>
  );
}
