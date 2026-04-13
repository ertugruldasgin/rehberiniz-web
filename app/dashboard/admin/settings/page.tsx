"use client";

import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { useOrganization } from "@/hooks/use-organization";
import {
  BuildingIcon,
  GlobeIcon,
  PhoneIcon,
  MapPinIcon,
  MailIcon,
  ShieldIcon,
} from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export default function SettingsPage() {
  const { organization, loading, refetch } = useOrganization();

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [website, setWebsite] = useState("");
  const [email, setEmail] = useState("");
  const [savingInfo, setSavingInfo] = useState(false);

  useEffect(() => {
    if (organization) {
      setName(organization.name);
      setPhone(organization.phone ?? "");
      setAddress(organization.address ?? "");
      setWebsite(organization.website ?? "");
      setEmail(organization.email ?? "");
    }
  }, [organization]);

  async function handleSaveInfo() {
    if (!name.trim()) {
      toast.error("Kurum adı zorunludur.");
      return;
    }
    setSavingInfo(true);
    try {
      const res = await fetch("/api/organization/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          is_active: organization?.is_active,
          phone,
          email,
          website,
          address,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Bir hata oluştu.");
      toast.success("Kurum bilgileri güncellendi.");
      refetch();
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setSavingInfo(false);
    }
  }

  if (loading) {
    return (
      <div className="w-full px-4 md:px-6 space-y-6">
        <div className="h-8 w-48 rounded-lg bg-muted animate-pulse" />
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          <div className="xl:col-span-2 space-y-4">
            <div className="rounded-2xl border bg-card p-6 space-y-4">
              {[...Array(3)].map((_, i) => (
                <div
                  key={i}
                  className="h-12 rounded-xl bg-muted animate-pulse"
                />
              ))}
            </div>
            <div className="rounded-2xl border bg-card p-6 space-y-4">
              {[...Array(4)].map((_, i) => (
                <div
                  key={i}
                  className="h-12 rounded-xl bg-muted animate-pulse"
                />
              ))}
            </div>
          </div>
          <div className="space-y-4">
            <div className="rounded-2xl border bg-card p-6 space-y-4">
              {[...Array(2)].map((_, i) => (
                <div
                  key={i}
                  className="h-12 rounded-xl bg-muted animate-pulse"
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full px-4 md:px-6 space-y-6">
      <PageHeader
        title="Kurum Ayarları"
        description="Kurumunuzun bilgilerini görüntüleyin ve düzenleyin."
      />

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 items-start">
        {/* SOL — Kurum Bilgileri */}
        <div className="xl:col-span-2 space-y-4">
          {/* Temel Bilgiler */}
          <div className="rounded-2xl border bg-card p-5 sm:p-6 space-y-5">
            <div className="flex items-center gap-2">
              <BuildingIcon className="h-4 w-4 text-muted-foreground shrink-0" />
              <h2 className="text-sm font-semibold">Temel Bilgiler</h2>
            </div>
            <Separator />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Kurum Adı</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Rehberiniz Eğitim"
                  className="h-10"
                />
              </div>
              <div className="space-y-2">
                <Label>Kurum ID</Label>
                <div className="flex h-10 items-center rounded-md border bg-muted/50 px-3 text-sm text-muted-foreground">
                  {organization?.slug ?? "—"}
                </div>
                <p className="text-xs text-muted-foreground">
                  Kurum ID değiştirilemez.
                </p>
              </div>
            </div>
          </div>

          {/* İletişim Bilgileri */}
          <div className="rounded-2xl border bg-card p-5 sm:p-6 space-y-5">
            <div className="flex items-center gap-2">
              <PhoneIcon className="h-4 w-4 text-muted-foreground shrink-0" />
              <h2 className="text-sm font-semibold">İletişim Bilgileri</h2>
            </div>
            <Separator />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4">
              <div className="space-y-2">
                <Label htmlFor="phone">
                  <span className="flex items-center gap-1.5">
                    <PhoneIcon className="h-3.5 w-3.5 text-muted-foreground" />
                    Telefon
                  </span>
                </Label>
                <Input
                  id="phone"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="0555 555 55 55"
                  className="h-10"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">
                  <span className="flex items-center gap-1.5">
                    <MailIcon className="h-3.5 w-3.5 text-muted-foreground" />
                    E-posta
                  </span>
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="info@kurum.com"
                  className="h-10"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="website">
                  <span className="flex items-center gap-1.5">
                    <GlobeIcon className="h-3.5 w-3.5 text-muted-foreground" />
                    Web Sitesi
                  </span>
                </Label>
                <Input
                  id="website"
                  value={website}
                  onChange={(e) => setWebsite(e.target.value)}
                  placeholder="https://kurum.com"
                  className="h-10"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="address">
                  <span className="flex items-center gap-1.5">
                    <MapPinIcon className="h-3.5 w-3.5 text-muted-foreground" />
                    Adres
                  </span>
                </Label>
                <Input
                  id="address"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Adres"
                  className="h-10"
                />
              </div>
            </div>
            <div className="flex justify-end">
              <Button
                onClick={handleSaveInfo}
                disabled={savingInfo}
                className="w-full sm:w-auto cursor-pointer"
              >
                {savingInfo ? "Kaydediliyor..." : "Değişiklikleri Kaydet"}
              </Button>
            </div>
          </div>
        </div>

        {/* SAĞ — Özet */}
        <div className="xl:col-span-1 space-y-4">
          <div className="rounded-2xl border bg-card p-5 space-y-4">
            <div className="flex items-center gap-2">
              <ShieldIcon className="h-4 w-4 text-muted-foreground shrink-0" />
              <h2 className="text-sm font-semibold">Kurum Özeti</h2>
            </div>
            <Separator />
            <div className="space-y-3">
              <div className="flex items-center gap-3 min-w-0">
                <div className="h-8 w-8 rounded-lg bg-muted flex items-center justify-center shrink-0">
                  <BuildingIcon className="h-3.5 w-3.5 text-muted-foreground" />
                </div>
                <div className="min-w-0">
                  <p className="text-[11px] text-muted-foreground">Kurum Adı</p>
                  <p className="text-xs font-medium truncate">
                    {organization?.name ?? "—"}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3 min-w-0">
                <div className="h-8 w-8 rounded-lg bg-muted flex items-center justify-center shrink-0">
                  <GlobeIcon className="h-3.5 w-3.5 text-muted-foreground" />
                </div>
                <div className="min-w-0">
                  <p className="text-[11px] text-muted-foreground">Slug</p>
                  <p className="text-xs font-medium truncate">
                    {organization?.slug ?? "—"}
                  </p>
                </div>
              </div>
              {organization?.phone && (
                <div className="flex items-center gap-3 min-w-0">
                  <div className="h-8 w-8 rounded-lg bg-muted flex items-center justify-center shrink-0">
                    <PhoneIcon className="h-3.5 w-3.5 text-muted-foreground" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[11px] text-muted-foreground">Telefon</p>
                    <p className="text-xs font-medium truncate">
                      {organization.phone}
                    </p>
                  </div>
                </div>
              )}
              {organization?.email && (
                <div className="flex items-center gap-3 min-w-0">
                  <div className="h-8 w-8 rounded-lg bg-muted flex items-center justify-center shrink-0">
                    <MailIcon className="h-3.5 w-3.5 text-muted-foreground" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[11px] text-muted-foreground">E-posta</p>
                    <p className="text-xs font-medium truncate">
                      {organization.email}
                    </p>
                  </div>
                </div>
              )}
              {organization?.website && (
                <div className="flex items-center gap-3 min-w-0">
                  <div className="h-8 w-8 rounded-lg bg-muted flex items-center justify-center shrink-0">
                    <GlobeIcon className="h-3.5 w-3.5 text-muted-foreground" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[11px] text-muted-foreground">
                      Web Sitesi
                    </p>
                    <p className="text-xs font-medium truncate">
                      {organization.website}
                    </p>
                  </div>
                </div>
              )}
              {organization?.address && (
                <div className="flex items-center gap-3 min-w-0">
                  <div className="h-8 w-8 rounded-lg bg-muted flex items-center justify-center shrink-0">
                    <MapPinIcon className="h-3.5 w-3.5 text-muted-foreground" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[11px] text-muted-foreground">Adres</p>
                    <p className="text-xs font-medium truncate">
                      {organization.address}
                    </p>
                  </div>
                </div>
              )}
              <div className="flex items-center gap-3 min-w-0">
                <div className="h-8 w-8 rounded-lg bg-muted flex items-center justify-center shrink-0">
                  <ShieldIcon className="h-3.5 w-3.5 text-muted-foreground" />
                </div>
                <div className="min-w-0">
                  <p className="text-[11px] text-muted-foreground">Durum</p>
                  <p className="text-xs font-medium truncate">
                    {organization?.is_active ? "Aktif" : "Pasif"}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
