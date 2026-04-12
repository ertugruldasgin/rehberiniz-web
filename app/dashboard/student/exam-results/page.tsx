"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ExamResultsTable } from "@/components/exam-results-table";
import { AddExamResultDialog } from "@/components/add-exam-result-dialog";
import { useMyExamResults } from "@/hooks/use-exam-results";
import type { ExamResult } from "@/types/exam";
import { PageHeader } from "@/components/page-header";

type ViewType = "general" | "branch";

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
  const [view, setView] = useState<ViewType>("general");
  const [addOpen, setAddOpen] = useState(false);

  const generalResults = results.filter((r) => !r.is_standalone);
  const branchResults = results.filter((r) => r.is_standalone);
  const filtered = view === "general" ? generalResults : branchResults;
  const grouped = groupByCategory(filtered);

  return (
    <div className="flex flex-col px-4 md:px-6 space-y-6">
      <PageHeader
        title="Sınav Sonuçlarım"
        description="Girdiğiniz denemelerin detaylı sonuçlarını görüntüleyin."
      />

      <div className="flex flex-row items-center justify-between">
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
              {type === "general" ? "Genel Denemeler" : "Branş Denemeleri"}
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
        <Button onClick={() => setAddOpen(true)} className="cursor-pointer">
          Sonuç Ekle
        </Button>
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
          {view === "general"
            ? "Henüz genel deneme sonucu bulunmuyor."
            : "Henüz branş denemesi sonucu bulunmuyor."}
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
              <ExamResultsTable results={categoryResults} type={view} />
            </div>
          ))}
        </div>
      )}

      <AddExamResultDialog
        open={addOpen}
        onOpenChange={setAddOpen}
        onSuccess={refetch}
      />
    </div>
  );
}
