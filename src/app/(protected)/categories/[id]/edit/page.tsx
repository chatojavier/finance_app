import { notFound } from "next/navigation";

import { EditCategoryForm } from "@/components/categories/edit-category-form";
import { getCategoryById, hasCategoryTransactions } from "@/features/categories/data";

type EditCategoryPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function EditCategoryPage({ params }: EditCategoryPageProps) {
  const { id } = await params;
  const [category, categoryHasTransactions] = await Promise.all([
    getCategoryById(id),
    hasCategoryTransactions(id),
  ]);

  if (!category) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <p className="text-xs font-semibold tracking-[0.18em] text-emerald-700 uppercase">
          Editar categoría
        </p>
        <h3 className="mt-3 text-2xl font-semibold tracking-tight text-slate-950">
          {category.name}
        </h3>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600">
          Puedes actualizar el nombre. El tipo solo se puede cambiar si aún no existen movimientos
          asociados.
        </p>
      </section>

      <EditCategoryForm category={category} hasTransactions={categoryHasTransactions} />
    </div>
  );
}
