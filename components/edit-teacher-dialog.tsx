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
import { UserIcon, BriefcaseIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import type { TeacherDetail } from "@/hooks/use-teacher";
import { createClient } from "@/lib/supabase/client";

interface EditTeacherDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
  teacher: TeacherDetail;
}

const EMPTY_ERRORS = {
  full_name: "",
};

export function EditTeacherDialog({
  open,
  onOpenChange,
  onSuccess,
  teacher,
}: EditTeacherDialogProps) {
  const [form, setForm] = useState({
    full_name: "",
    title: "",
  });
  const [errors, setErrors] = useState(EMPTY_ERRORS);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open && teacher) {
      setForm({
        full_name: teacher.full_name,
        title: teacher.title ?? "",
      });
      setErrors(EMPTY_ERRORS);
    }
  }, [open, teacher]);

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
    setErrors(newErrors);
    return valid;
  }

  async function submitForm() {
    if (!validate()) return;
    setLoading(true);
    try {
      const supabase = createClient();
      const { error } = await supabase
        .from("profiles")
        .update({
          full_name: form.full_name.trim(),
          title: form.title.trim() || null,
        })
        .eq("id", teacher.user_id);
      if (error) throw error;
      toast.success("Öğretmen bilgileri güncellendi.");
      onOpenChange(false);
      onSuccess();
    } catch {
      toast.error("Güncelleme sırasında bir hata oluştu.");
    } finally {
      setLoading(false);
    }
  }

  function handleClose() {
    setErrors(EMPTY_ERRORS);
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl p-0 pb-2 gap-0 overflow-hidden">
        <DialogHeader className="px-6 pt-6 pb-4 border-b shrink-0">
          <DialogTitle className="text-lg font-bold">
            Öğretmeni Düzenle
          </DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground">
            Öğretmenin bilgilerini güncelleyin.{" "}
            <span className="text-destructive">*</span> ile işaretli alanlar
            zorunludur.
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-[65vh]">
          <div className="px-6 py-6 space-y-7">
            {/* Kişisel Bilgiler */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <UserIcon className="h-4 w-4 text-muted-foreground shrink-0" />
                <p className="text-sm font-semibold">Kişisel Bilgiler</p>
              </div>
              <Separator />
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="edit_full_name">
                    Ad Soyad <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="edit_full_name"
                    name="full_name"
                    value={form.full_name}
                    onChange={handleChange}
                    placeholder="Ahmet Yılmaz"
                    className={`h-10 ${errors.full_name ? "border-destructive focus-visible:ring-destructive/50" : ""}`}
                    disabled={loading}
                  />
                  {errors.full_name && (
                    <p className="text-xs text-destructive">
                      {errors.full_name}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label>E-posta</Label>
                  <div className="flex h-10 items-center rounded-md border bg-muted/50 px-3 text-sm text-muted-foreground">
                    {teacher.email ?? "—"}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    E-posta adresi değiştirilemez.
                  </p>
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
                <Label htmlFor="edit_title">Unvan</Label>
                <Input
                  id="edit_title"
                  name="title"
                  value={form.title}
                  onChange={handleChange}
                  placeholder="Matematik Öğretmeni"
                  className="h-10"
                  disabled={loading}
                />
                <p className="text-xs text-muted-foreground">
                  Öğretmenin branşı veya unvanı.
                </p>
              </div>
            </div>
          </div>
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
            className="cursor-pointer"
          >
            {loading ? "Kaydediliyor..." : "Değişiklikleri Kaydet"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
