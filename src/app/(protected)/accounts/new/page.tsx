import { CreateAccountForm } from "@/components/accounts/create-account-form";

export default function NewAccountPage() {
  return (
    <div className="space-y-6">
      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <p className="text-xs font-semibold tracking-[0.18em] text-emerald-700 uppercase">
          Nueva cuenta
        </p>
        <h3 className="mt-3 text-2xl font-semibold tracking-tight text-slate-950">
          Crear cuenta financiera
        </h3>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600">
          Define nombre, tipo y moneda. El saldo inicial se deriva automáticamente desde los
          movimientos.
        </p>
      </section>

      <CreateAccountForm />
    </div>
  );
}
