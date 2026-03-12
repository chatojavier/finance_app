import Link from "next/link";

import { CategoryKindBadge } from "@/components/categories/category-kind-badge";
import { listCategories } from "@/features/categories/data";

export default async function CategoriesPage() {
  const categories = await listCategories();

  return (
    <div className="space-y-6">
      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <p className="text-xs font-semibold tracking-[0.18em] text-emerald-700 uppercase">
          Categories MVP
        </p>
        <h3 className="mt-3 text-2xl font-semibold tracking-tight text-slate-950">
          Tus categorías
        </h3>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600">
          Crea y edita categorías para clasificar movimientos por tipo de ingreso o gasto.
        </p>
        <div className="mt-6">
          <Link
            href="/categories/new"
            className="inline-flex h-11 items-center justify-center rounded-xl bg-emerald-600 px-4 text-sm font-semibold text-white transition hover:bg-emerald-700"
          >
            Crear categoría
          </Link>
        </div>
      </section>

      {categories.length === 0 ? (
        <section className="rounded-3xl border border-dashed border-slate-300 bg-white p-8 text-center shadow-sm">
          <h4 className="text-lg font-semibold text-slate-950">Aún no tienes categorías</h4>
          <p className="mt-2 text-sm text-slate-600">
            Crea tu primera categoría para poder clasificar movimientos.
          </p>
          <div className="mt-5">
            <Link
              href="/categories/new"
              className="inline-flex h-11 items-center justify-center rounded-xl bg-emerald-600 px-4 text-sm font-semibold text-white transition hover:bg-emerald-700"
            >
              Crear categoría
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
                    Nombre
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold tracking-wide text-slate-500 uppercase">
                    Tipo
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-semibold tracking-wide text-slate-500 uppercase">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {categories.map((category) => (
                  <tr key={category.id}>
                    <td className="px-4 py-4">
                      <p className="font-semibold text-slate-950">{category.name}</p>
                    </td>
                    <td className="px-4 py-4">
                      <CategoryKindBadge kind={category.kind} />
                    </td>
                    <td className="px-4 py-4 text-right">
                      <Link
                        href={`/categories/${category.id}/edit`}
                        className="text-sm font-semibold text-slate-700 hover:text-slate-900"
                      >
                        Editar
                      </Link>
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
