"use client";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useState } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useUserRole } from "@/hooks/use-user-role";

interface DeleteStudentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  studentId: string;
  studentName: string;
}

export function DeleteStudentDialog({
  open,
  onOpenChange,
  studentId,
  studentName,
}: DeleteStudentDialogProps) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { userData } = useUserRole();

  async function handleDelete() {
    setLoading(true);
    try {
      const res = await fetch("/api/students/delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ student_id: studentId }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Bir hata oluştu.");

      toast.success("Öğrenci silindi.");
      onOpenChange(false);
      router.push(
        userData?.role === "admin"
          ? "/dashboard/admin/students"
          : "/dashboard/teacher/students",
      );
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="bg-popover ring-border">
        <AlertDialogHeader className="bg-popover">
          <AlertDialogTitle className="text-lg font-semibold">
            Öğrenciyi silmek istediğinize emin misiniz?
          </AlertDialogTitle>
          <AlertDialogDescription className="text-sm">
            <span className="font-medium text-foreground">{studentName}</span>{" "}
            adlı öğrencinin tüm verileri kalıcı olarak silinecek. Bu işlem geri
            alınamaz.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="bg-popover">
          <AlertDialogCancel disabled={loading} className="cursor-pointer">
            Vazgeç
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={loading}
            className="bg-destructive/90! text-destructive-foreground hover:bg-destructive! cursor-pointer"
          >
            {loading ? "Siliniyor..." : "Evet, Sil"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
