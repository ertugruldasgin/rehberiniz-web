"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
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
      <div className="flex flex-col space-y-6">
        <Image
          src="/images/rehberiniz/rehberiniz_light_transparent2.png"
          alt="Rehberiniz"
          width={360}
          height={360}
          priority
          className="h-48 md:h-52 lg:h-56 xl:h-60 w-auto object-contain"
        />
        <div className="flex flex-col space-y-2">
          <h1 className="text-4xl font-bold tracking-tight">
            Tekrar Hoş Geldiniz
          </h1>
          <p className="text-sm text-muted-foreground">
            Platformumuza kurumsal erişim için bizimle iletişime geçin.
          </p>
        </div>
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
              aria-label={showPassword ? "Şifreyi gizle" : "Şifreyi göster"}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground"
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
              className="cursor-pointer rounded-sm focus-visible:ring-primary/30 focus-visible:ring-offset-0 data-[state=checked]:border-primary data-[state=checked]:bg-primary data-[state=checked]:text-white"
            />
            <Label
              htmlFor="remember"
              className="cursor-pointer text-sm font-medium"
            >
              Beni Hatırla
            </Label>
          </div>
          <Link
            href="/auth/forgot-password"
            className="text-sm font-semibold text-foreground transition-colors hover:text-primary"
          >
            Şifremi Unuttum?
          </Link>
        </div>

        <div className="-mb-2 mt-2">
          <p className="text-xs text-muted-foreground">
            Giriş yaparak{" "}
            <Link
              href="/privacy"
              className="underline underline-offset-3 transition-colors hover:text-foreground"
            >
              Gizlilik Politikası
            </Link>
            &apos;nı kabul etmiş olursunuz.
          </p>
        </div>

        <Button
          type="submit"
          className="h-12 w-full cursor-pointer text-sm font-bold tracking-wide transition-colors hover:bg-primary/90"
        >
          Giriş Yap
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
