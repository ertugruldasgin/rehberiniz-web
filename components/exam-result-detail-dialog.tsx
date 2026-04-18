"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Trash2Icon } from "lucide-react";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import type { ExamResult } from "@/types/exam";
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

function calcNet(correct: number, incorrect: number) {
  return Math.round((correct - incorrect * 0.25) * 100) / 100;
}

interface SectionState {
  subject_id: string;
  subject_name: string;
  correct: number;
  incorrect: number;
  empty: number;
  net: number;
  questions: number;
}

interface ExamResultDetailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  result: ExamResult | null;
  onSuccess: () => void;
}

export function ExamResultDetailDialog({
  open,
  onOpenChange,
  result,
  onSuccess,
}: ExamResultDetailDialogProps) {
  const [sections, setSections] = useState<SectionState[]>([]);
  const [saving, setSaving] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (result) {
      setSections(
        result.subjects.map((s) => ({
          subject_id: s.subject_id,
          subject_name: s.subject_name,
          correct: s.correct,
          incorrect: s.incorrect,
          empty: s.empty,
          net: s.net,
          questions: s.correct + s.incorrect + s.empty,
        })),
      );
    }
  }, [result]);

  function handleSectionChange(
    index: number,
    field: "correct" | "incorrect",
    value: string,
  ) {
    setSections((prev) =>
      prev.map((s, i) => {
        if (i !== index) return s;
        const val = Math.max(0, Math.min(s.questions, parseInt(value) || 0));
        const correct = field === "correct" ? val : s.correct;
        const incorrect = field === "incorrect" ? val : s.incorrect;
        const empty = Math.max(0, s.questions - correct - incorrect);
        const net = calcNet(correct, incorrect);
        return { ...s, correct, incorrect, empty, net };
      }),
    );
  }

  async function handleSave() {
    if (!result) return;
    setSaving(true);
    try {
      const res = await fetch("/api/exam-results/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ result_id: result.id, sections }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Bir hata oluştu.");
      toast.success("Sonuç güncellendi.");
      onOpenChange(false);
      onSuccess();
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!result) return;
    setDeleting(true);
    try {
      const res = await fetch("/api/exam-results/delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ result_id: result.id }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Bir hata oluştu.");
      toast.success("Sonuç silindi.");
      setDeleteOpen(false);
      onOpenChange(false);
      onSuccess();
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setDeleting(false);
    }
  }

  const totalCorrect = sections.reduce((s, r) => s + r.correct, 0);
  const totalIncorrect = sections.reduce((s, r) => s + r.incorrect, 0);
  const totalNet = sections.reduce((s, r) => s + r.net, 0);

  const dateFormatted = result?.exam_date
    ? new Date(result.exam_date + "T00:00:00").toLocaleDateString("tr-TR", {
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : "—";

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-lg p-0 pb-2 gap-0 overflow-hidden">
          <DialogHeader className="px-6 pt-6 pb-4 border-b shrink-0">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0 space-y-0.5">
                <DialogTitle className="text-base font-bold truncate">
                  {result?.exam_name}
                </DialogTitle>
                <DialogDescription className="text-xs text-muted-foreground">
                  {dateFormatted}
                </DialogDescription>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setDeleteOpen(true)}
                className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10 shrink-0 cursor-pointer"
              >
                <Trash2Icon className="h-4 w-4" />
              </Button>
            </div>
          </DialogHeader>

          <div className="px-6 py-5 space-y-5 max-h-[60vh] overflow-y-auto">
            {/* Özet */}
            <div className="grid grid-cols-3 gap-3">
              <div className="rounded-xl bg-green-50 dark:bg-green-900/20 p-3 text-center">
                <p className="text-xs text-muted-foreground mb-1">
                  Toplam Doğru
                </p>
                <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                  {totalCorrect}
                </p>
              </div>
              <div className="rounded-xl bg-red-50 dark:bg-red-900/20 p-3 text-center">
                <p className="text-xs text-muted-foreground mb-1">
                  Toplam Yanlış
                </p>
                <p className="text-2xl font-bold text-red-500">
                  {totalIncorrect}
                </p>
              </div>
              <div className="rounded-xl bg-primary/5 border border-primary/10 p-3 text-center">
                <p className="text-xs text-muted-foreground mb-1">Toplam Net</p>
                <p className="text-2xl font-bold text-primary">
                  {totalNet.toFixed(2)}
                </p>
              </div>
            </div>

            <Separator />

            {/* Dersler */}
            <div className="space-y-2">
              {sections.map((s, i) => (
                <div
                  key={s.subject_id}
                  className="rounded-xl border bg-card p-3"
                >
                  <div className="flex items-center justify-between gap-4 mb-3">
                    <div className="min-w-0">
                      <p className="text-sm font-semibold truncate">
                        {s.subject_name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {s.questions} soru · Boş: {s.empty}
                      </p>
                    </div>
                    <div
                      className={cn(
                        "text-lg font-bold tabular-nums shrink-0",
                        s.net > 0
                          ? "text-primary"
                          : s.net < 0
                            ? "text-destructive"
                            : "text-muted-foreground",
                      )}
                    >
                      {s.net.toFixed(2)}
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-xs text-green-600 dark:text-green-400 font-medium block mb-1">
                        Doğru
                      </label>
                      <Input
                        type="number"
                        min={0}
                        max={s.questions}
                        value={s.correct || ""}
                        onChange={(e) =>
                          handleSectionChange(i, "correct", e.target.value)
                        }
                        className="h-9 text-center tabular-nums"
                        disabled={saving}
                      />
                    </div>
                    <div>
                      <label className="text-xs text-red-500 font-medium block mb-1">
                        Yanlış
                      </label>
                      <Input
                        type="number"
                        min={0}
                        max={s.questions}
                        value={s.incorrect || ""}
                        onChange={(e) =>
                          handleSectionChange(i, "incorrect", e.target.value)
                        }
                        className="h-9 text-center tabular-nums"
                        disabled={saving}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <DialogFooter className="px-6 py-4 border-t bg-card shrink-0">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={saving}
              className="cursor-pointer"
            >
              İptal
            </Button>
            <Button
              onClick={handleSave}
              disabled={saving}
              className="cursor-pointer"
            >
              {saving ? "Kaydediliyor..." : "Kaydet"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent className="bg-popover ring-border">
          <AlertDialogHeader>
            <AlertDialogTitle>Sonucu sil</AlertDialogTitle>
            <AlertDialogDescription>
              <span className="font-medium text-foreground">
                {result?.exam_name}
              </span>{" "}
              sonucunu silmek istediğinize emin misiniz? Bu işlem geri alınamaz.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
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
    </>
  );
}
