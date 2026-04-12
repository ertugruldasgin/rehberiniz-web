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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { UserIcon, MailIcon, SchoolIcon, UsersIcon } from "lucide-react";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { useUserRole } from "@/hooks/use-user-role";
import { useTeachers } from "@/hooks/use-teachers";

interface AddStudentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
  defaultTeacherId?: string;
}

const EMPTY_FORM = {
  first_name: "",
  last_name: "",
  email: "",
  password: "",
  student_number: "",
  grade: "",
  branch: "",
};

const EMPTY_ERRORS: Record<string, string> = {
  first_name: "",
  last_name: "",
  email: "",
  password: "",
  teacher_id: "",
};

export function AddStudentSheet({
  open,
  onOpenChange,
  onSuccess,
  defaultTeacherId,
}: AddStudentDialogProps) {
  const { userData } = useUserRole();
  const { teachers } = useTeachers();
  const isAdmin = userData?.role === "admin";

  const [form, setForm] = useState(EMPTY_FORM);
  const [selectedTeacherId, setSelectedTeacherId] = useState(
    defaultTeacherId ?? "",
  );
  const [errors, setErrors] = useState(EMPTY_ERRORS);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open) setSelectedTeacherId(defaultTeacherId ?? "");
  }, [open, defaultTeacherId]);

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

    if (!form.first_name.trim()) {
      newErrors.first_name = "Ad zorunludur.";
      valid = false;
    }
    if (!form.last_name.trim()) {
      newErrors.last_name = "Soyad zorunludur.";
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
    if (isAdmin && !selectedTeacherId) {
      newErrors.teacher_id = "Öğretmen seçimi zorunludur.";
      valid = false;
    }

    setErrors(newErrors);
    return valid;
  }

  async function submitForm() {
    if (!validate()) return;

    setLoading(true);
    try {
      const res = await fetch("/api/students/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          ...(isAdmin && { teacher_member_id: selectedTeacherId }),
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Bir hata oluştu.");

      toast.success("Öğrenci başarıyla eklendi.");
      setForm(EMPTY_FORM);
      setSelectedTeacherId(defaultTeacherId ?? "");
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
    setSelectedTeacherId(defaultTeacherId ?? "");
    setErrors(EMPTY_ERRORS);
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl p-0 pb-2 gap-0 overflow-hidden">
        <DialogHeader className="px-6 pt-6 pb-4 border-b shrink-0">
          <DialogTitle className="text-lg font-bold">Öğrenci Ekle</DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground">
            Yeni öğrencinin bilgilerini girin.{" "}
            <span className="text-destructive">*</span> ile işaretli alanlar
            zorunludur.
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-[65vh]">
          <form
            id="add-student-form"
            onSubmit={(e) => {
              e.preventDefault();
              submitForm();
            }}
            className="px-6 py-6 space-y-7"
          >
            {/* Admin — Öğretmen Seçimi */}
            {isAdmin && (
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <UsersIcon className="h-4 w-4 text-muted-foreground shrink-0" />
                  <p className="text-sm font-semibold">Öğretmen Seçimi</p>
                </div>
                <Separator />
                <div className="space-y-2">
                  <Label>
                    Öğretmen <span className="text-destructive">*</span>
                  </Label>
                  <Select
                    value={selectedTeacherId}
                    onValueChange={(val) => {
                      setSelectedTeacherId(val);
                      setErrors((prev) => ({ ...prev, teacher_id: "" }));
                    }}
                    disabled={loading || !!defaultTeacherId}
                  >
                    <SelectTrigger
                      className={`w-full! h-10! ${errors.teacher_id ? "border-destructive" : ""} hover:cursor-pointer`}
                    >
                      <SelectValue placeholder="Öğretmen seçin..." />
                    </SelectTrigger>
                    <SelectContent className="p-1">
                      {teachers.map((t) => (
                        <SelectItem
                          key={t.id}
                          value={t.id}
                          className="rounded-lg cursor-pointer py-1 px-3"
                        >
                          {t.full_name}
                          {t.title && (
                            <span className="text-muted-foreground">
                              {t.title}
                            </span>
                          )}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.teacher_id && (
                    <p className="text-xs text-destructive">
                      {errors.teacher_id}
                    </p>
                  )}
                  {defaultTeacherId && (
                    <p className="text-xs text-muted-foreground">
                      Öğrenci bu öğretmene atanacak.
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Kişisel Bilgiler */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <UserIcon className="h-4 w-4 text-muted-foreground shrink-0" />
                <p className="text-sm font-semibold">Kişisel Bilgiler</p>
              </div>
              <Separator />
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="first_name">
                    Ad <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="first_name"
                    name="first_name"
                    value={form.first_name}
                    onChange={handleChange}
                    placeholder="Ad"
                    className={`h-10 ${errors.first_name ? "border-destructive focus-visible:ring-destructive/50" : ""}`}
                    disabled={loading}
                  />
                  {errors.first_name && (
                    <p className="text-xs text-destructive">
                      {errors.first_name}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="last_name">
                    Soyad <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="last_name"
                    name="last_name"
                    value={form.last_name}
                    onChange={handleChange}
                    placeholder="Soyad"
                    className={`h-10 ${errors.last_name ? "border-destructive focus-visible:ring-destructive/50" : ""}`}
                    disabled={loading}
                  />
                  {errors.last_name && (
                    <p className="text-xs text-destructive">
                      {errors.last_name}
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
                    placeholder="ad.soyad@rehberiniz.com"
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
                      Öğrenci bu e-posta ve şifre ile sisteme giriş yapacak.
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Kurum Bilgileri */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <SchoolIcon className="h-4 w-4 text-muted-foreground shrink-0" />
                <p className="text-sm font-semibold">Kurum Bilgileri</p>
              </div>
              <Separator />
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2 col-span-2">
                  <Label htmlFor="student_number">Öğrenci No</Label>
                  <Input
                    id="student_number"
                    name="student_number"
                    value={form.student_number}
                    onChange={handleChange}
                    placeholder="12345"
                    className="h-10"
                    disabled={loading}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="grade">Sınıf</Label>
                  <Input
                    id="grade"
                    name="grade"
                    value={form.grade}
                    onChange={handleChange}
                    placeholder="12-A"
                    className="h-10"
                    disabled={loading}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="branch">Alan</Label>
                  <Input
                    id="branch"
                    name="branch"
                    value={form.branch}
                    onChange={handleChange}
                    placeholder="Sayısal"
                    className="h-10"
                    disabled={loading}
                  />
                </div>
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
            {loading ? "Kaydediliyor..." : "Öğrenci Ekle"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
