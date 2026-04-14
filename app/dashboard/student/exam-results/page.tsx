"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ExamResultsTable } from "@/components/exam-results-table";
import { AddExamResultDialog } from "@/components/add-exam-result-dialog";
import { SubmitOfficialExamDialog } from "@/components/submit-official-exam-dialog";
import { useMyExamResults } from "@/hooks/use-exam-results";
import { usePendingExams } from "@/hooks/use-pending-exams";
import type { ExamResult } from "@/types/exam";
import { PageHeader } from "@/components/page-header";
import { CheckIcon, ClipboardListIcon, SearchIcon } from "lucide-react";
import { PendingExamsDialog } from "@/components/pending-exams-dialog";

type ViewType = "general" | "branch" | "official";

function groupByCategory(results: ExamResult[]): Record<string, ExamResult[]> {
  return results.reduce(
    (acc, r) => {
      const key = r.category;
      if (!acc[key]) acc[key] = [];
      acc[key].push(r);
      return acc;
    },
    {} as Record<string, ExamResult[]>,
  );
}

export default function ExamResultsPage() {
  const { results, loading, error, refetch } = useMyExamResults();
  const {
    exams: pendingExams,
    loading: pendingLoading,
    refetch: refetchPending,
  } = usePendingExams();
  const [view, setView] = useState<ViewType>("general");
  const [search, setSearch] = useState("");
  const [addOpen, setAddOpen] = useState(false);
  const [pendingOpen, setPendingOpen] = useState(false);
  const [submitOpen, setSubmitOpen] = useState(false);
  const [selectedPendingExam, setSelectedPendingExam] = useState<
    (typeof pendingExams)[0] | null
  >(null);
  const [showOfficial, setShowOfficial] = useState(true);

  const generalResults = results.filter(
    (r) => !r.is_standalone && (showOfficial || !r.is_official),
  );
  const branchResults = results.filter(
    (r) => r.is_standalone && (showOfficial || !r.is_official),
  );
  const officialResults = results.filter((r) => r.is_official);

  const currentResults =
    view === "general"
      ? generalResults
      : view === "branch"
        ? branchResults
        : officialResults;

  const filteredResults = currentResults.filter((r) =>
    r.category.toLowerCase().includes(search.toLowerCase()),
  );
  const grouped = groupByCategory(filteredResults);

  function handlePendingExamSelect(exam: (typeof pendingExams)[0]) {
    setSelectedPendingExam(exam);
    setPendingOpen(false);
    setSubmitOpen(true);
  }

  return (
    <div className="flex flex-col px-4 md:px-6 space-y-6">
      <PageHeader
        title="Sınav Sonuçlarım"
        description="Girdiğiniz denemelerin detaylı sonuçlarını görüntüleyin."
      />

      <div className="flex flex-row flex-wrap-reverse gap-4 items-center justify-between">
        <div className="flex flex-row flex-wrap gap-3">
          <div className="flex items-center gap-1 p-1 rounded-xl bg-muted w-fit">
            {(["general", "branch", "official"] as ViewType[]).map((type) => (
              <button
                key={type}
                type="button"
                onClick={() => {
                  setView(type);
                  setSearch("");
                }}
                className={cn(
                  "px-4 py-1.5 rounded-lg text-sm font-medium transition-all cursor-pointer",
                  view === type
                    ? "bg-card text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                {type === "general"
                  ? "Genel"
                  : type === "branch"
                    ? "Branş"
                    : "Kurum"}
                {!loading && (
                  <span
                    className={cn(
                      "ml-1.5 text-xs px-1.5 py-0.5 rounded-full",
                      view === type
                        ? "bg-muted text-muted-foreground"
                        : "bg-muted/50 text-muted-foreground/70",
                    )}
                  >
                    {type === "general"
                      ? generalResults.length
                      : type === "branch"
                        ? branchResults.length
                        : officialResults.length}
                  </span>
                )}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-1 p-1 rounded-xl bg-muted w-fit">
            <button
              type="button"
              onClick={() => setShowOfficial((p) => !p)}
              className={cn(
                "px-4 py-1.5 rounded-lg text-sm font-medium transition-all cursor-pointer flex items-center gap-2",
                showOfficial
                  ? "bg-card text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              <div
                className={cn(
                  "h-3.5 w-3.5 rounded-sm border-2 flex items-center justify-center shrink-0 transition-all",
                  showOfficial
                    ? "bg-primary border-primary"
                    : "border-current opacity-50",
                )}
              >
                {showOfficial && (
                  <CheckIcon className="h-2.5 w-2.5 text-primary-foreground" />
                )}
              </div>
              Kurum Sınavları
            </button>
          </div>

          <div className="relative">
            <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
            <Input
              placeholder="Kategori ara..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 h-9 w-48 bg-card"
            />
          </div>
        </div>

        <div className="flex items-center gap-2">
          {!pendingLoading && pendingExams.length > 0 && (
            <button
              type="button"
              onClick={() => setPendingOpen(true)}
              className="relative flex items-center px-1.5 py-1.5 rounded-lg border border-destructive bg-destructive/5 hover:bg-destructive/10 transition-colors cursor-pointer"
            >
              <ClipboardListIcon className="h-4 w-4 text-destructive" />
              <span className="absolute -top-1.5 -right-1.5 h-4 w-4 rounded-full bg-destructive text-[10px] font-bold text-white flex items-center justify-center">
                {pendingExams.length}
              </span>
            </button>
          )}
          <Button onClick={() => setAddOpen(true)} className="cursor-pointer">
            Sonuç Ekle
          </Button>
        </div>
      </div>

      {/* İçerik */}
      {loading ? (
        <div className="space-y-6">
          {[...Array(2)].map((_, i) => (
            <div key={i} className="space-y-2">
              <div className="h-5 w-32 rounded-lg bg-muted animate-pulse" />
              <div className="space-y-3">
                {[...Array(3)].map((_, j) => (
                  <div
                    key={j}
                    className="h-12 rounded-xl bg-muted animate-pulse"
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : error ? (
        <div className="flex items-center justify-center py-12 text-sm text-destructive">
          {error}
        </div>
      ) : Object.keys(grouped).length === 0 ? (
        <div className="flex items-center justify-center py-12 text-sm text-muted-foreground">
          {search
            ? "Arama sonucu bulunamadı."
            : view === "general"
              ? "Henüz genel deneme sonucu bulunmuyor."
              : view === "branch"
                ? "Henüz branş denemesi sonucu bulunmuyor."
                : "Henüz kurum sınavı sonucu bulunmuyor."}
        </div>
      ) : (
        <div className="space-y-8">
          {Object.entries(grouped).map(([category, categoryResults]) => (
            <div key={category} className="space-y-3">
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-semibold">{category}</h2>
                <span className="text-xs text-muted-foreground px-1.5 py-0.5 rounded-full bg-muted">
                  {categoryResults.length}
                </span>
              </div>
              <ExamResultsTable
                results={categoryResults}
                type={view === "official" ? "general" : view}
              />
            </div>
          ))}
        </div>
      )}

      <AddExamResultDialog
        open={addOpen}
        onOpenChange={setAddOpen}
        onSuccess={refetch}
      />

      <PendingExamsDialog
        open={pendingOpen}
        onOpenChange={setPendingOpen}
        exams={pendingExams}
        onSelect={handlePendingExamSelect}
      />

      {selectedPendingExam && (
        <SubmitOfficialExamDialog
          open={submitOpen}
          onOpenChange={setSubmitOpen}
          exam={selectedPendingExam}
          onSuccess={() => {
            refetch();
            refetchPending();
          }}
        />
      )}
    </div>
  );
}
