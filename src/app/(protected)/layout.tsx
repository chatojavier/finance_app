import type { ReactNode } from "react";

import { AppShell } from "@/components/app/app-shell";
import { requireUser } from "@/lib/auth/server";

type ProtectedLayoutProps = {
  children: ReactNode;
};

export default async function ProtectedLayout({ children }: ProtectedLayoutProps) {
  const user = await requireUser();

  return <AppShell userEmail={user.email ?? null}>{children}</AppShell>;
}
