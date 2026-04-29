import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background gap-6 text-center px-6">
      <div className="space-y-2">
        <p className="text-8xl font-bold tracking-tight text-primary">404</p>
        <h1 className="text-2xl font-semibold">Sayfa Bulunamadı</h1>
        <p className="text-sm text-muted-foreground max-w-sm">
          Aradığınız sayfa mevcut değil ya da taşınmış olabilir.
        </p>
      </div>
      <Link
        href="/"
        className="text-sm font-medium underline underline-offset-4 hover:text-primary transition-colors"
      >
        Ana sayfaya dön
      </Link>
    </div>
  );
}
