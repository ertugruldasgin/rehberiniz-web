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

interface DeleteTeacherDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  teacherMemberId: string;
  teacherName: string;
}

export function DeleteTeacherDialog({
  open,
  onOpenChange,
  teacherMemberId,
  teacherName,
}: DeleteTeacherDialogProps) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleDelete() {
    setLoading(true);
    try {
      const res = await fetch("/api/teachers/delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ teacher_member_id: teacherMemberId }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Bir hata oluştu.");

      toast.success("Öğretmen silindi.");
      onOpenChange(false);
      router.push("/dashboard/admin/teachers");
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
            Öğretmeni silmek istediğinize emin misiniz?
          </AlertDialogTitle>
          <AlertDialogDescription className="text-sm">
            <span className="font-medium text-foreground">{teacherName}</span>{" "}
            adlı öğretmenin tüm verileri kalıcı olarak silinecek. Bu işlem geri
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
