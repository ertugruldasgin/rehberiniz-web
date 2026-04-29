import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

type UserRole = "admin" | "teacher" | "student";

const roleRoutes: Record<UserRole, string[]> = {
  admin: ["/dashboard/admin"],
  teacher: ["/dashboard/teacher"],
  student: ["/dashboard/student"],
};

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value),
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  const { data } = await supabase.auth.getClaims();
  const user = data?.claims;
  const role = user?.user_role as UserRole | undefined;
  const { pathname } = request.nextUrl;

  if (
    !user &&
    !pathname.startsWith("/auth") &&
    pathname !== "/privacy" &&
    !pathname.startsWith("/super-admin") &&
    !pathname.startsWith("/api/super-admin")
  ) {
    const url = request.nextUrl.clone();
    url.pathname = "/auth/login";
    return NextResponse.redirect(url);
  }

  if (user) {
    if (!role) {
      const url = request.nextUrl.clone();
      url.pathname = "/auth/login";
      return NextResponse.redirect(url);
    }

    if (pathname.startsWith("/auth")) {
      const url = request.nextUrl.clone();
      url.pathname = `/dashboard/${role}`;
      return NextResponse.redirect(url);
    }

    if (pathname === "/" || pathname === "/dashboard") {
      const url = request.nextUrl.clone();
      url.pathname = `/dashboard/${role}`;
      return NextResponse.redirect(url);
    }

    if (
      pathname.startsWith("/dashboard") &&
      pathname !== "/dashboard/profile"
    ) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("is_active")
        .eq("id", user.sub)
        .single();

      if (profile && !profile.is_active) {
        const url = request.nextUrl.clone();
        url.pathname = "/dashboard/profile";
        return NextResponse.redirect(url);
      }

      const { data: member } = await supabase
        .from("organization_members")
        .select("organization_id")
        .eq("user_id", user.sub)
        .single();

      if (member) {
        const { data: org } = await supabase
          .from("organizations")
          .select("is_active")
          .eq("id", member.organization_id)
          .single();

        if (org && !org.is_active) {
          const url = request.nextUrl.clone();
          if (role == "admin") {
            url.pathname = "/dashboard/admin/settings";
          } else {
            url.pathname = "/dashboard/profile";
          }

          return NextResponse.redirect(url);
        }
      }
    }

    const isDashboardRoute = Object.values(roleRoutes)
      .flat()
      .some((route) => pathname.startsWith(route));

    if (isDashboardRoute) {
      const allowedRoutes = roleRoutes[role];
      const isAllowed = allowedRoutes.some((route) =>
        pathname.startsWith(route),
      );

      if (!isAllowed) {
        const url = request.nextUrl.clone();
        url.pathname = `/dashboard/${role}`;
        return NextResponse.redirect(url);
      }
    }
  }

  return supabaseResponse;
}
