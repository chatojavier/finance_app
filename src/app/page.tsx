export default function Home() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-4xl flex-col justify-center px-6 py-16 sm:px-10">
      <span className="mb-4 inline-block rounded-full bg-emerald-100 px-3 py-1 text-sm font-medium text-emerald-800">
        DEV-001 Setup Base
      </span>
      <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">Personal Finance App</h1>
      <p className="mt-4 max-w-2xl text-lg text-neutral-600">
        Proyecto inicial con Next.js, TypeScript, Tailwind y estándares de calidad para habilitar el
        desarrollo del Sprint 1.
      </p>
      <section className="mt-10 rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
        <h2 className="text-xl font-semibold">Estado del setup</h2>
        <ul className="mt-4 list-disc space-y-2 pl-5 text-neutral-700">
          <li>Lint, typecheck y formato configurados</li>
          <li>Vitest y Playwright inicializados</li>
          <li>Estructura de carpetas base lista</li>
        </ul>
      </section>
    </main>
  );
}
