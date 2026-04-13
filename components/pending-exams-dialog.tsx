"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { ClipboardListIcon } from "lucide-react";
import type { PendingExam } from "@/hooks/use-pending-exams";

interface PendingExamsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  exams: PendingExam[];
  onSelect: (exam: PendingExam) => void;
}

export function PendingExamsDialog({
  open,
  onOpenChange,
  exams,
  onSelect,
}: PendingExamsDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md p-0 pb-2 gap-0 overflow-hidden">
        <DialogHeader className="px-6 pt-6 pb-4 border-b shrink-0">
          <DialogTitle className="text-base font-semibold">
            Bekleyen Sınav Sonuçları
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            Sonuç girmek istediğiniz sınava tıklayın.
          </DialogDescription>
        </DialogHeader>

        <div className="px-4 py-4 space-y-2">
          {exams.map((exam) => {
            const category =
              exam.exam_templates?.category ?? exam.subjects?.category ?? "—";
            const dateFormatted = new Date(exam.date).toLocaleDateString(
              "tr-TR",
              {
                day: "numeric",
                month: "long",
                year: "numeric",
              },
            );
            return (
              <button
                key={exam.id}
                type="button"
                onClick={() => onSelect(exam)}
                className="w-full flex items-center justify-between gap-3 bg-card rounded-xl px-4 py-3 border border-dashed border-destructive hover:border-destructive hover:bg-destructive/5 transition-all cursor-pointer group"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="h-8 w-8 rounded-lg border border-destructive bg-destructive/5 flex items-center justify-center shrink-0">
                    <ClipboardListIcon className="h-3.5 w-3.5 text-destructive" />
                  </div>
                  <div className="min-w-0 text-left">
                    <p className="text-sm font-medium truncate">{exam.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {category} · {dateFormatted}
                    </p>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </DialogContent>
    </Dialog>
  );
}
