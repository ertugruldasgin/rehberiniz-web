"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { z } from "zod";

const LoginSchema = z.object({
  email: z.string().email({ message: "Geçersiz e-posta formatı." }).trim(),
  password: z.string().min(1, { message: "Şifre alanı boş bırakılamaz." }),
  rememberMe: z.boolean().optional().default(false),
});

export async function login(formData: FormData) {
  const rawFormData = {
    email: formData.get("email"),
    password: formData.get("password"),
    rememberMe: formData.get("remember") === "on",
  };

  const result = LoginSchema.safeParse(rawFormData);

  if (!result.success) {
    const errorMessage = "Lütfen geçerli bir e-posta ve şifre girin.";
    return redirect(`/auth/login?message=${encodeURIComponent(errorMessage)}`);
  }

  const { email, password, rememberMe } = result.data;
  const supabase = await createClient(rememberMe);

  const { data: authData, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error || !authData.user) {
    const customError = "E-posta veya şifre hatalı.";
    return redirect(`/auth/login?message=${encodeURIComponent(customError)}`);
  }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", authData.user.id)
    .single();

  if (profileError || !profile || !profile.role) {
    await supabase.auth.signOut();

    const noProfileError =
      "Hesabınızın yetkilendirme işlemi tamamlanmamış. Lütfen kurum yöneticinizle iletişime geçin.";
    return redirect(
      `/auth/login?message=${encodeURIComponent(noProfileError)}`,
    );
  }

  const routes: Record<string, string> = {
    admin: "/dashboard/admin",
    teacher: "/dashboard/teacher",
    student: "/dashboard/student",
  };

  const targetRoute = routes[profile.role];

  if (!targetRoute) {
    await supabase.auth.signOut();
    return redirect("/auth/login?message=Geçersiz yetki tipi.");
  }

  return redirect(targetRoute);
}
