export function AccountsLoadingSkeleton() {
  return (
    <div className="space-y-6">
      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="h-4 w-32 animate-pulse rounded bg-slate-200" />
        <div className="mt-3 h-8 w-1/2 animate-pulse rounded bg-slate-200" />
        <div className="mt-2 h-4 w-2/3 animate-pulse rounded bg-slate-200" />
      </section>

      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="space-y-3">
          <div className="h-4 w-full animate-pulse rounded bg-slate-200" />
          <div className="h-4 w-full animate-pulse rounded bg-slate-200" />
          <div className="h-4 w-3/4 animate-pulse rounded bg-slate-200" />
        </div>
      </section>
    </div>
  );
}
