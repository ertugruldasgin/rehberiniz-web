"use client";

import { PageHeader } from "@/components/page-header";
import { StudentSidebar } from "@/components/student-sidebar";
import { ExamResultsTable } from "@/components/exam-results-table";
import { AddExamResultDialog } from "@/components/add-exam-result-dialog";
import { useStudents } from "@/hooks/use-students";
import { useExamResults } from "@/hooks/use-exam-results";
import { useUserRole } from "@/hooks/use-user-role";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  ArrowLeftIcon,
  CheckIcon,
  ClipboardListIcon,
  PlusIcon,
  SearchIcon,
  UsersIcon,
} from "lucide-react";
import type { ExamResult } from "@/types/exam";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Link from "next/link";
import { ExamResultDetailDialog } from "@/components/exam-result-detail-dialog";

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

export default function ExamEntryPage() {
  const { userData } = useUserRole();
  const { students, loading: studentsLoading } = useStudents(userData?.id);
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(
    null,
  );
  const [selectedResult, setSelectedResult] = useState<ExamResult | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);

  const selectedStudent =
    students.find((s) => s.id === selectedStudentId) ?? null;
  const {
    results,
    loading: resultsLoading,
    refetch,
  } = useExamResults(selectedStudentId ?? "");

  const [view, setView] = useState<ViewType>("general");
  const [search, setSearch] = useState("");
  const [showOfficial, setShowOfficial] = useState(true);
  const [addOpen, setAddOpen] = useState(false);

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

  function handleSelectStudent(id: string) {
    setSelectedStudentId(id);
    setView("general");
    setSearch("");
  }

  return (
    <div className="flex flex-col px-4 md:px-6 gap-4 h-full">
      <PageHeader
        title="Sonuç Yönetimi"
        description="Öğrencilerinizin sınav sonuçlarını görüntüleyin ve yönetin."
      />

      <div className="flex gap-6 flex-1 min-h-0">
        {/* Sol sidebar — sadece md+ */}
        <div className="hidden md:block shrink-0 w-64 overflow-hidden">
          <StudentSidebar
            students={students}
            loading={studentsLoading}
            selectedId={selectedStudentId}
            onSelect={handleSelectStudent}
            className="h-full"
          />
        </div>

        {/* Sağ içerik */}
        <div className="flex flex-col flex-1 min-w-0 overflow-y-auto">
          {/* Öğrenci seçilmemiş */}
          {!selectedStudentId ? (
            <>
              {/* Mobil: liste */}
              <div className="md:hidden">
                <StudentSidebar
                  students={students}
                  loading={studentsLoading}
                  selectedId={selectedStudentId}
                  onSelect={handleSelectStudent}
                />
              </div>
              {/* Desktop: ortalanmış mesaj */}
              <div className="hidden md:flex h-full flex-col items-center justify-center gap-3 text-center">
                <div className="h-12 w-12 rounded-2xl flex items-center justify-center">
                  <UsersIcon className="h-6 w-6 text-muted-foreground/50" />
                </div>
                <p className="text-sm font-medium text-muted-foreground">
                  Bir öğrenci seçin
                </p>
                <p className="text-xs text-muted-foreground/60">
                  Soldan bir öğrenci seçerek sınav sonuçlarını
                  görüntüleyebilirsiniz.
                </p>
              </div>
            </>
          ) : (
            <div className="space-y-5">
              {/* Öğrenci banner */}
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3 min-w-0">
                  {/* Mobil geri butonu */}
                  <button
                    type="button"
                    onClick={() => setSelectedStudentId(null)}
                    className="md:hidden flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors cursor-pointer shrink-0"
                  >
                    <ArrowLeftIcon className="h-4 w-4" />
                  </button>

                  {selectedStudent && (
                    <>
                      <Avatar className="h-9 w-9 rounded-xl shrink-0">
                        <AvatarImage
                          src={selectedStudent.avatar_url ?? undefined}
                          className="rounded-xl object-cover"
                        />
                        <AvatarFallback className="rounded-xl bg-primary/10 text-primary text-xs font-semibold">
                          {selectedStudent.first_name[0]}
                          {selectedStudent.last_name[0]}
                        </AvatarFallback>
                      </Avatar>
                      <div className="min-w-0">
                        <Link
                          href={`/dashboard/teacher/students/${selectedStudent.id}`}
                          className="text-sm font-semibold hover:underline cursor-pointer truncate block"
                        >
                          {selectedStudent.first_name}{" "}
                          {selectedStudent.last_name}
                        </Link>
                        <p className="text-xs text-muted-foreground truncate">
                          {selectedStudent.grade
                            ? `${selectedStudent.grade} - `
                            : ""}
                          {selectedStudent.student_number ?? "—"}
                        </p>
                      </div>
                    </>
                  )}
                </div>

                <Button
                  onClick={() => setAddOpen(true)}
                  className="gap-1.5 cursor-pointer shrink-0"
                >
                  <PlusIcon className="h-4 w-4" />
                  <span className="hidden sm:inline">Sonuç Ekle</span>
                </Button>
              </div>

              {/* Pill + toggle + arama */}
              <div className="flex flex-row flex-wrap gap-3">
                <div className="flex items-center gap-1 p-1 rounded-xl bg-muted w-fit">
                  {(["general", "branch", "official"] as ViewType[]).map(
                    (type) => (
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
                        {!resultsLoading && (
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
                    ),
                  )}
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

              {/* İçerik */}
              {resultsLoading ? (
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
              ) : Object.keys(grouped).length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 gap-3 text-center">
                  <ClipboardListIcon className="h-8 w-8 text-muted-foreground/30" />
                  <p className="text-sm text-muted-foreground">
                    {search
                      ? "Arama sonucu bulunamadı."
                      : view === "general"
                        ? "Henüz genel deneme sonucu bulunmuyor."
                        : view === "branch"
                          ? "Henüz branş denemesi sonucu bulunmuyor."
                          : "Henüz kurum sınavı sonucu bulunmuyor."}
                  </p>
                </div>
              ) : (
                <div className="space-y-8">
                  {Object.entries(grouped).map(
                    ([category, categoryResults]) => (
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
                          onRowClick={(result) => {
                            setSelectedResult(result);
                            setDetailOpen(true);
                          }}
                        />
                      </div>
                    ),
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <AddExamResultDialog
        open={addOpen}
        onOpenChange={setAddOpen}
        onSuccess={refetch}
        studentId={selectedStudentId ?? ""}
      />

      <ExamResultDetailDialog
        open={detailOpen}
        onOpenChange={setDetailOpen}
        result={selectedResult}
        onSuccess={refetch}
      />
    </div>
  );
}
