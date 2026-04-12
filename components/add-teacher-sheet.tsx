"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { UserIcon, MailIcon, BriefcaseIcon } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

interface AddTeacherDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

const EMPTY_FORM = {
  full_name: "",
  email: "",
  password: "",
  title: "",
};

const EMPTY_ERRORS: Record<string, string> = {
  full_name: "",
  email: "",
  password: "",
};

export function AddTeacherDialog({
  open,
  onOpenChange,
  onSuccess,
}: AddTeacherDialogProps) {
  const [form, setForm] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState(EMPTY_ERRORS);
  const [loading, setLoading] = useState(false);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (name in errors) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  }

  function validate() {
    const newErrors = { ...EMPTY_ERRORS };
    let valid = true;

    if (!form.full_name.trim()) {
      newErrors.full_name = "Ad Soyad zorunludur.";
      valid = false;
    }
    if (!form.email.trim()) {
      newErrors.email = "E-posta zorunludur.";
      valid = false;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      newErrors.email = "Geçerli bir e-posta adresi girin.";
      valid = false;
    }
    if (!form.password) {
      newErrors.password = "Şifre zorunludur.";
      valid = false;
    } else if (form.password.length < 8) {
      newErrors.password = "Şifre en az 8 karakter olmalıdır.";
      valid = false;
    }

    setErrors(newErrors);
    return valid;
  }

  async function submitForm() {
    if (!validate()) return;

    setLoading(true);
    try {
      const res = await fetch("/api/teachers/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Bir hata oluştu.");

      toast.success("Öğretmen başarıyla eklendi.");
      setForm(EMPTY_FORM);
      setErrors(EMPTY_ERRORS);
      onOpenChange(false);
      onSuccess();
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  }

  function handleClose() {
    setForm(EMPTY_FORM);
    setErrors(EMPTY_ERRORS);
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl p-0 pb-2 gap-0 overflow-hidden">
        <DialogHeader className="px-6 pt-6 pb-4 border-b shrink-0">
          <DialogTitle className="text-lg font-bold">Öğretmen Ekle</DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground">
            Yeni öğretmenin bilgilerini girin.{" "}
            <span className="text-destructive">*</span> ile işaretli alanlar
            zorunludur.
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-[65vh]">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              submitForm();
            }}
            className="px-6 py-6 space-y-7"
          >
            {/* Kişisel Bilgiler */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <UserIcon className="h-4 w-4 text-muted-foreground shrink-0" />
                <p className="text-sm font-semibold">Kişisel Bilgiler</p>
              </div>
              <Separator />
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="full_name">
                    Ad Soyad <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="full_name"
                    name="full_name"
                    value={form.full_name}
                    onChange={handleChange}
                    placeholder="Ad Soyad"
                    className={`h-10 ${errors.full_name ? "border-destructive focus-visible:ring-destructive/50" : ""}`}
                    disabled={loading}
                  />
                  {errors.full_name && (
                    <p className="text-xs text-destructive">
                      {errors.full_name}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Hesap Bilgileri */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <MailIcon className="h-4 w-4 text-muted-foreground shrink-0" />
                <p className="text-sm font-semibold">Hesap Bilgileri</p>
              </div>
              <Separator />
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">
                    E-posta <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={form.email}
                    onChange={handleChange}
                    placeholder="ad.soyad@kurum.com"
                    className={`h-10 ${errors.email ? "border-destructive focus-visible:ring-destructive/50" : ""}`}
                    disabled={loading}
                  />
                  {errors.email && (
                    <p className="text-xs text-destructive">{errors.email}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">
                    Şifre <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    value={form.password}
                    onChange={handleChange}
                    placeholder="••••••••"
                    className={`h-10 ${errors.password ? "border-destructive focus-visible:ring-destructive/50" : ""}`}
                    disabled={loading}
                  />
                  {errors.password ? (
                    <p className="text-xs text-destructive">
                      {errors.password}
                    </p>
                  ) : (
                    <p className="text-xs text-muted-foreground">
                      Öğretmen bu e-posta ve şifre ile sisteme giriş yapacak.
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Kurum Bilgileri */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <BriefcaseIcon className="h-4 w-4 text-muted-foreground shrink-0" />
                <p className="text-sm font-semibold">Kurum Bilgileri</p>
              </div>
              <Separator />
              <div className="space-y-2">
                <Label htmlFor="title">Unvan</Label>
                <Input
                  id="title"
                  name="title"
                  value={form.title}
                  onChange={handleChange}
                  placeholder="Unvan"
                  className="h-10"
                  disabled={loading}
                />
                <p className="text-xs text-muted-foreground">
                  Öğretmenin branşı veya unvanı. İsteğe bağlı.
                </p>
              </div>
            </div>
          </form>
        </ScrollArea>

        <DialogFooter className="px-6 py-4 border-t bg-card shrink-0">
          <Button
            type="button"
            variant="outline"
            onClick={handleClose}
            disabled={loading}
            className="cursor-pointer"
          >
            İptal
          </Button>
          <Button
            type="button"
            onClick={submitForm}
            disabled={loading}
            className="hover:bg-primary/90 cursor-pointer"
          >
            {loading ? "Kaydediliyor..." : "Öğretmen Ekle"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
