import { notFound } from "next/navigation";

import { EditAccountForm } from "@/components/accounts/edit-account-form";
import { getAccountByIdWithBalance } from "@/features/accounts/data";

type EditAccountPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function EditAccountPage({ params }: EditAccountPageProps) {
  const { id } = await params;
  const account = await getAccountByIdWithBalance(id);

  if (!account) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <p className="text-xs font-semibold tracking-[0.18em] text-emerald-700 uppercase">
          Editar cuenta
        </p>
        <h3 className="mt-3 text-2xl font-semibold tracking-tight text-slate-950">
          {account.name}
        </h3>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600">
          Puedes actualizar nombre, tipo y estado de archivado. La moneda es inmutable.
        </p>
      </section>

      <EditAccountForm account={account} />
    </div>
  );
}
