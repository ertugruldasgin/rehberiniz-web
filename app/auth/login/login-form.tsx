"use client";

import { useState } from "react";
import Link from "next/link";
import { Eye, EyeOff } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { login } from "./action";

export function LoginForm({ errorMessage }: { errorMessage?: string }) {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="flex w-full flex-col space-y-8 sm:w-100">
      <div className="flex flex-col space-y-2">
        <h1 className="text-6xl font-bold tracking-tight -ml-1">
          Rehberiniz&apos;e
        </h1>
        <h1 className="text-2xl font-bold tracking-tight">
          Tekrar Hoş Geldiniz
        </h1>
        <p className="text-sm text-muted-foreground">
          Platformumuza kurumsal erişim için bizimle iletişime geçin.
        </p>
      </div>

      <form action={login} className="grid gap-5">
        <div className="grid gap-2">
          <Label htmlFor="email" className="text-sm font-semibold">
            E-posta adresi<span className="text-destructive">*</span>
          </Label>
          <Input
            id="email"
            name="email"
            type="email"
            placeholder="E-posta adresinizi girin"
            required
            className="h-11"
          />
        </div>

        <div className="grid gap-2">
          <Label htmlFor="password" className="text-sm font-semibold">
            Şifre<span className="text-destructive">*</span>
          </Label>
          <div className="relative">
            <Input
              id="password"
              name="password"
              type={showPassword ? "text" : "password"}
              placeholder="••••••••••••"
              required
              className="h-11 pr-10"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              tabIndex={-1}
            >
              {showPassword ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </button>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Checkbox
              id="remember"
              name="remember"
              className="rounded-sm data-[state=checked]:bg-primary data-[state=checked]:border-primary data-[state=checked]:text-white focus-visible:ring-primary/30 focus-visible:ring-offset-0 cursor-pointer"
            />
            <Label
              htmlFor="remember"
              className="text-sm font-medium cursor-pointer"
            >
              Beni Hatırla
            </Label>
          </div>
          <Link
            href="/auth/forgot-password"
            className="text-sm font-semibold text-foreground hover:text-primary transition-colors"
          >
            Şifremi Unuttum?
          </Link>
        </div>

        <div className="flex items-baseline mt-2 -mb-2">
          <p className="text-xs text-center text-muted-foreground">
            Giriş yaparak{" "}
            <Link
              href="/privacy"
              className="underline underline-offset-3 hover:text-foreground transition-colors"
            >
              Gizlilik Politikası
            </Link>
            {"'nı"} kabul etmiş olursunuz.
          </p>
        </div>

        <Button
          type="submit"
          className="h-12 w-full text-sm font-bold tracking-wide cursor-pointer hover:bg-primary/90 transition-colors"
        >
          Rehberiniz&apos;e Giriş Yap
        </Button>

        {errorMessage && (
          <p className="text-center text-sm font-medium text-destructive">
            {errorMessage}
          </p>
        )}
      </form>

      <p className="text-center text-sm text-muted-foreground">
        Erişim sorunu mu yaşıyorsunuz? <br />
        Kurumunuzun <span className="font-bold">yöneticisiyle</span> iletişime
        geçin.
      </p>
    </div>
  );
}
