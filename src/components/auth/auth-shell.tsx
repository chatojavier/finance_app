import type { ReactNode } from "react";

type AuthShellProps = {
  children: ReactNode;
};

export function AuthShell({ children }: AuthShellProps) {
  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(16,185,129,0.16),_transparent_38%),linear-gradient(180deg,_#f8fafc_0%,_#eef4f1_100%)] px-6 py-10 sm:px-10 lg:px-16">
      <div className="mx-auto flex min-h-[calc(100vh-5rem)] max-w-6xl items-center justify-center">
        <div className="grid w-full items-center gap-8 lg:grid-cols-[minmax(0,1fr)_480px]">
          <section className="hidden max-w-xl lg:block">
            <span className="inline-flex rounded-full border border-emerald-200 bg-white/80 px-3 py-1 text-sm font-medium text-emerald-700 backdrop-blur">
              DEV-003 Auth MVP
            </span>
            <h1 className="mt-6 text-5xl font-semibold tracking-tight text-slate-950">
              Personal finance, protected from the first session.
            </h1>
            <p className="mt-4 text-lg leading-8 text-slate-600">
              Login y signup quedan operativos sobre el shell privado del MVP para habilitar
              cuentas, movimientos y QA del Sprint 1.
            </p>
          </section>
          <section>{children}</section>
        </div>
      </div>
    </main>
  );
}
