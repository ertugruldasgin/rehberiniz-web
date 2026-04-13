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
} from "lucide-react";
import { useState } from "react";

export default function ExamsPage() {
  const { exams, loading, refetch } = useExams();
  const [addOpen, setAddOpen] = useState(false);

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
                  className="flex items-center gap-4 px-5 py-4 hover:bg-muted/30 transition-colors"
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
                  <div className="flex items-center gap-4 shrink-0">
                    <div className="hidden sm:flex items-center gap-1.5 text-xs text-muted-foreground">
                      <CalendarIcon className="h-3.5 w-3.5" />
                      {dateFormatted}
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <UsersIcon className="h-3.5 w-3.5" />
                      {exam.assignment_count} öğrenci
                    </div>
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
    </div>
  );
}
