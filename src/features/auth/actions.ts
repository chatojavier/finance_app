"use server";

import { redirect } from "next/navigation";

import { AUTH_LOGIN_PATH, HOME_PATH } from "@/config/navigation";
import { INITIAL_AUTH_ACTION_STATE, type AuthActionState } from "@/features/auth/action-state";
import { createServerSupabaseClient } from "@/lib/supabase/server-client";

const MIN_PASSWORD_LENGTH = 6;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function getCredentialValue(formData: FormData, key: string): string {
  const value = formData.get(key);

  return typeof value === "string" ? value.trim() : "";
}

function validateCredentials(email: string, password: string): AuthActionState {
  if (!EMAIL_REGEX.test(email)) {
    return {
      error: "Ingresa un email valido.",
    };
  }

  if (password.length < MIN_PASSWORD_LENGTH) {
    return {
      error: `La password debe tener al menos ${MIN_PASSWORD_LENGTH} caracteres.`,
    };
  }

  return INITIAL_AUTH_ACTION_STATE;
}

export async function loginAction(
  _previousState: AuthActionState,
  formData: FormData
): Promise<AuthActionState> {
  const email = getCredentialValue(formData, "email").toLowerCase();
  const password = getCredentialValue(formData, "password");
  const validation = validateCredentials(email, password);

  if (validation.error) {
    return validation;
  }

  const supabase = await createServerSupabaseClient();
  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return {
      error: error.message,
    };
  }

  redirect(HOME_PATH);
}

export async function signupAction(
  _previousState: AuthActionState,
  formData: FormData
): Promise<AuthActionState> {
  const email = getCredentialValue(formData, "email").toLowerCase();
  const password = getCredentialValue(formData, "password");
  const validation = validateCredentials(email, password);

  if (validation.error) {
    return validation;
  }

  const supabase = await createServerSupabaseClient();
  const { error } = await supabase.auth.signUp({
    email,
    password,
  });

  if (error) {
    return {
      error: error.message,
    };
  }

  redirect(HOME_PATH);
}

export async function logoutAction(): Promise<void> {
  const supabase = await createServerSupabaseClient();
  await supabase.auth.signOut();

  redirect(AUTH_LOGIN_PATH);
}
