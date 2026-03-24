"use client";

import type { ReactNode } from "react";
import { useFormStatus } from "react-dom";

type CategorySubmitButtonProps = {
  children: ReactNode;
  pendingLabel: string;
};

export function CategorySubmitButton({ children, pendingLabel }: CategorySubmitButtonProps) {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      aria-disabled={pending}
      disabled={pending}
      className="inline-flex h-11 items-center justify-center rounded-xl bg-emerald-600 px-4 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:bg-emerald-400"
    >
      {pending ? pendingLabel : children}
    </button>
  );
}
