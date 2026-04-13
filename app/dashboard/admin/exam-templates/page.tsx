"use client";

import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { AddExamTemplateDialog } from "@/components/add-exam-template-dialog";
import { useExamTemplates } from "@/hooks/use-exam-templates";
import { useState } from "react";
import { ClipboardListIcon, PlusIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function ExamTemplatesPage() {
  const { templates, loading, refetch } = useExamTemplates();
  const [addOpen, setAddOpen] = useState(false);

  if (loading) {
    return (
      <div className="w-full px-4 md:px-6 space-y-6">
        <div className="space-y-2">
          <div className="h-8 w-48 rounded-lg bg-muted animate-pulse" />
          <div className="h-4 w-72 rounded-lg bg-muted animate-pulse" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-36 rounded-2xl bg-muted animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="w-full px-4 md:px-6 space-y-6">
      <div className="flex items-center justify-between gap-4">
        <PageHeader
          title="Sınav Şablonları"
          description="Sınav şablonlarınızı görüntüleyin ve oluşturun."
        />
        <Button
          onClick={() => setAddOpen(true)}
          className="cursor-pointer shrink-0"
        >
          <PlusIcon className="h-4 w-4 sm:hidden" />
          <span className="hidden sm:inline">Şablon Oluştur</span>
        </Button>
      </div>

      {templates.length === 0 ? (
        <div className="rounded-2xl border border-muted bg-card/50 p-12 flex flex-col items-center gap-3 text-center">
          <ClipboardListIcon className="h-8 w-8 text-muted-foreground/30" />
          <p className="text-sm font-medium text-muted-foreground/60">
            Henüz şablon bulunmuyor
          </p>
          <p className="text-xs text-muted-foreground/40">
            Yeni bir sınav şablonu oluşturun.
          </p>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setAddOpen(true)}
            className="mt-1 cursor-pointer"
          >
            Şablon Oluştur
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {templates.map((t) => (
            <div
              key={t.id}
              className="flex flex-col justify-between rounded-2xl border border-border bg-card p-5 space-y-3 transition-colors"
            >
              <div className="flex flex-col">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <h3 className="font-semibold text-sm truncate">{t.name}</h3>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {t.sections.length} bölüm
                    </p>
                  </div>
                  <Badge variant="secondary" className="shrink-0">
                    {t.category}
                  </Badge>
                </div>
                <div className="space-y-1.5">
                  {t.sections.map((s) => (
                    <div
                      key={s.key}
                      className="flex items-center justify-between text-xs"
                    >
                      <span className="text-muted-foreground truncate">
                        {s.label}
                      </span>
                      <span className="text-card-foreground font-medium tabular-nums shrink-0 ml-2">
                        {s.questions} soru
                      </span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="flex justify-end pt-1 border-t border-card-foreground">
                <p className="text-xs text-muted-foreground">
                  Toplam:{" "}
                  <span className="font-semibold text-foreground">
                    {t.sections.reduce((a, s) => a + s.questions, 0)}
                  </span>{" "}
                  soru
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      <AddExamTemplateDialog
        open={addOpen}
        onOpenChange={setAddOpen}
        onSuccess={refetch}
      />
    </div>
  );
}
