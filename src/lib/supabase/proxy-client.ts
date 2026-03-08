import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

import { AUTH_LOGIN_PATH, HOME_PATH } from "@/config/navigation";
import { isAuthPath, isPrivatePath } from "@/lib/auth/routes";
import { getSupabaseEnv } from "@/lib/supabase/env";

function cloneResponseCookies(source: NextResponse, target: NextResponse) {
  for (const cookie of source.cookies.getAll()) {
    target.cookies.set(cookie);
  }
}

export async function updateSession(request: NextRequest): Promise<NextResponse> {
  const { url, anonKey } = getSupabaseEnv();
  let response = NextResponse.next({
    request,
  });

  const supabase = createServerClient(url, anonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        for (const { name, value } of cookiesToSet) {
          request.cookies.set(name, value);
        }

        response = NextResponse.next({
          request,
        });

        for (const { name, value, options } of cookiesToSet) {
          response.cookies.set(name, value, options);
        }
      },
    },
  });

  const pathname = request.nextUrl.pathname;
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user && isPrivatePath(pathname)) {
    const redirectResponse = NextResponse.redirect(new URL(AUTH_LOGIN_PATH, request.url));
    cloneResponseCookies(response, redirectResponse);
    return redirectResponse;
  }

  if (user && isAuthPath(pathname)) {
    const redirectResponse = NextResponse.redirect(new URL(HOME_PATH, request.url));
    cloneResponseCookies(response, redirectResponse);
    return redirectResponse;
  }

  return response;
}
