import type { ReactNode } from "react";

import { AuthShell } from "@/components/auth/auth-shell";
import { redirectIfAuthenticated } from "@/lib/auth/server";

type AuthLayoutProps = {
  children: ReactNode;
};

export default async function AuthLayout({ children }: AuthLayoutProps) {
  await redirectIfAuthenticated();

  return <AuthShell>{children}</AuthShell>;
}
