"use client";

import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { AddExamDialog } from "@/components/add-exam-dialog";
import { useExams } from "@/hooks/use-exams";
import type { Exam } from "@/hooks/use-exams";
import { useExamRankings } from "@/hooks/use-exam-rankings";
import {
  PlusIcon,
  CalendarIcon,
  UsersIcon,
  ClipboardListIcon,
  Trash2Icon,
  SearchIcon,
  ArrowLeftIcon,
} from "lucide-react";
import { useState, Fragment } from "react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
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
import Link from "next/link";

interface ExamsRankingsViewProps {
  canDelete?: boolean;
  studentLinkPrefix?: string;
}

export function ExamsRankingsView({
  canDelete = false,
  studentLinkPrefix = "/dashboard/admin/students",
}: ExamsRankingsViewProps) {
  const { exams, loading, refetch } = useExams();
  const [addOpen, setAddOpen] = useState(false);
  const [selectedExam, setSelectedExam] = useState<Exam | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleteTitle, setDeleteTitle] = useState("");
  const [deleting, setDeleting] = useState(false);
  const [search, setSearch] = useState("");

  const {
    rankings,
    assigned,
    loading: rankingsLoading,
  } = useExamRankings(selectedExam?.id ?? null);

  const subjects = rankings[0]?.subjects.map((s) => s.subject_name) ?? [];
  const totalCols = 2 + subjects.length * 4 + 5;

  const filteredExams = exams.filter((e) =>
    e.title.toLowerCase().includes(search.toLowerCase()),
  );

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
      if (selectedExam?.id === deleteId) setSelectedExam(null);
      refetch();
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setDeleting(false);
      setDeleteId(null);
    }
  }

  return (
    <div className="flex flex-col px-4 md:px-6 gap-4">
      <div className="flex items-center justify-between gap-4">
        <PageHeader
          title="Sınavlar"
          description="Kurumsal sınavları görüntüleyin ve yönetin."
        />
        {canDelete && (
          <Button
            onClick={() => setAddOpen(true)}
            className="cursor-pointer shrink-0"
          >
            <span className="hidden sm:inline">Sınav Oluştur</span>
            <PlusIcon className="h-4 w-4 sm:hidden" />
          </Button>
        )}
      </div>

      <div className="flex gap-6" style={{ height: "calc(100vh - 12rem)" }}>
        {/* Sol sidebar */}
        <div
          className={cn(
            "shrink-0 w-full md:w-72 rounded-2xl overflow-hidden border bg-card flex flex-col",
            selectedExam ? "hidden md:flex" : "flex",
          )}
        >
          <div className="p-3 border-b bg-muted/80 shrink-0">
            <div className="relative">
              <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
              <Input
                placeholder="Sınav ara..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 h-9 bg-card border border-muted"
              />
            </div>
          </div>

          {loading ? (
            <div className="p-3 space-y-2">
              {[...Array(5)].map((_, i) => (
                <div
                  key={i}
                  className="h-14 rounded-xl bg-muted animate-pulse"
                />
              ))}
            </div>
          ) : filteredExams.length === 0 ? (
            <div className="flex flex-col items-center justify-center flex-1 gap-2 p-6 text-center">
              <ClipboardListIcon className="h-7 w-7 text-muted-foreground/30" />
              <p className="text-xs text-muted-foreground/60">
                {search ? "Sonuç bulunamadı." : "Henüz sınav yok."}
              </p>
            </div>
          ) : (
            <div className="flex-1 overflow-y-auto p-2 space-y-0.5">
              {filteredExams.map((exam) => {
                const category =
                  exam.exam_templates?.category ??
                  exam.subjects?.category ??
                  "—";
                const isSelected = selectedExam?.id === exam.id;
                return (
                  <button
                    key={exam.id}
                    type="button"
                    onClick={() => setSelectedExam(exam)}
                    className={cn(
                      "w-full text-left px-3 py-2.5 rounded-xl transition-all cursor-pointer",
                      isSelected ? "bg-primary/10" : "hover:bg-muted/60",
                    )}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <p
                        className={cn(
                          "text-xs font-semibold truncate leading-tight",
                          isSelected ? "text-primary" : "text-foreground",
                        )}
                      >
                        {exam.title}
                      </p>
                      <Badge
                        variant="secondary"
                        className="shrink-0 text-[10px] px-1.5 py-0"
                      >
                        {category}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-3 mt-1">
                      <span className="flex items-center gap-1 text-[11px] text-muted-foreground">
                        <CalendarIcon className="h-3 w-3" />
                        {new Date(exam.date + "T00:00:00").toLocaleDateString(
                          "tr-TR",
                          {
                            day: "numeric",
                            month: "short",
                          },
                        )}
                      </span>
                      <span className="flex items-center gap-1 text-[11px] text-muted-foreground">
                        <UsersIcon className="h-3 w-3" />
                        {exam.assignment_count}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Sağ — sonuç tablosu */}
        <div
          className={cn(
            "flex-1 min-w-0 overflow-auto rounded-2xl border bg-card",
            !selectedExam ? "hidden md:block" : "block",
          )}
        >
          {!selectedExam ? (
            <div className="h-full flex flex-col items-center justify-center gap-3 text-center p-6">
              <div className="h-12 w-12 rounded-2xl bg-muted flex items-center justify-center">
                <ClipboardListIcon className="h-6 w-6 text-muted-foreground/50" />
              </div>
              <p className="text-sm font-medium text-muted-foreground">
                Bir sınav seçin
              </p>
              <p className="text-xs text-muted-foreground/60">
                Soldan bir sınav seçerek öğrenci sıralamalarını
                görüntüleyebilirsiniz.
              </p>
            </div>
          ) : (
            <>
              {/* Header */}
              <div className="flex items-center bg-muted/80 gap-3 px-4 py-3 border-b shrink-0">
                <button
                  type="button"
                  onClick={() => setSelectedExam(null)}
                  className="md:hidden flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors cursor-pointer shrink-0"
                >
                  <ArrowLeftIcon className="h-4 w-4" />
                </button>
                <div className="min-w-0">
                  <p className="text-sm font-semibold truncate">
                    {selectedExam.title}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(
                      selectedExam.date + "T00:00:00",
                    ).toLocaleDateString("tr-TR", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}
                    {" · "}
                    {rankings.length} sonuç
                    {assigned.length > 0 && (
                      <span className="ml-1 text-muted-foreground/60">
                        · {assigned.length} bekliyor
                      </span>
                    )}
                  </p>
                </div>
                {canDelete && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => {
                      setDeleteId(selectedExam.id);
                      setDeleteTitle(selectedExam.title);
                    }}
                    className="ml-auto h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10 cursor-pointer shrink-0"
                  >
                    <Trash2Icon className="h-3.5 w-3.5" />
                  </Button>
                )}
              </div>

              {rankingsLoading ? (
                <div className="p-6 space-y-3">
                  {[...Array(5)].map((_, i) => (
                    <div
                      key={i}
                      className="h-10 rounded-lg bg-muted animate-pulse"
                    />
                  ))}
                </div>
              ) : (
                <div className="overflow-auto">
                  <table className="w-full text-xs">
                    <thead className="bg-muted/40 border-b sticky top-0 z-10">
                      <tr>
                        <th className="text-left px-4 py-3 font-medium text-muted-foreground w-8">
                          #
                        </th>
                        <th className="text-left px-4 py-3 font-medium text-muted-foreground min-w-[140px]">
                          Öğrenci
                        </th>
                        {subjects.map((s) => (
                          <th
                            key={s}
                            colSpan={4}
                            className="text-center px-2 py-3 font-medium text-muted-foreground border-l"
                          >
                            {s}
                          </th>
                        ))}
                        <th
                          colSpan={5}
                          className="text-center px-2 py-3 font-medium text-muted-foreground border-l"
                        >
                          Toplam
                        </th>
                      </tr>
                      <tr className="border-b bg-muted/20">
                        <th className="px-4 py-1.5" />
                        <th className="px-4 py-1.5" />
                        {subjects.map((s) => (
                          <Fragment key={s}>
                            <th className="text-center px-2 py-1.5 font-normal text-green-600 dark:text-green-400 border-l">
                              D
                            </th>
                            <th className="text-center px-2 py-1.5 font-normal text-red-500">
                              Y
                            </th>
                            <th className="text-center px-2 py-1.5 font-normal text-muted-foreground">
                              B
                            </th>
                            <th className="text-center px-2 py-1.5 font-normal">
                              Net
                            </th>
                          </Fragment>
                        ))}
                        <th className="text-center px-2 py-1.5 font-normal text-green-600 dark:text-green-400 border-l">
                          D
                        </th>
                        <th className="text-center px-2 py-1.5 font-normal text-red-500">
                          Y
                        </th>
                        <th className="text-center px-2 py-1.5 font-normal text-muted-foreground">
                          B
                        </th>
                        <th className="text-center px-2 py-1.5 font-normal">
                          Net
                        </th>
                        <th className="text-center px-2 py-1.5 font-normal text-primary">
                          Puan
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {rankings.length === 0 && assigned.length === 0 ? (
                        <tr>
                          <td
                            colSpan={totalCols}
                            className="text-center py-12 text-sm text-muted-foreground"
                          >
                            Henüz sonuç girilmemiş.
                          </td>
                        </tr>
                      ) : (
                        <>
                          {rankings.map((r, idx) => (
                            <tr
                              key={r.student_id}
                              className={cn(
                                "hover:bg-muted/30 transition-colors",
                                idx === 0 && "bg-amber-100/70",
                              )}
                            >
                              <td className="px-4 py-3 tabular-nums text-muted-foreground font-medium">
                                {idx + 1}
                              </td>
                              <td className="px-4 py-3">
                                <Link
                                  href={`${studentLinkPrefix}/${r.student_id}`}
                                  className="font-semibold text-foreground hover:underline"
                                >
                                  {r.first_name} {r.last_name}
                                </Link>
                                <p className="text-muted-foreground text-[11px]">
                                  {r.grade ? `${r.grade} - ` : ""}
                                  {r.student_number ?? "—"}
                                </p>
                              </td>
                              {r.subjects.map((s) => (
                                <Fragment
                                  key={`${r.student_id}-${s.subject_name}`}
                                >
                                  <td className="text-center px-2 py-3 tabular-nums text-green-600 dark:text-green-400 border-l">
                                    {s.correct}
                                  </td>
                                  <td className="text-center px-2 py-3 tabular-nums text-red-500">
                                    {s.incorrect}
                                  </td>
                                  <td className="text-center px-2 py-3 tabular-nums text-muted-foreground">
                                    {s.empty}
                                  </td>
                                  <td className="text-center px-2 py-3 tabular-nums font-medium">
                                    {s.net.toFixed(2)}
                                  </td>
                                </Fragment>
                              ))}
                              <td className="text-center px-2 py-3 tabular-nums text-green-600 dark:text-green-400 border-l">
                                {r.total_correct}
                              </td>
                              <td className="text-center px-2 py-3 tabular-nums text-red-500">
                                {r.total_incorrect}
                              </td>
                              <td className="text-center px-2 py-3 tabular-nums text-muted-foreground">
                                {r.total_empty}
                              </td>
                              <td className="text-center px-2 py-3 tabular-nums font-bold">
                                {r.total_net.toFixed(2)}
                              </td>
                              <td className="text-center px-2 py-3 tabular-nums font-bold text-primary">
                                {r.total_score.toFixed(2)}
                              </td>
                            </tr>
                          ))}

                          {/* Sonuç girilmemiş öğrenciler */}
                          {assigned.length > 0 && (
                            <>
                              <tr className="bg-muted/30">
                                <td colSpan={totalCols} className="px-4 py-2">
                                  <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wide">
                                    Sonuç Girilmemiş ({assigned.length})
                                  </span>
                                </td>
                              </tr>
                              {assigned.map((s) => (
                                <tr
                                  key={s.student_id}
                                  className="hover:bg-muted/20 transition-colors opacity-60"
                                >
                                  <td className="px-4 py-3 text-muted-foreground">
                                    —
                                  </td>
                                  <td className="px-4 py-3">
                                    <Link
                                      href={`${studentLinkPrefix}/${s.student_id}`}
                                      className="font-semibold text-foreground hover:underline"
                                    >
                                      {s.first_name} {s.last_name}
                                    </Link>
                                    <p className="text-muted-foreground text-[11px]">
                                      {s.grade ? `${s.grade} - ` : ""}
                                      {s.student_number ?? "—"}
                                    </p>
                                  </td>
                                  <td
                                    colSpan={totalCols - 2}
                                    className="px-4 py-3 text-center text-muted-foreground text-[11px]"
                                  >
                                    Henüz sonuç girilmemiş
                                  </td>
                                </tr>
                              ))}
                            </>
                          )}
                        </>
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {canDelete && (
        <AddExamDialog
          open={addOpen}
          onOpenChange={setAddOpen}
          onSuccess={refetch}
        />
      )}

      {canDelete && (
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
                <span className="font-medium text-foreground">
                  {deleteTitle}
                </span>{" "}
                sınavını silmek istediğinize emin misiniz? Tüm atamalar ve
                öğrenci sonuçları da silinecek.{" "}
                <span className="font-medium text-foreground">
                  Bu işlem geri alınamaz.
                </span>
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
      )}
    </div>
  );
}
