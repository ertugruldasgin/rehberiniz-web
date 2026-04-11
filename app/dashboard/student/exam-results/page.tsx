"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ExamResultsTable } from "@/components/exam-results-table";
import { AddExamResultDialog } from "@/components/add-exam-result-dialog";
import { useMyExamResults } from "@/hooks/use-exam-results";

type ViewType = "general" | "branch";

export default function ExamResultsPage() {
  const { results, loading, error, refetch } = useMyExamResults();
  const [view, setView] = useState<ViewType>("general");
  const [addOpen, setAddOpen] = useState(false);

  const generalResults = results.filter((r) => !r.is_standalone);
  const branchResults = results.filter((r) => r.is_standalone);
  const filtered = view === "general" ? generalResults : branchResults;

  return (
    <div className="flex flex-col px-4 md:px-6 space-y-6">
      {/* Başlık */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold tracking-tight">
            Sınav Sonuçları
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Girdiğiniz denemelerin detaylı sonuçlarını görüntüleyin.
          </p>
        </div>
        <Button onClick={() => setAddOpen(true)} className="cursor-pointer">
          Sonuç Ekle
        </Button>
      </div>

      {/* Pill seçici */}
      <div className="flex items-center gap-1 p-1 rounded-xl bg-muted w-fit">
        {(["general", "branch"] as ViewType[]).map((type) => (
          <button
            key={type}
            type="button"
            onClick={() => setView(type)}
            className={cn(
              "px-4 py-1.5 rounded-lg text-sm font-medium transition-all cursor-pointer",
              view === type
                ? "bg-card text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            {type === "general" ? `Genel Denemeler` : `Branş Denemeleri`}
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
                  : branchResults.length}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* İçerik */}
      {loading ? (
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-12 rounded-xl bg-muted animate-pulse" />
          ))}
        </div>
      ) : error ? (
        <div className="flex items-center justify-center py-12 text-sm text-destructive">
          {error}
        </div>
      ) : (
        <ExamResultsTable results={filtered} type={view} />
      )}

      <AddExamResultDialog
        open={addOpen}
        onOpenChange={setAddOpen}
        onSuccess={refetch}
      />
    </div>
  );
}
