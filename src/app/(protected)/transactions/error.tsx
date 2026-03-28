"use client";

type TransactionsErrorProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function TransactionsError({ error, reset }: TransactionsErrorProps) {
  if (process.env.NODE_ENV !== "production") {
    console.error("Transactions route error", error);
  }

  return (
    <div className="rounded-3xl border border-rose-200 bg-rose-50 p-6">
      <h3 className="text-lg font-semibold text-rose-900">
        No se pudo cargar la vista de movimientos
      </h3>
      <p className="mt-2 text-sm text-rose-800">Ocurrió un error inesperado. Intenta nuevamente.</p>
      <button
        type="button"
        onClick={() => reset()}
        className="mt-5 inline-flex h-10 items-center justify-center rounded-xl border border-rose-300 bg-white px-4 text-sm font-semibold text-rose-800 transition hover:bg-rose-100"
      >
        Reintentar
      </button>
    </div>
  );
}
