"use client";

import Link from "next/link";
import { useActionState } from "react";

import { AUTH_LOGIN_PATH } from "@/config/navigation";
import { INITIAL_AUTH_ACTION_STATE } from "@/features/auth/action-state";
import { signupAction } from "@/features/auth/actions";

import { AuthSubmitButton } from "./auth-submit-button";

export function SignupForm() {
  const [state, formAction] = useActionState(signupAction, INITIAL_AUTH_ACTION_STATE);

  return (
    <div className="mx-auto w-full max-w-120">
      <form
        action={formAction}
        className="rounded-3xl border border-slate-200 bg-white p-6 shadow-[0_24px_80px_rgba(15,23,42,0.08)]"
      >
        <h2 className="text-2xl font-semibold tracking-tight text-slate-950">
          Create your account
        </h2>
        <p className="mt-2 text-sm text-slate-600">Start tracking your finances today.</p>

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
              autoComplete="new-password"
              required
              minLength={6}
              className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm text-slate-950 transition outline-none focus:border-emerald-500 focus:bg-white"
              placeholder="Use at least 6 characters"
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
          <AuthSubmitButton pendingLabel="Creating account...">Create account</AuthSubmitButton>
        </div>
      </form>

      <p className="mt-6 text-center text-sm text-slate-600">
        Already have an account?{" "}
        <Link
          href={AUTH_LOGIN_PATH}
          className="font-semibold text-emerald-700 hover:text-emerald-800"
        >
          Log in
        </Link>
      </p>
    </div>
  );
}
