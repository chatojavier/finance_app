"use client";

import Link from "next/link";
import { useActionState } from "react";

import { AUTH_SIGNUP_PATH } from "@/config/navigation";
import { INITIAL_AUTH_ACTION_STATE } from "@/features/auth/action-state";
import { loginAction } from "@/features/auth/actions";

import { AuthSubmitButton } from "./auth-submit-button";

export function LoginForm() {
  const [state, formAction] = useActionState(loginAction, INITIAL_AUTH_ACTION_STATE);

  return (
    <div className="mx-auto w-full max-w-[480px]">
      <form
        action={formAction}
        className="rounded-3xl border border-slate-200 bg-white p-6 shadow-[0_24px_80px_rgba(15,23,42,0.08)]"
      >
        <h2 className="text-2xl font-semibold tracking-tight text-slate-950">
          Log in to your account
        </h2>
        <p className="mt-2 text-sm text-slate-600">Enter your credentials to continue.</p>

        <div className="mt-6 space-y-4">
          <label className="block space-y-2">
            <span className="text-sm font-medium text-slate-900">Email</span>
            <input
              name="email"
              type="email"
              autoComplete="email"
              required
              className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm text-slate-950 transition outline-none focus:border-emerald-500 focus:bg-white"
              placeholder="you@example.com"
            />
          </label>

          <label className="block space-y-2">
            <span className="text-sm font-medium text-slate-900">Password</span>
            <input
              name="password"
              type="password"
              autoComplete="current-password"
              required
              minLength={6}
              className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm text-slate-950 transition outline-none focus:border-emerald-500 focus:bg-white"
              placeholder="••••••••"
            />
          </label>
        </div>

        {state.error ? (
          <p
            aria-live="polite"
            className="mt-4 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700"
          >
            {state.error}
          </p>
        ) : null}

        <div className="mt-6">
          <AuthSubmitButton pendingLabel="Logging in...">Log In</AuthSubmitButton>
        </div>
      </form>

      <p className="mt-6 text-center text-sm text-slate-600">
        Don&apos;t have an account?{" "}
        <Link
          href={AUTH_SIGNUP_PATH}
          className="font-semibold text-emerald-700 hover:text-emerald-800"
        >
          Sign up
        </Link>
      </p>
    </div>
  );
}
