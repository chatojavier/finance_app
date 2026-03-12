"use client";

import Link from "next/link";
import { useActionState } from "react";

import { CategorySubmitButton } from "@/components/categories/category-submit-button";
import { INITIAL_CATEGORY_ACTION_STATE } from "@/features/categories/action-state";
import { createCategoryAction } from "@/features/categories/actions";
import { CATEGORY_KINDS, getCategoryKindLabel } from "@/features/categories/constants";

export function CreateCategoryForm() {
  const [state, formAction] = useActionState(createCategoryAction, INITIAL_CATEGORY_ACTION_STATE);

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
          placeholder="Ej. Gasto financiero"
        />
      </label>

      <label className="block space-y-2">
        <span className="text-sm font-medium text-slate-900">Tipo</span>
        <select
          name="kind"
          required
          defaultValue={CATEGORY_KINDS[1]}
          className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm text-slate-950 transition outline-none focus:border-emerald-500 focus:bg-white"
        >
          {CATEGORY_KINDS.map((kind) => (
            <option key={kind} value={kind}>
              {getCategoryKindLabel(kind)}
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
        <CategorySubmitButton pendingLabel="Creando categoría...">
          Crear categoría
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
