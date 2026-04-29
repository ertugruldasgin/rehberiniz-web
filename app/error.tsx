"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background gap-6 text-center px-6">
      <div className="space-y-2">
        <p className="text-8xl font-bold tracking-tight text-destructive">
          500
        </p>
        <h1 className="text-2xl font-semibold">Bir Hata Oluştu</h1>
        <p className="text-sm text-muted-foreground max-w-sm">
          Beklenmedik bir hata meydana geldi. Lütfen tekrar deneyin.
        </p>
      </div>
      <div className="flex items-center gap-4">
        <button
          onClick={reset}
          className="text-sm font-medium underline underline-offset-4 hover:text-primary transition-colors"
        >
          Tekrar dene
        </button>
        <span className="text-muted-foreground">·</span>
        <Link
          href="/"
          className="text-sm font-medium underline underline-offset-4 hover:text-primary transition-colors"
        >
          Ana sayfaya dön
        </Link>
      </div>
    </div>
  );
}
