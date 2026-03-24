"use client";

import Link from "next/link";
import { useActionState } from "react";

import { CategorySubmitButton } from "@/components/categories/category-submit-button";
import { INITIAL_CATEGORY_ACTION_STATE } from "@/features/categories/action-state";
import { updateCategoryAction } from "@/features/categories/actions";
import { CATEGORY_KINDS, getCategoryKindLabel } from "@/features/categories/constants";
import type { CategoryListItem } from "@/features/categories/types";

type EditCategoryFormProps = {
  category: CategoryListItem;
  hasTransactions: boolean;
};

export function EditCategoryForm({ category, hasTransactions }: EditCategoryFormProps) {
  const updateCategoryActionWithId = updateCategoryAction.bind(null, category.id);
  const [state, formAction] = useActionState(
    updateCategoryActionWithId,
    INITIAL_CATEGORY_ACTION_STATE
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
          defaultValue={category.name}
          className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm text-slate-950 transition outline-none focus:border-emerald-500 focus:bg-white"
        />
      </label>

      {hasTransactions ? <input type="hidden" name="kind" value={category.kind} /> : null}
      <label className="block space-y-2">
        <span className="text-sm font-medium text-slate-900">Tipo</span>
        <select
          name="kind"
          required
          disabled={hasTransactions}
          defaultValue={category.kind}
          className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm text-slate-950 transition outline-none focus:border-emerald-500 focus:bg-white disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-500"
        >
          {CATEGORY_KINDS.map((kind) => (
            <option key={kind} value={kind}>
              {getCategoryKindLabel(kind)}
            </option>
          ))}
        </select>
      </label>

      {hasTransactions ? (
        <p className="rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900">
          Esta categoría ya tiene movimientos. El tipo queda bloqueado para evitar inconsistencias.
        </p>
      ) : null}

      {state.error ? (
        <p className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
          {state.error}
        </p>
      ) : null}

      <div className="flex flex-wrap items-center gap-3">
        <CategorySubmitButton pendingLabel="Guardando cambios...">
          Guardar cambios
        </CategorySubmitButton>
        <Link
          href="/categories"
          className="inline-flex h-11 items-center justify-center rounded-xl border border-slate-200 px-4 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-100"
        >
          Cancelar
        </Link>
      </div>
    </form>
  );
}
