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
  const { pathname } = request.nextUrl;

  // Giriş yapılmamışsa ve public route değilse login'e yönlendir
  if (!user && !pathname.startsWith("/auth")) {
    const url = request.nextUrl.clone();
    url.pathname = "/auth/login";
    return NextResponse.redirect(url);
  }

  // Kullanıcı varsa rolü bir kez çek
  let role: UserRole | undefined;

  if (user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.sub)
      .single();

    role = profile?.role as UserRole | undefined;

    // Rol yoksa login'e yönlendir
    if (!role) {
      const url = request.nextUrl.clone();
      url.pathname = "/auth/login";
      return NextResponse.redirect(url);
    }

    // Giriş yapmış biri /auth sayfalarına gelirse dashboard'a yönlendir
    if (pathname.startsWith("/auth")) {
      const url = request.nextUrl.clone();
      url.pathname = `/dashboard/${role}`;
      return NextResponse.redirect(url);
    }

    // / veya /dashboard'a gelirse kendi dashboard'una yönlendir
    if (pathname === "/" || pathname === "/dashboard") {
      const url = request.nextUrl.clone();
      url.pathname = `/dashboard/${role}`;
      return NextResponse.redirect(url);
    }

    // Başka rolün sayfasına erişmeye çalışıyorsa kendi dashboard'una yönlendir
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
