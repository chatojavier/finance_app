import { cache } from "react";
import { redirect } from "next/navigation";
import type { User } from "@supabase/supabase-js";

import { AUTH_LOGIN_PATH, HOME_PATH } from "@/config/navigation";
import { createServerSupabaseClient } from "@/lib/supabase/server-client";

export const getCurrentUser = cache(async (): Promise<User | null> => {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return user;
});

export async function requireUser(): Promise<User> {
  const user = await getCurrentUser();

  if (!user) {
    redirect(AUTH_LOGIN_PATH);
  }

  return user;
}

export async function redirectIfAuthenticated(): Promise<void> {
  const user = await getCurrentUser();

  if (user) {
    redirect(HOME_PATH);
  }
}
