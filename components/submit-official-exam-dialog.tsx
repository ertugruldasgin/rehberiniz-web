"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { ClipboardListIcon } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import type { PendingExam } from "@/hooks/use-pending-exams";

interface SectionResult {
  key: string;
  label: string;
  questions: number;
  correct: number;
  incorrect: number;
  empty: number;
  net: number;
}

interface SubmitOfficialExamDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  exam: PendingExam;
  onSuccess: () => void;
}

function calcNet(correct: number, incorrect: number) {
  return Math.round((correct - incorrect * 0.25) * 100) / 100;
}

function initSections(exam: PendingExam): SectionResult[] {
  if (exam.exam_templates?.sections) {
    return exam.exam_templates.sections.map((s: any) => ({
      key: s.key,
      label: s.label,
      questions: s.questions,
      correct: 0,
      incorrect: 0,
      empty: s.questions,
      net: 0,
    }));
  }
  if (exam.subjects) {
    return [
      {
        key: exam.subjects.slug,
        label: exam.subjects.name,
        questions: exam.subjects.default_questions,
        correct: 0,
        incorrect: 0,
        empty: exam.subjects.default_questions,
        net: 0,
      },
    ];
  }
  return [];
}

export function SubmitOfficialExamDialog({
  open,
  onOpenChange,
  exam,
  onSuccess,
}: SubmitOfficialExamDialogProps) {
  const [sections, setSections] = useState<SectionResult[]>(() =>
    initSections(exam),
  );
  const [loading, setLoading] = useState(false);

  function handleSectionChange(
    key: string,
    field: "correct" | "incorrect",
    value: string,
  ) {
    setSections((prev) =>
      prev.map((s) => {
        if (s.key !== key) return s;
        const val = Math.max(0, Math.min(s.questions, parseInt(value) || 0));
        const correct = field === "correct" ? val : s.correct;
        const incorrect = field === "incorrect" ? val : s.incorrect;
        const empty = Math.max(0, s.questions - correct - incorrect);
        return {
          ...s,
          correct,
          incorrect,
          empty,
          net: calcNet(correct, incorrect),
        };
      }),
    );
  }

  async function handleSubmit() {
    setLoading(true);
    try {
      const res = await fetch("/api/exam-results/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: exam.title,
          date: exam.date,
          template_id: exam.exam_template_id,
          subject_id: exam.subject_id,
          exam_id: exam.id,
          is_standalone: false,
          sections,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Bir hata oluştu.");
      toast.success("Sınav sonucu kaydedildi.");
      onOpenChange(false);
      onSuccess();
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  }

  function handleClose() {
    setSections(initSections(exam));
    onOpenChange(false);
  }

  const totalCorrect = sections.reduce((s, r) => s + r.correct, 0);
  const totalIncorrect = sections.reduce((s, r) => s + r.incorrect, 0);
  const totalNet = sections.reduce((s, r) => s + r.net, 0);

  const category =
    exam.exam_templates?.category ?? exam.subjects?.category ?? "—";
  const dateFormatted = new Date(exam.date).toLocaleDateString("tr-TR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl p-0 pb-2 gap-0 overflow-hidden">
        <DialogHeader className="px-6 pt-6 pb-4 border-b shrink-0">
          <DialogTitle className="text-lg font-bold">{exam.title}</DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground">
            {category} · {dateFormatted} · Her ders için doğru ve yanlış
            sayısını girin.
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-[65vh]">
          <div className="px-6 py-6 space-y-5">
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

            {/* Dersler */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <ClipboardListIcon className="h-4 w-4 text-muted-foreground shrink-0" />
                <p className="text-sm font-semibold">Ders Sonuçları</p>
              </div>
              <Separator />
              <div className="space-y-2">
                {sections.map((s) => (
                  <div key={s.key} className="rounded-xl border bg-card p-3">
                    <div className="flex items-center justify-between gap-4 mb-3">
                      <div className="min-w-0">
                        <p className="text-sm font-semibold truncate">
                          {s.label}
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
                            handleSectionChange(
                              s.key,
                              "correct",
                              e.target.value,
                            )
                          }
                          className="h-9 text-center tabular-nums"
                          disabled={loading}
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
                            handleSectionChange(
                              s.key,
                              "incorrect",
                              e.target.value,
                            )
                          }
                          className="h-9 text-center tabular-nums"
                          disabled={loading}
                        />
                      </div>
                    </div>
                  </div>
                ))}
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
            onClick={handleSubmit}
            disabled={loading}
            className="cursor-pointer"
          >
            {loading ? "Kaydediliyor..." : "Sonucu Kaydet"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
