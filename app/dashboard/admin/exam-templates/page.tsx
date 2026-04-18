"use client";

import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { AddExamTemplateDialog } from "@/components/add-exam-template-dialog";
import { useExamTemplates } from "@/hooks/use-exam-templates";
import { useState } from "react";
import { ClipboardListIcon, PlusIcon, Trash2Icon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
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

export default function ExamTemplatesPage() {
  const { templates, loading, refetch } = useExamTemplates();
  const [addOpen, setAddOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleteName, setDeleteName] = useState("");
  const [deleting, setDeleting] = useState(false);

  async function handleDelete() {
    if (!deleteId) return;
    setDeleting(true);
    try {
      const res = await fetch("/api/exam-templates/delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ template_id: deleteId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Bir hata oluştu.");
      toast.success("Şablon silindi.");
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

  const generalTemplates = templates.filter((t) => !t.organization_id);
  const customTemplates = templates.filter((t) => !!t.organization_id);

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
        <div className="space-y-8">
          {generalTemplates.length > 0 && (
            <div className="space-y-3">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                Genel Şablonlar
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {generalTemplates.map((t) => (
                  <TemplateCard
                    key={t.id}
                    template={t}
                    canDelete={false}
                    onDelete={() => {}}
                  />
                ))}
              </div>
            </div>
          )}

          {customTemplates.length > 0 && (
            <div className="space-y-3">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                Kurum Şablonları
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {customTemplates.map((t) => (
                  <TemplateCard
                    key={t.id}
                    template={t}
                    canDelete={true}
                    onDelete={() => {
                      setDeleteId(t.id);
                      setDeleteName(t.name);
                    }}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      <AddExamTemplateDialog
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
              Şablonu sil
            </AlertDialogTitle>
            <AlertDialogDescription className="text-sm">
              <span className="font-medium text-foreground">{deleteName}</span>{" "}
              şablonunu silmek istediğinize emin misiniz? Mevcut sınav sonuçları
              etkilenmez.
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

function TemplateCard({
  template: t,
  canDelete,
  onDelete,
}: {
  template: ReturnType<typeof useExamTemplates>["templates"][0];
  canDelete: boolean;
  onDelete: () => void;
}) {
  const wrongPenaltyLabel =
    t.wrong_penalty === 0.25
      ? "4'te 1"
      : t.wrong_penalty === 0.333
        ? "3'te 1"
        : t.wrong_penalty === 0
          ? "Ceza yok"
          : `${t.wrong_penalty}`;

  return (
    <div className="flex flex-col justify-between rounded-2xl border border-border bg-card p-5 gap-3 transition-colors">
      {/* Üst: isim + kategori */}
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

      {/* Section listesi */}
      <div className="space-y-1">
        <div
          className={`grid gap-x-2 px-0.5 mb-1 ${canDelete ? "grid-cols-[1fr_40px_52px]" : "grid-cols-[1fr_40px]"}`}
        >
          <p className="text-[11px] text-muted-foreground/60">Bölüm</p>
          <p className="text-[11px] text-muted-foreground/60 text-right">
            Soru
          </p>
          {canDelete && (
            <p className="text-[11px] text-muted-foreground/60 text-right">
              Katsayı
            </p>
          )}
        </div>
        {t.sections.map((s) => (
          <div
            key={s.key}
            className={`grid gap-x-2 items-center text-xs ${canDelete ? "grid-cols-[1fr_40px_52px]" : "grid-cols-[1fr_40px]"}`}
          >
            <span className="text-muted-foreground truncate">{s.label}</span>
            <span className="text-foreground font-medium tabular-nums text-right">
              {s.questions}
            </span>
            {canDelete && (
              <span className="text-primary font-medium tabular-nums text-right">
                {s.coefficient ?? "—"}
              </span>
            )}
          </div>
        ))}
      </div>

      {/* Alt: puanlama + toplam */}
      <div className="space-y-1.5 pt-2 border-t">
        {canDelete && (
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">Başlangıç / Maks</span>
            <span className="tabular-nums font-medium text-foreground">
              {t.base_score ?? 100} / {t.max_score ?? 500}
            </span>
          </div>
        )}
        <div className="flex items-center justify-between">
          <p className="text-xs text-muted-foreground">
            Toplam{" "}
            <span className="font-semibold text-foreground">
              {t.sections.reduce((a, s) => a + s.questions, 0)}
            </span>{" "}
            soru
            {canDelete && (
              <span className="ml-2">
                <span className="font-semibold text-foreground">
                  {wrongPenaltyLabel}
                </span>{" "}
                yanlış cezası
              </span>
            )}
          </p>
          {canDelete && (
            <Button
              variant="ghost"
              size="icon"
              onClick={onDelete}
              className="h-7 w-7 text-muted-foreground hover:text-destructive hover:bg-destructive/10 cursor-pointer"
            >
              <Trash2Icon className="h-3.5 w-3.5" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
