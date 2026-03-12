import Link from "next/link";

export default function AccountNotFound() {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-sm">
      <h3 className="text-xl font-semibold text-slate-950">Cuenta no encontrada</h3>
      <p className="mt-2 text-sm text-slate-600">
        La cuenta no existe o no tienes permisos para verla.
      </p>
      <div className="mt-5">
        <Link
          href="/accounts"
          className="inline-flex h-11 items-center justify-center rounded-xl bg-emerald-600 px-4 text-sm font-semibold text-white transition hover:bg-emerald-700"
        >
          Volver al listado
        </Link>
      </div>
    </div>
  );
}
