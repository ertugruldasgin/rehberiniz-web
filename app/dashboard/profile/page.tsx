"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { createClient } from "@/lib/supabase/client";
import { useUserRole } from "@/hooks/use-user-tole";
import { CameraIcon, KeyRoundIcon, UserIcon } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";

const MAX_FILE_SIZE = 5 * 1024 * 1024;
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];

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

  // Sync local fullName state when userData changes (e.g. after refresh)
  useEffect(() => {
    if (userData) {
      setFullName(userData.full_name);
    }
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
      <div className="w-full px-4 md:px-6 py-6 md:py-8">
        <div className="space-y-6">
          <div className="space-y-2">
            <div className="h-8 w-48 rounded-lg bg-muted animate-pulse" />
            <div className="h-4 w-80 rounded-lg bg-muted animate-pulse" />
          </div>
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            <div className="xl:col-span-2 rounded-2xl border bg-card p-6 space-y-6">
              <div className="flex items-center gap-5">
                <div className="h-24 w-24 rounded-2xl bg-muted animate-pulse shrink-0" />
                <div className="space-y-2 flex-1">
                  <div className="h-5 w-44 rounded-lg bg-muted animate-pulse" />
                  <div className="h-4 w-60 rounded-lg bg-muted animate-pulse" />
                  <div className="h-8 w-36 rounded-lg bg-muted animate-pulse" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="h-16 rounded-xl bg-muted animate-pulse" />
                <div className="h-16 rounded-xl bg-muted animate-pulse" />
              </div>
            </div>
            <div className="rounded-2xl border bg-card p-6 space-y-4">
              <div className="h-5 w-32 rounded-lg bg-muted animate-pulse" />
              <div className="space-y-3">
                <div className="h-16 rounded-xl bg-muted animate-pulse" />
                <div className="h-16 rounded-xl bg-muted animate-pulse" />
                <div className="h-16 rounded-xl bg-muted animate-pulse" />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full px-4 md:px-6 space-y-6">
      {/* Başlık */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Profil Ayarları</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Kişisel bilgilerinizi ve hesap güvenliğinizi buradan
            yönetebilirsiniz.
          </p>
        </div>
      </div>

      {/* İki kolonlu grid */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 items-start">
        {/* SOL — Kişisel Bilgiler */}
        <div className="xl:col-span-2 rounded-2xl border bg-card p-5 sm:p-6 space-y-6">
          {/* Kart başlığı */}
          <div>
            <div className="flex items-center gap-2">
              <UserIcon className="h-4 w-4 text-muted-foreground shrink-0" />
              <h2 className="text-sm font-semibold">Kişisel Bilgiler</h2>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5 ml-6">
              Profil fotoğrafınızı ve temel hesap bilgilerinizi düzenleyin.
            </p>
          </div>

          <Separator />

          {/* Avatar */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
            <div className="relative group shrink-0">
              <Avatar className="h-24 w-24 rounded-2xl ring-1 ring-border">
                <AvatarImage
                  src={userData?.avatar_url ?? ""}
                  alt={userData?.full_name ?? ""}
                  className="rounded-2xl"
                />
                <AvatarFallback className="rounded-2xl bg-primary text-primary-foreground text-2xl font-semibold">
                  {initials || "?"}
                </AvatarFallback>
              </Avatar>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className="absolute inset-0 rounded-2xl bg-black/45 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center disabled:cursor-not-allowed cursor-pointer"
              >
                <CameraIcon className="h-5 w-5 text-white" />
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                className="hidden"
                onChange={handleAvatarUpload}
              />
            </div>

            <div className="space-y-2 min-w-0">
              <div>
                <p className="text-base font-semibold truncate">
                  {fullName || "İsimsiz kullanıcı"}
                </p>
                <p className="text-sm text-muted-foreground truncate">
                  {userData?.email}
                </p>
              </div>
            </div>
          </div>

          <Separator />

          {/* Form */}
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

        {/* SAĞ — Güvenlik */}
        <div className="xl:col-span-1 rounded-2xl border bg-card p-5 sm:p-6 space-y-6">
          <div>
            <div className="flex items-center gap-2">
              <KeyRoundIcon className="h-4 w-4 text-muted-foreground shrink-0" />
              <h2 className="text-sm font-semibold">Güvenlik</h2>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5 ml-6">
              Hesabınızı korumak için şifrenizi düzenli güncelleyin.
            </p>
          </div>

          <Separator />

          <div className="space-y-4">
            <div className="space-y-2">
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
              <p className="text-xs text-muted-foreground">En az 8 karakter.</p>
            </div>
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

          <Button
            onClick={handleChangePassword}
            disabled={savingPassword}
            className="w-full"
          >
            {savingPassword ? "Güncelleniyor..." : "Şifreyi Güncelle"}
          </Button>
        </div>
      </div>
    </div>
  );
}
