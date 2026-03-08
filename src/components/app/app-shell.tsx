"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, type ReactNode } from "react";

import {
  DESKTOP_NAV_ITEMS,
  MOBILE_OVERFLOW_NAV_ITEMS,
  MOBILE_PRIMARY_NAV_ITEMS,
  getRouteConfig,
  getRequiredRouteConfig,
  matchesAppPath,
} from "@/config/navigation";
import { logoutAction } from "@/features/auth/actions";

type AppShellProps = {
  children: ReactNode;
  userEmail: string | null;
};

function navLinkClasses(active: boolean): string {
  return active
    ? "bg-emerald-100 text-emerald-900"
    : "text-slate-600 hover:bg-slate-100 hover:text-slate-900";
}

export function AppShell({ children, userEmail }: AppShellProps) {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const currentRoute = getRouteConfig(pathname) ?? getRequiredRouteConfig("/");
  const overflowIsActive = MOBILE_OVERFLOW_NAV_ITEMS.some((item) =>
    matchesAppPath(pathname, item.href)
  );

  return (
    <div className="min-h-screen bg-slate-50 lg:flex">
      <aside className="hidden w-72 shrink-0 border-r border-slate-200 bg-white lg:flex lg:min-h-screen lg:flex-col">
        <div className="border-b border-slate-200 px-6 py-6">
          <p className="text-xs font-semibold tracking-[0.18em] text-emerald-700 uppercase">
            FinanceApp
          </p>
          <h1 className="mt-2 text-xl font-semibold tracking-tight text-slate-950">Private MVP</h1>
        </div>

        <nav className="flex-1 space-y-1 px-4 py-6">
          {DESKTOP_NAV_ITEMS.map((item) => {
            const active = matchesAppPath(pathname, item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center rounded-2xl px-4 py-3 text-sm font-medium transition ${navLinkClasses(active)}`}
              >
                {item.navLabel}
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-slate-200 px-4 py-5">
          <p className="truncate px-2 text-sm text-slate-500">
            {userEmail ?? "Authenticated session"}
          </p>
          <form action={logoutAction} className="mt-3">
            <button
              type="submit"
              className="flex w-full items-center justify-center rounded-2xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-100"
            >
              Log out
            </button>
          </form>
        </div>
      </aside>

      <div className="flex min-h-screen flex-1 flex-col">
        <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/95 backdrop-blur lg:hidden">
          <div className="flex items-center justify-between px-4 py-3">
            <button
              type="button"
              onClick={() => setIsMobileMenuOpen(true)}
              className="rounded-xl border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700"
              aria-label="Open menu"
            >
              Menu
            </button>
            <div className="text-center">
              <p className="text-sm font-semibold text-slate-950">{currentRoute.title}</p>
              <p className="text-xs text-slate-500">Protected area</p>
            </div>
            <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">
              MVP
            </span>
          </div>
        </header>

        <main className="flex-1 px-4 py-6 pb-28 sm:px-6 lg:px-8 lg:py-8 lg:pb-8">
          <div className="hidden items-start justify-between gap-6 lg:flex">
            <div>
              <p className="text-sm font-medium text-emerald-700">Authenticated app shell</p>
              <h2 className="mt-1 text-3xl font-semibold tracking-tight text-slate-950">
                {currentRoute.title}
              </h2>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
                {currentRoute.description}
              </p>
            </div>
            <span className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-semibold tracking-[0.18em] text-slate-500 uppercase">
              Placeholder ready
            </span>
          </div>

          <div className="lg:mt-8">{children}</div>
        </main>

        <nav className="fixed inset-x-0 bottom-0 z-20 border-t border-slate-200 bg-white/95 px-2 py-2 backdrop-blur lg:hidden">
          <div className="grid grid-cols-5 gap-1">
            {MOBILE_PRIMARY_NAV_ITEMS.map((item) => {
              const active = matchesAppPath(pathname, item.href);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`rounded-2xl px-2 py-3 text-center text-xs font-semibold transition ${navLinkClasses(active)}`}
                >
                  {item.navLabel}
                </Link>
              );
            })}

            <button
              type="button"
              onClick={() => setIsMobileMenuOpen(true)}
              className={`rounded-2xl px-2 py-3 text-center text-xs font-semibold transition ${navLinkClasses(overflowIsActive)}`}
            >
              More
            </button>
          </div>
        </nav>
      </div>

      {isMobileMenuOpen ? (
        <div
          className="fixed inset-0 z-30 bg-slate-950/40 lg:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        >
          <div
            className="absolute inset-x-0 bottom-0 rounded-t-3xl bg-white p-5 shadow-2xl"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="mx-auto mb-4 h-1.5 w-14 rounded-full bg-slate-200" />
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-slate-950">More</p>
                <p className="text-sm text-slate-500">{userEmail ?? "Authenticated session"}</p>
              </div>
              <button
                type="button"
                className="rounded-xl border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Close
              </button>
            </div>

            <div className="mt-5 space-y-2">
              {MOBILE_OVERFLOW_NAV_ITEMS.map((item) => {
                const active = matchesAppPath(pathname, item.href);

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`block rounded-2xl px-4 py-3 text-sm font-medium transition ${navLinkClasses(active)}`}
                  >
                    {item.navLabel}
                  </Link>
                );
              })}
            </div>

            <form action={logoutAction} className="mt-5">
              <button
                type="submit"
                className="flex w-full items-center justify-center rounded-2xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-100"
              >
                Log out
              </button>
            </form>
          </div>
        </div>
      ) : null}
    </div>
  );
}
