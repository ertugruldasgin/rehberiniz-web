import { Metadata } from "next";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { login } from "./action";

export const metadata: Metadata = {
  title: "Giriş | Rehberiniz",
};

// Next.js 15'te searchParams bir Promise'dir
type LoginPageProps = {
  searchParams: Promise<{ message?: string }>;
};

export default async function LoginPage(props: LoginPageProps) {
  // Promise'i burada unwrap ediyoruz (açıyoruz)
  const searchParams = await props.searchParams;

  return (
    <div className="flex min-h-screen items-center justify-center bg-stone-50/50 px-4">
      <div className="w-full max-w-[350px] space-y-6">
        {/* Logo Bölümü */}
        <div className="flex flex-col items-center space-y-2 text-center">
          <h1 className="text-2xl font-bold tracking-[0.15em] uppercase text-stone-900">
            Rehberiniz
          </h1>
          <div className="h-0.5 w-10 bg-amber-500" />
        </div>

        <Card className="border-stone-200 shadow-xl shadow-stone-200/50">
          <CardHeader className="space-y-1">
            <CardTitle className="text-xl font-semibold">
              Hoş Geldiniz
            </CardTitle>
            <CardDescription className="text-xs text-stone-500">
              Devam etmek için bilgilerinizi girin.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form action={login} className="grid gap-4">
              <div className="grid gap-2">
                <Label
                  htmlFor="email"
                  className="text-xs font-semibold text-stone-700"
                >
                  E-posta
                </Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="adiniz@kurum.com"
                  required
                  className="border-stone-200 focus-visible:ring-amber-500"
                />
              </div>
              <div className="grid gap-2">
                <Label
                  htmlFor="password"
                  className="text-xs font-semibold text-stone-700"
                >
                  Şifre
                </Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  required
                  className="border-stone-200 focus-visible:ring-amber-500"
                />
              </div>

              {/* Hata Mesajı Bölümü */}
              {searchParams?.message && (
                <div className="rounded-md bg-destructive/10 p-2.5">
                  <p className="text-center text-xs font-medium text-destructive">
                    {searchParams.message}
                  </p>
                </div>
              )}

              <Button
                type="submit"
                className="w-full bg-amber-600 hover:bg-amber-700 text-white font-bold transition-all"
              >
                GİRİŞ YAP
              </Button>
            </form>
          </CardContent>
        </Card>

        <footer className="text-center text-xs text-stone-500">
          Hesabınız yok mu?{" "}
          <Link
            href="/auth/register"
            className="font-bold text-stone-900 hover:text-amber-600 underline underline-offset-4 transition-colors"
          >
            Kurum Başvurusu
          </Link>
        </footer>
      </div>
    </div>
  );
}
