"use client";

import { useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { CheckCircleIcon, XCircleIcon } from "lucide-react";

function SuperAdminForm() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token") ?? "";

  const [form, setForm] = useState({
    orgName: "",
    orgSlug: "",
    adminFullName: "",
    adminEmail: "",
    adminPassword: "",
  });
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{
    success: boolean;
    message: string;
  } | null>(null);

  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <p className="text-sm text-muted-foreground">Yetkisiz erişim.</p>
      </div>
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setResult(null);

    try {
      const res = await fetch("/api/super-admin/create-org", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-super-admin-token": token,
        },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (!res.ok) {
        setResult({ success: false, message: data.error });
      } else {
        setResult({
          success: true,
          message: `Kurum "${data.org.name}" ve admin hesabı "${data.admin.email}" başarıyla oluşturuldu.`,
        });
        setForm({
          orgName: "",
          orgSlug: "",
          adminFullName: "",
          adminEmail: "",
          adminPassword: "",
        });
      }
    } catch (err) {
      setResult({
        success: false,
        message:
          err instanceof Error ? err.message : "Beklenmedik bir hata oluştu.",
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-6">
      <div className="w-full max-w-md space-y-8">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold tracking-tight">Kurum Oluştur</h1>
          <p className="text-sm text-muted-foreground">
            Yeni bir kurum ve admin hesabı oluşturun.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
              Kurum Bilgileri
            </p>
            <div className="space-y-2">
              <Label htmlFor="orgName">Kurum Adı</Label>
              <Input
                id="orgName"
                value={form.orgName}
                onChange={(e) =>
                  setForm((p) => ({ ...p, orgName: e.target.value }))
                }
                placeholder="Örnek Rehberlik Kurumu"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="orgSlug">Kurum Slug</Label>
              <Input
                id="orgSlug"
                value={form.orgSlug}
                onChange={(e) =>
                  setForm((p) => ({
                    ...p,
                    orgSlug: e.target.value.toLowerCase().replace(/\s+/g, "-"),
                  }))
                }
                placeholder="ornek-rehberlik"
                required
              />
              <p className="text-xs text-muted-foreground">
                Küçük harf, tire kullanın. Benzersiz olmalı.
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
              Admin Bilgileri
            </p>
            <div className="space-y-2">
              <Label htmlFor="adminFullName">Ad Soyad</Label>
              <Input
                id="adminFullName"
                value={form.adminFullName}
                onChange={(e) =>
                  setForm((p) => ({ ...p, adminFullName: e.target.value }))
                }
                placeholder="Ad Soyad"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="adminEmail">E-posta</Label>
              <Input
                id="adminEmail"
                type="email"
                value={form.adminEmail}
                onChange={(e) =>
                  setForm((p) => ({ ...p, adminEmail: e.target.value }))
                }
                placeholder="admin@kurum.com"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="adminPassword">Şifre</Label>
              <Input
                id="adminPassword"
                type="password"
                value={form.adminPassword}
                onChange={(e) =>
                  setForm((p) => ({ ...p, adminPassword: e.target.value }))
                }
                placeholder="••••••••"
                required
                minLength={8}
              />
            </div>
          </div>

          {result && (
            <div
              className={`flex items-start gap-2 text-sm rounded-xl p-3 ${
                result.success
                  ? "bg-green-50 text-green-700"
                  : "bg-red-50 text-red-700"
              }`}
            >
              {result.success ? (
                <CheckCircleIcon className="h-4 w-4 shrink-0 mt-0.5" />
              ) : (
                <XCircleIcon className="h-4 w-4 shrink-0 mt-0.5" />
              )}
              <p>{result.message}</p>
            </div>
          )}

          <Button
            type="submit"
            disabled={loading}
            className="w-full h-11 cursor-pointer"
          >
            {loading ? "Oluşturuluyor..." : "Kurum ve Admin Oluştur"}
          </Button>
        </form>
      </div>
    </div>
  );
}

export default function SuperAdminPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-background">
          <p className="text-sm text-muted-foreground">Yükleniyor...</p>
        </div>
      }
    >
      <SuperAdminForm />
    </Suspense>
  );
}
