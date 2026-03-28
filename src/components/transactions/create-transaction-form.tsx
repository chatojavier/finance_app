"use client";

import Link from "next/link";
import { useState } from "react";
import { useActionState } from "react";

import { INITIAL_TRANSACTION_ACTION_STATE } from "@/features/transactions/action-state";
import { createTransactionAction } from "@/features/transactions/actions";
import { TRANSACTION_AMOUNT_STEP, TRANSACTION_DIRECTIONS } from "@/features/transactions/constants";
import type {
  TransactionAccountOption,
  TransactionCategoryOption,
  TransactionDirection,
} from "@/features/transactions/types";
import {
  filterCategoryOptionsByDirection,
  getDateTimeLocalOffsetMinutes,
  toDateTimeLocalValue,
} from "@/features/transactions/validation";

import { TransactionSubmitButton } from "./transaction-submit-button";

type CreateTransactionFormProps = {
  accountOptions: TransactionAccountOption[];
  categoryOptions: TransactionCategoryOption[];
  initialAccountId: string | null;
  lockedAccount: TransactionAccountOption | null;
  filterError: string | null;
  returnAccountId: string | null;
};

function getInitialOccurredAtState() {
  if (typeof window === "undefined") {
    return {
      occurredAtValue: "",
      occurredAtOffsetMinutes: "",
    };
  }

  const occurredAtValue = toDateTimeLocalValue(new Date());

  return {
    occurredAtValue,
    occurredAtOffsetMinutes: getDateTimeLocalOffsetMinutes(occurredAtValue) ?? "",
  };
}

export function CreateTransactionForm({
  accountOptions,
  categoryOptions,
  initialAccountId,
  lockedAccount,
  filterError,
  returnAccountId,
}: CreateTransactionFormProps) {
  const [state, formAction] = useActionState(
    createTransactionAction,
    INITIAL_TRANSACTION_ACTION_STATE
  );
  const [direction, setDirection] = useState<TransactionDirection>("out");
  const [categoryId, setCategoryId] = useState("");
  const [occurredAtState, setOccurredAtState] = useState(getInitialOccurredAtState);
  const hasActiveAccounts = accountOptions.length > 0 || Boolean(lockedAccount);

  const filteredCategoryOptions = filterCategoryOptionsByDirection(categoryOptions, direction);
  const selectedCategoryId = filteredCategoryOptions.some((category) => category.id === categoryId)
    ? categoryId
    : "";

  return (
    <form
      action={formAction}
      className="space-y-5 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm"
    >
      <div>
        <p className="text-xs font-semibold tracking-[0.18em] text-emerald-700 uppercase">
          Crear movimiento
        </p>
        <h3 className="mt-3 text-xl font-semibold tracking-tight text-slate-950">
          Registra un ingreso o egreso
        </h3>
        <p className="mt-2 text-sm leading-6 text-slate-600">
          El saldo de la cuenta se recalcula automáticamente a partir de este movimiento.
        </p>
      </div>

      {filterError ? (
        <p className="rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900">
          {filterError}
        </p>
      ) : null}

      <input
        type="hidden"
        name="occurred_at_offset_minutes"
        value={occurredAtState.occurredAtOffsetMinutes}
        readOnly
        suppressHydrationWarning
      />

      {!hasActiveAccounts ? (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-5">
          <h4 className="text-base font-semibold text-slate-950">Necesitas una cuenta activa</h4>
          <p className="mt-2 text-sm text-slate-600">
            Crea o desarchiva una cuenta antes de registrar movimientos.
          </p>
          <div className="mt-4">
            <Link
              href="/accounts/new"
              className="inline-flex h-11 items-center justify-center rounded-xl bg-emerald-600 px-4 text-sm font-semibold text-white transition hover:bg-emerald-700"
            >
              Crear cuenta
            </Link>
          </div>
        </div>
      ) : (
        <>
          {lockedAccount ? (
            <>
              <input type="hidden" name="account_id" value={lockedAccount.id} />
              {returnAccountId ? (
                <input type="hidden" name="return_account_id" value={returnAccountId} />
              ) : null}
              <label className="block space-y-2">
                <span className="text-sm font-medium text-slate-900">Cuenta</span>
                <input
                  readOnly
                  value={`${lockedAccount.name} (${lockedAccount.currency})`}
                  aria-readonly="true"
                  className="h-11 w-full cursor-not-allowed rounded-xl border border-slate-200 bg-slate-100 px-3 text-sm text-slate-700"
                />
              </label>
            </>
          ) : (
            <>
              {returnAccountId ? (
                <input type="hidden" name="return_account_id" value={returnAccountId} />
              ) : null}
              <label className="block space-y-2">
                <span className="text-sm font-medium text-slate-900">Cuenta</span>
                <select
                  name="account_id"
                  required
                  defaultValue={initialAccountId ?? ""}
                  className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm text-slate-950 transition outline-none focus:border-emerald-500 focus:bg-white"
                >
                  <option value="">Selecciona una cuenta</option>
                  {accountOptions.map((account) => (
                    <option key={account.id} value={account.id}>
                      {account.name} ({account.currency})
                    </option>
                  ))}
                </select>
              </label>
            </>
          )}

          <div className="grid gap-5 md:grid-cols-2">
            <label className="block space-y-2">
              <span className="text-sm font-medium text-slate-900">Monto</span>
              <input
                name="amount"
                required
                inputMode="decimal"
                min={TRANSACTION_AMOUNT_STEP}
                step={TRANSACTION_AMOUNT_STEP}
                placeholder="0.00"
                className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm text-slate-950 transition outline-none focus:border-emerald-500 focus:bg-white"
              />
            </label>

            <label className="block space-y-2">
              <span className="text-sm font-medium text-slate-900">Dirección</span>
              <select
                name="direction"
                value={direction}
                onChange={(event) => {
                  const nextDirection = event.target.value as TransactionDirection;
                  const nextFilteredCategories = filterCategoryOptionsByDirection(
                    categoryOptions,
                    nextDirection
                  );

                  setDirection(nextDirection);

                  if (!nextFilteredCategories.some((category) => category.id === categoryId)) {
                    setCategoryId("");
                  }
                }}
                className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm text-slate-950 transition outline-none focus:border-emerald-500 focus:bg-white"
              >
                {TRANSACTION_DIRECTIONS.map((transactionDirection) => (
                  <option key={transactionDirection} value={transactionDirection}>
                    {transactionDirection === "in" ? "Ingreso" : "Egreso"}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            <label className="block space-y-2">
              <span className="text-sm font-medium text-slate-900">Fecha</span>
              <input
                name="occurred_at"
                required
                type="datetime-local"
                value={occurredAtState.occurredAtValue}
                onChange={(event) => {
                  const nextOccurredAtValue = event.target.value;

                  setOccurredAtState({
                    occurredAtValue: nextOccurredAtValue,
                    occurredAtOffsetMinutes:
                      getDateTimeLocalOffsetMinutes(nextOccurredAtValue) ?? "",
                  });
                }}
                suppressHydrationWarning
                className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm text-slate-950 transition outline-none focus:border-emerald-500 focus:bg-white"
              />
            </label>

            <label className="block space-y-2">
              <span className="text-sm font-medium text-slate-900">Categoría (opcional)</span>
              <select
                name="category_id"
                value={selectedCategoryId}
                onChange={(event) => setCategoryId(event.target.value)}
                className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm text-slate-950 transition outline-none focus:border-emerald-500 focus:bg-white"
              >
                <option value="">Sin categoría</option>
                {filteredCategoryOptions.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <label className="block space-y-2">
            <span className="text-sm font-medium text-slate-900">Nota (opcional)</span>
            <textarea
              name="note"
              rows={3}
              placeholder="Ej. Compra del supermercado"
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-950 transition outline-none focus:border-emerald-500 focus:bg-white"
            />
          </label>

          {state.error ? (
            <p className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
              {state.error}
            </p>
          ) : null}

          <div className="flex flex-wrap items-center gap-3">
            <TransactionSubmitButton pendingLabel="Guardando movimiento...">
              Guardar movimiento
            </TransactionSubmitButton>
            <Link
              href={
                returnAccountId ? `/transactions?accountId=${returnAccountId}` : "/transactions"
              }
              className="inline-flex h-11 items-center justify-center rounded-xl border border-slate-200 px-4 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-100"
            >
              Limpiar formulario
            </Link>
          </div>
        </>
      )}
    </form>
  );
}
