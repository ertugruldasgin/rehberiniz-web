"use client";

import { ExamResultsTable } from "@/components/exam-results-table";
import { useMyExamResults } from "@/hooks/use-exam-results";

export default function ExamResultsPage() {
  const { results, loading, error } = useMyExamResults();

  return (
    <div className="flex flex-col px-4 md:px-6 space-y-6">
      <div>
        <h1 className="text-xl font-semibold tracking-tight">
          Sınav Sonuçları
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Girdiğiniz denemelerin detaylı sonuçlarını görüntüleyin.
        </p>
      </div>

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
        <ExamResultsTable results={results} />
      )}
    </div>
  );
}
