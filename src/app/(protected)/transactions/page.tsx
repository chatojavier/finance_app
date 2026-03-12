import { PlaceholderPage } from "@/components/app/placeholder-page";
import { getRequiredRouteConfig } from "@/config/navigation";
import { getCategoryKindLabel } from "@/features/categories/constants";
import { listCategoryOptions } from "@/features/categories/data";
import type { CategoryOption } from "@/features/categories/types";

export default async function TransactionsPage() {
  const route = getRequiredRouteConfig("/transactions");
  let categoryOptions: CategoryOption[] = [];
  let categoriesError: string | null = null;

  try {
    categoryOptions = await listCategoryOptions();
  } catch {
    categoriesError = "No se pudieron cargar las categorías disponibles.";
  }

  const firstCategoryOption = categoryOptions[0] ?? null;

  return (
    <div className="space-y-6">
      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <p className="text-xs font-semibold tracking-[0.18em] text-emerald-700 uppercase">
          Integración DEV-006
        </p>
        <h3 className="mt-3 text-lg font-semibold text-slate-950">Categorías disponibles</h3>
        {categoriesError ? (
          <p className="mt-2 text-sm text-rose-700">{categoriesError}</p>
        ) : categoryOptions.length === 0 ? (
          <p className="mt-2 text-sm text-slate-600">
            Aún no hay categorías. Crea al menos una en el módulo de Categories para usarla en
            Movimientos MVP.
          </p>
        ) : (
          <div className="mt-4 space-y-3">
            <label className="block space-y-2">
              <span className="text-sm font-medium text-slate-900">Categoría (preview)</span>
              <select
                disabled
                defaultValue={firstCategoryOption?.id ?? ""}
                className="h-11 w-full rounded-xl border border-slate-200 bg-slate-100 px-3 text-sm text-slate-700"
              >
                {categoryOptions.map((category) => (
                  <option key={category.id} value={category.id}>
                    {getCategoryKindLabel(category.kind)} · {category.name}
                  </option>
                ))}
              </select>
            </label>
            <p className="text-sm text-slate-600">
              Estas categorías ya están listas para el selector real que se implementará en DEV-007.
            </p>
          </div>
        )}
      </section>

      <PlaceholderPage title={route.title} description={route.description} />
    </div>
  );
}
