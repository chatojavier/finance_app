"use client";

import type { ReactNode } from "react";
import { useFormStatus } from "react-dom";

type AuthSubmitButtonProps = {
  children: ReactNode;
  pendingLabel: string;
};

export function AuthSubmitButton({ children, pendingLabel }: AuthSubmitButtonProps) {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      aria-disabled={pending}
      disabled={pending}
      className="inline-flex h-11 w-full items-center justify-center rounded-xl bg-emerald-600 px-4 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:bg-emerald-400"
    >
      {pending ? pendingLabel : children}
    </button>
  );
}
