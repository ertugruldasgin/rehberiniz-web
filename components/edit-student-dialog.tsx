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
import { UserIcon, SchoolIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { StudentDetail } from "@/hooks/use-student";

interface EditStudentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
  student: StudentDetail;
}

const EMPTY_ERRORS = {
  first_name: "",
  last_name: "",
};

export function EditStudentDialog({
  open,
  onOpenChange,
  onSuccess,
  student,
}: EditStudentDialogProps) {
  const [form, setForm] = useState({
    first_name: "",
    last_name: "",
    student_number: "",
    grade: "",
    branch: "",
  });
  const [errors, setErrors] = useState(EMPTY_ERRORS);
  const [loading, setLoading] = useState(false);

  // Dialog açılınca mevcut verileri doldur
  useEffect(() => {
    if (open && student) {
      setForm({
        first_name: student.first_name,
        last_name: student.last_name,
        student_number: student.student_number ?? "",
        grade: student.grade ?? "",
        branch: student.branch ?? "",
      });
      setErrors(EMPTY_ERRORS);
    }
  }, [open, student]);

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

    setErrors(newErrors);
    return valid;
  }

  async function submitForm() {
    if (!validate()) return;

    setLoading(true);
    try {
      const res = await fetch("/api/students/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ student_id: student.id, ...form }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Bir hata oluştu.");

      toast.success("Öğrenci bilgileri güncellendi.");
      onOpenChange(false);
      onSuccess();
    } catch (err: any) {
      toast.error(err.message);
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
        {/* Header */}
        <DialogHeader className="px-6 pt-6 pb-4 border-b shrink-0">
          <DialogTitle className="text-lg font-bold">
            Öğrenciyi Düzenle
          </DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground">
            Öğrencinin bilgilerini güncelleyin.{" "}
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
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit_first_name">
                    Ad <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="edit_first_name"
                    name="first_name"
                    value={form.first_name}
                    onChange={handleChange}
                    placeholder="Ahmet"
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
                  <Label htmlFor="edit_last_name">
                    Soyad <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="edit_last_name"
                    name="last_name"
                    value={form.last_name}
                    onChange={handleChange}
                    placeholder="Yılmaz"
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

            {/* E-posta — sadece gösterim */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <UserIcon className="h-4 w-4 text-muted-foreground shrink-0" />
                <p className="text-sm font-semibold">Hesap Bilgileri</p>
              </div>
              <Separator />
              <div className="space-y-2">
                <Label>E-posta</Label>
                <div className="flex h-10 items-center rounded-md border bg-muted/50 px-3 text-sm text-muted-foreground">
                  {student.email ?? "—"}
                </div>
                <p className="text-xs text-muted-foreground">
                  E-posta adresi değiştirilemez.
                </p>
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
                  <Label htmlFor="edit_student_number">Öğrenci No</Label>
                  <Input
                    id="edit_student_number"
                    name="student_number"
                    value={form.student_number}
                    onChange={handleChange}
                    placeholder="12345"
                    className="h-10"
                    disabled={loading}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit_grade">Sınıf</Label>
                  <Input
                    id="edit_grade"
                    name="grade"
                    value={form.grade}
                    onChange={handleChange}
                    placeholder="10"
                    className="h-10"
                    disabled={loading}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit_branch">Alan</Label>
                  <Input
                    id="edit_branch"
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
          </div>
        </ScrollArea>

        {/* Footer */}
        <DialogFooter className="px-6 py-4 border-t bg-card shrink-0">
          <Button
            type="button"
            variant="outline"
            onClick={handleClose}
            disabled={loading}
            className="hover:cursor-pointer"
          >
            İptal
          </Button>
          <Button
            type="button"
            onClick={submitForm}
            disabled={loading}
            className="hover:cursor-pointer"
          >
            {loading ? "Kaydediliyor..." : "Değişiklikleri Kaydet"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
