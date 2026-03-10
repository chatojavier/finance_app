import { PlaceholderPage } from "@/components/app/placeholder-page";
import { getRequiredRouteConfig } from "@/config/navigation";

type TransactionsPageProps = {
  searchParams: Promise<{
    accountId?: string;
  }>;
};

export default async function TransactionsPage({ searchParams }: TransactionsPageProps) {
  const route = getRequiredRouteConfig("/transactions");
  const params = await searchParams;
  const accountId = params.accountId?.trim();

  return (
    <div className="space-y-6">
      {accountId ? (
        <section className="rounded-3xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-900">
          Cuenta preseleccionada: <span className="font-semibold">{accountId}</span>
        </section>
      ) : null}
      <PlaceholderPage title={route.title} description={route.description} />
    </div>
  );
}
