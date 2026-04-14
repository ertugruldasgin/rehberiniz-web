"use client";

import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useExams } from "@/hooks/use-exams";
import { AddExamDialog } from "@/components/add-exam-dialog";
import {
  ClipboardListIcon,
  PlusIcon,
  CalendarIcon,
  UsersIcon,
  Trash2Icon,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
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

export default function ExamsPage() {
  const { exams, loading, refetch } = useExams();
  const [addOpen, setAddOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleteTitle, setDeleteTitle] = useState("");
  const [deleting, setDeleting] = useState(false);

  async function handleDelete() {
    if (!deleteId) return;
    setDeleting(true);
    try {
      const res = await fetch("/api/exams/delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ exam_id: deleteId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Bir hata oluştu.");
      toast.success("Sınav silindi.");
      refetch();
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setDeleting(false);
      setDeleteId(null);
    }
  }

  if (loading) {
    return (
      <div className="w-full px-4 md:px-6 space-y-6">
        <div className="space-y-2">
          <div className="h-8 w-40 rounded-lg bg-muted animate-pulse" />
          <div className="h-4 w-64 rounded-lg bg-muted animate-pulse" />
        </div>
        <div className="space-y-3">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-20 rounded-2xl bg-muted animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="w-full px-4 md:px-6 space-y-6">
      <div className="flex items-center justify-between gap-4">
        <PageHeader
          title="Sınavlar"
          description={`${exams.length} sınav listeleniyor.`}
        />
        <Button
          onClick={() => setAddOpen(true)}
          className="cursor-pointer shrink-0"
        >
          <span className="hidden sm:inline">Sınav Oluştur</span>
          <span className="sm:hidden">
            <PlusIcon className="h-4 w-4" />
          </span>
        </Button>
      </div>

      {exams.length === 0 ? (
        <div className="p-12 flex flex-col items-center gap-3 text-center">
          <ClipboardListIcon className="h-8 w-8 text-muted-foreground/30" />
          <p className="text-sm font-medium text-muted-foreground/60">
            Henüz sınav bulunmuyor
          </p>
          <p className="text-xs text-muted-foreground/40">
            Yeni bir sınav oluşturun ve öğrencilere atayın.
          </p>
        </div>
      ) : (
        <div className="rounded-2xl border bg-card overflow-hidden">
          <div className="divide-y">
            {exams.map((exam) => {
              const category =
                exam.exam_templates?.category ?? exam.subjects?.category ?? "—";
              const templateName =
                exam.exam_templates?.name ?? exam.subjects?.name ?? "—";
              const dateFormatted = new Date(exam.date).toLocaleDateString(
                "tr-TR",
                {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                },
              );

              return (
                <div
                  key={exam.id}
                  className="flex items-center gap-4 px-5 py-4 hover:bg-muted/30 transition-colors group"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-sm font-semibold truncate">
                        {exam.title}
                      </p>
                      <Badge variant="secondary" className="shrink-0">
                        {category}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {templateName}
                    </p>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <div className="hidden sm:flex items-center gap-1.5 text-xs text-muted-foreground">
                      <CalendarIcon className="h-3.5 w-3.5" />
                      {dateFormatted}
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <UsersIcon className="h-3.5 w-3.5" />
                      {exam.assignment_count} öğrenci
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => {
                        setDeleteId(exam.id);
                        setDeleteTitle(exam.title);
                      }}
                      className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all cursor-pointer"
                    >
                      <Trash2Icon className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <AddExamDialog
        open={addOpen}
        onOpenChange={setAddOpen}
        onSuccess={refetch}
      />

      <AlertDialog
        open={!!deleteId}
        onOpenChange={(o) => !o && setDeleteId(null)}
      >
        <AlertDialogContent className="bg-popover ring-border">
          <AlertDialogHeader className="bg-popover">
            <AlertDialogTitle className="text-lg font-semibold">
              Sınavı sil
            </AlertDialogTitle>
            <AlertDialogDescription className="text-sm">
              <span className="font-medium text-foreground">{deleteTitle}</span>{" "}
              sınavını silmek istediğinize emin misiniz? Tüm atamalar ve öğrenci
              sonuçları da silinecek.{" "}
              <span className="font-medium text-foreground">
                {" "}
                Bu işlem geri alınamaz{" "}
              </span>
              .
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="bg-popover">
            <AlertDialogCancel disabled={deleting} className="cursor-pointer">
              Vazgeç
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={deleting}
              className="bg-destructive/90! text-destructive-foreground hover:bg-destructive! cursor-pointer"
            >
              {deleting ? "Siliniyor..." : "Evet, Sil"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
