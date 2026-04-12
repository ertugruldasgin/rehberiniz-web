"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { createClient } from "@/lib/supabase/client";
import { useUserRole } from "@/hooks/use-user-role";
import {
  CameraIcon,
  KeyRoundIcon,
  UserIcon,
  BuildingIcon,
  ShieldIcon,
  MailIcon,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { PageHeader } from "@/components/page-header";

const MAX_FILE_SIZE = 5 * 1024 * 1024;
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];

const ROLE_LABELS: Record<string, string> = {
  admin: "Yönetici",
  teacher: "Öğretmen",
  student: "Öğrenci",
};

function InfoRow({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center gap-3">
      <div className="h-8 w-8 rounded-lg bg-muted flex items-center justify-center shrink-0">
        {icon}
      </div>
      <div className="min-w-0">
        <p className="text-[11px] text-muted-foreground">{label}</p>
        <p className="text-xs font-medium truncate">{value}</p>
      </div>
    </div>
  );
}

export default function ProfilePage() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { userData, loading: userLoading, refresh } = useUserRole();

  const [uploading, setUploading] = useState(false);
  const [fullName, setFullName] = useState("");
  const [savingName, setSavingName] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [savingPassword, setSavingPassword] = useState(false);

  useEffect(() => {
    if (userData) setFullName(userData.full_name);
  }, [userData]);

  const initials = fullName
    .trim()
    .split(" ")
    .filter(Boolean)
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  async function handleAvatarUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > MAX_FILE_SIZE) {
      toast.error("Dosya boyutu 5MB'dan küçük olmalıdır.");
      return;
    }
    if (!ALLOWED_TYPES.includes(file.type)) {
      toast.error("Sadece JPEG, PNG veya WebP yükleyebilirsiniz.");
      return;
    }
    if (!userData) {
      toast.error("Kullanıcı bilgisi bulunamadı.");
      return;
    }
    setUploading(true);
    try {
      const supabase = createClient();
      const ext = file.type.split("/")[1];
      const path = `${userData.id}/avatar.${ext}`;
      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(path, file, { upsert: true });
      if (uploadError) throw uploadError;
      const { data } = supabase.storage.from("avatars").getPublicUrl(path);
      const publicUrl = `${data.publicUrl}?t=${Date.now()}`;
      const { error: updateError } = await supabase
        .from("profiles")
        .update({ avatar_url: publicUrl })
        .eq("id", userData.id);
      if (updateError) throw updateError;
      toast.success("Profil fotoğrafı güncellendi.");
      await refresh();
    } catch {
      toast.error("Yükleme sırasında bir hata oluştu.");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  async function handleSaveName() {
    if (!fullName.trim()) {
      toast.error("Ad Soyad boş bırakılamaz.");
      return;
    }
    if (!userData) {
      toast.error("Kullanıcı bilgisi bulunamadı.");
      return;
    }
    setSavingName(true);
    try {
      const supabase = createClient();
      const { error } = await supabase
        .from("profiles")
        .update({ full_name: fullName.trim() })
        .eq("id", userData.id);
      if (error) throw error;
      toast.success("Ad Soyad güncellendi.");
      await refresh();
    } catch {
      toast.error("Güncelleme sırasında bir hata oluştu.");
    } finally {
      setSavingName(false);
    }
  }

  async function handleChangePassword() {
    if (!currentPassword || !newPassword || !confirmPassword) {
      toast.error("Tüm alanları doldurun.");
      return;
    }
    if (newPassword.length < 8) {
      toast.error("Yeni şifre en az 8 karakter olmalıdır.");
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error("Yeni şifreler eşleşmiyor.");
      return;
    }
    setSavingPassword(true);
    try {
      const supabase = createClient();
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: userData?.email ?? "",
        password: currentPassword,
      });
      if (signInError) {
        toast.error("Mevcut şifre yanlış.");
        return;
      }
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });
      if (error) throw error;
      toast.success("Şifre başarıyla güncellendi.");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch {
      toast.error("Şifre güncellenirken bir hata oluştu.");
    } finally {
      setSavingPassword(false);
    }
  }

  if (userLoading) {
    return (
      <div className="w-full px-4 md:px-6 py-6 md:py-8 space-y-6">
        <div className="h-8 w-48 rounded-lg bg-muted animate-pulse" />
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          <div className="rounded-2xl border bg-card p-5 space-y-5">
            <div className="flex items-center gap-4">
              <div className="h-16 w-16 rounded-xl bg-muted animate-pulse shrink-0" />
              <div className="space-y-2 flex-1">
                <div className="h-4 w-28 rounded bg-muted animate-pulse" />
                <div className="h-3 w-20 rounded bg-muted animate-pulse" />
                <div className="h-5 w-14 rounded-full bg-muted animate-pulse" />
              </div>
            </div>
            <Separator />
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-10 rounded-lg bg-muted animate-pulse" />
            ))}
          </div>
          <div className="xl:col-span-2 space-y-4">
            <div className="rounded-2xl border bg-card p-6 space-y-4">
              {[...Array(2)].map((_, i) => (
                <div
                  key={i}
                  className="h-16 rounded-xl bg-muted animate-pulse"
                />
              ))}
            </div>
            <div className="rounded-2xl border bg-card p-6 space-y-4">
              {[...Array(3)].map((_, i) => (
                <div
                  key={i}
                  className="h-14 rounded-xl bg-muted animate-pulse"
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
        title="Profil Ayarları"
        description="Kişisel bilgilerinizi ve hesap güvenliğinizi buradan yönetebilirsiniz."
      />

      {/* Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 items-start">
        {/* SOL — Avatar + Hesap Bilgileri */}
        <div className="xl:col-span-1 space-y-4">
          <div className="rounded-2xl border bg-card p-5 space-y-5">
            {/* Avatar sola dayalı, bilgiler sağda */}
            <div className="flex items-center gap-4">
              <div className="relative group shrink-0">
                <Avatar className="h-20 w-20 rounded-xl ring-1 ring-border">
                  <AvatarImage
                    src={userData?.avatar_url ?? ""}
                    alt={userData?.full_name ?? ""}
                    className="rounded-xl"
                  />
                  <AvatarFallback className="rounded-xl bg-primary text-primary-foreground text-lg font-semibold">
                    {initials || "?"}
                  </AvatarFallback>
                </Avatar>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                  className="absolute inset-0 rounded-xl bg-black/45 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center disabled:cursor-not-allowed cursor-pointer"
                >
                  <CameraIcon className="h-4 w-4 text-white" />
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  className="hidden"
                  onChange={handleAvatarUpload}
                />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold truncate">
                  {fullName || "İsimsiz kullanıcı"}
                </p>
                <p className="text-xs text-muted-foreground mt-0.5 truncate">
                  {userData?.email}
                </p>
                <span
                  className={`mt-1.5 inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full ${
                    userData?.is_active
                      ? "bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400"
                      : "bg-destructive/10 text-destructive"
                  }`}
                >
                  <span
                    className={`h-1.5 w-1.5 rounded-full shrink-0 ${userData?.is_active ? "bg-green-500" : "bg-destructive"}`}
                  />
                  {userData?.is_active ? "Aktif" : "Pasif"}
                </span>
              </div>
            </div>

            <Separator />

            {/* Hesap Bilgileri */}
            <div className="space-y-3">
              <InfoRow
                icon={
                  <BuildingIcon className="h-3.5 w-3.5 text-muted-foreground" />
                }
                label="Kurum"
                value={userData?.organization_name ?? "—"}
              />
              <InfoRow
                icon={
                  <ShieldIcon className="h-3.5 w-3.5 text-muted-foreground" />
                }
                label="Rol"
                value={ROLE_LABELS[userData?.role ?? ""] ?? "—"}
              />
              <InfoRow
                icon={
                  <MailIcon className="h-3.5 w-3.5 text-muted-foreground" />
                }
                label="E-posta"
                value={userData?.email ?? "—"}
              />
            </div>
          </div>
        </div>

        {/* SAĞ — Form + Güvenlik */}
        <div className="xl:col-span-2 space-y-4">
          {/* Kişisel Bilgiler */}
          <div className="rounded-2xl border bg-card p-5 sm:p-6 space-y-5">
            <div className="flex items-center gap-2">
              <UserIcon className="h-4 w-4 text-muted-foreground shrink-0" />
              <h2 className="text-sm font-semibold">Kişisel Bilgiler</h2>
            </div>
            <Separator />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4">
              <div className="space-y-2">
                <Label htmlFor="fullName">Ad Soyad</Label>
                <Input
                  id="fullName"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Adınız Soyadınız"
                  className="h-10"
                />
              </div>
              <div className="space-y-2">
                <Label>E-posta</Label>
                <div className="flex h-10 items-center rounded-md border bg-muted/50 px-3 text-sm text-muted-foreground">
                  {userData?.email}
                </div>
                <p className="text-xs text-muted-foreground">
                  E-posta adresi değiştirilemez.
                </p>
              </div>
            </div>
            <div className="flex justify-end">
              <Button
                onClick={handleSaveName}
                disabled={savingName}
                className="w-full sm:w-auto"
              >
                {savingName ? "Kaydediliyor..." : "Değişiklikleri Kaydet"}
              </Button>
            </div>
          </div>

          {/* Güvenlik */}
          <div className="rounded-2xl border bg-card p-5 sm:p-6 space-y-5">
            <div className="flex items-center gap-2">
              <KeyRoundIcon className="h-4 w-4 text-muted-foreground shrink-0" />
              <h2 className="text-sm font-semibold">Güvenlik</h2>
            </div>
            <Separator />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4">
              {/* Mevcut şifre — mobilde tam, md'de yarı */}
              <div className="space-y-2 sm:col-span-2 md:col-span-1">
                <Label htmlFor="currentPassword">Mevcut Şifre</Label>
                <Input
                  id="currentPassword"
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="••••••••"
                  className="h-10"
                />
              </div>
              {/* Boş hücre — mevcut şifre yanını dengeler */}
              <div className="hidden md:block" />
              {/* Yeni şifre */}
              <div className="space-y-2">
                <Label htmlFor="newPassword">Yeni Şifre</Label>
                <Input
                  id="newPassword"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="••••••••"
                  className="h-10"
                />
                <p className="text-xs text-muted-foreground">
                  En az 8 karakter.
                </p>
              </div>
              {/* Tekrar */}
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Yeni Şifre Tekrar</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className="h-10"
                />
                {confirmPassword && (
                  <p
                    className={`text-xs ${newPassword === confirmPassword ? "text-green-600" : "text-destructive"}`}
                  >
                    {newPassword === confirmPassword
                      ? "Şifreler eşleşiyor."
                      : "Şifreler eşleşmiyor."}
                  </p>
                )}
              </div>
            </div>
            <div className="flex justify-end">
              <Button
                onClick={handleChangePassword}
                disabled={savingPassword}
                className="w-full sm:w-auto"
              >
                {savingPassword ? "Güncelleniyor..." : "Şifreyi Güncelle"}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
