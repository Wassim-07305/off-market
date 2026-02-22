import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

const ROLE_PREFIXES: Record<string, string> = {
  admin: "/admin",
  coach: "/coach",
  setter: "/sales",
  closer: "/sales",
  client: "/client",
};

const DEFAULT_ROUTES: Record<string, string> = {
  admin: "/admin/dashboard",
  coach: "/coach/dashboard",
  setter: "/sales/dashboard",
  closer: "/sales/dashboard",
  client: "/client/dashboard",
};

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const pathname = request.nextUrl.pathname;

  const isAuthPage =
    pathname.startsWith("/login") ||
    pathname.startsWith("/signup") ||
    pathname.startsWith("/forgot-password") ||
    pathname.startsWith("/auth");

  // Not logged in → redirect to login (except auth pages)
  if (!user && !isAuthPage) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  // Logged in on auth page → redirect to role dashboard
  if (user && isAuthPage && !pathname.startsWith("/auth/callback")) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    const role = profile?.role ?? "client";
    const url = request.nextUrl.clone();
    url.pathname = DEFAULT_ROUTES[role] ?? "/client/dashboard";
    return NextResponse.redirect(url);
  }

  // Role-based route protection: ensure user only accesses their prefix
  if (user) {
    const isRoleRoute =
      pathname.startsWith("/admin") ||
      pathname.startsWith("/coach") ||
      pathname.startsWith("/sales") ||
      pathname.startsWith("/client");

    if (isRoleRoute) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();

      const role = profile?.role ?? "client";
      const allowedPrefix = ROLE_PREFIXES[role] ?? "/client";

      if (!pathname.startsWith(allowedPrefix)) {
        const url = request.nextUrl.clone();
        url.pathname = DEFAULT_ROUTES[role] ?? "/client/dashboard";
        return NextResponse.redirect(url);
      }
    }
  }

  return supabaseResponse;
}
