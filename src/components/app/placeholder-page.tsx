type PlaceholderPageProps = {
  title: string;
  description: string;
};

export function PlaceholderPage({ title, description }: PlaceholderPageProps) {
  return (
    <div className="space-y-6">
      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <p className="text-xs font-semibold tracking-[0.18em] text-emerald-700 uppercase">
          Skeleton route
        </p>
        <h3 className="mt-3 text-2xl font-semibold tracking-tight text-slate-950">{title}</h3>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600">{description}</p>
      </section>

      <section className="grid gap-4 xl:grid-cols-3">
        <article className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <h4 className="text-lg font-semibold text-slate-950">Loading state ready</h4>
          <div className="mt-4 space-y-3">
            <div className="h-4 w-2/3 animate-pulse rounded bg-slate-200" />
            <div className="h-4 w-full animate-pulse rounded bg-slate-200" />
            <div className="h-4 w-4/5 animate-pulse rounded bg-slate-200" />
          </div>
        </article>

        <article className="rounded-3xl border border-dashed border-slate-300 bg-slate-50 p-6">
          <h4 className="text-lg font-semibold text-slate-950">Empty state placeholder</h4>
          <p className="mt-3 text-sm leading-6 text-slate-600">
            Esta vista ya vive dentro del shell privado y queda lista para recibir data real en el
            siguiente ticket del dominio.
          </p>
        </article>

        <article className="rounded-3xl border border-amber-200 bg-amber-50 p-6">
          <h4 className="text-lg font-semibold text-amber-950">Next step</h4>
          <p className="mt-3 text-sm leading-6 text-amber-900">
            Con auth y guards activos, esta ruta ya puede evolucionar sin rearmar navegación,
            layouts ni control de sesión.
          </p>
        </article>
      </section>
    </div>
  );
}
