"use client";

import { useParams, useRouter } from "next/navigation";
import { useStudent } from "@/hooks/use-student";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { ExamResultsTable } from "@/components/exam-results-table";
import {
  ArrowLeftIcon,
  PencilIcon,
  Trash2Icon,
  UserIcon,
  MailIcon,
  HashIcon,
  CalendarIcon,
  BookOpenIcon,
  SearchIcon,
  UsersIcon,
  UserXIcon,
  UserCheckIcon,
  CheckIcon,
} from "lucide-react";
import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { useExamResults } from "@/hooks/use-exam-results";
import { EditStudentDialog } from "@/components/edit-student-dialog";
import { DeleteStudentDialog } from "@/components/delete-student-dialog";
import { useUserRole } from "@/hooks/use-user-role";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";

type Tab = "general" | "exams" | "notes";
type ExamView = "general" | "branch" | "official";

function groupByCategory<T extends { category: string }>(
  items: T[],
): Record<string, T[]> {
  return items.reduce(
    (acc, r) => {
      if (!acc[r.category]) acc[r.category] = [];
      acc[r.category].push(r);
      return acc;
    },
    {} as Record<string, T[]>,
  );
}

export default function StudentDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { results: examResults, loading: examLoading } = useExamResults(id);
  const { userData } = useUserRole();
  const { student, loading, error, refetch } = useStudent(id);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<Tab>("general");
  const [examView, setExamView] = useState<ExamView>("general");
  const [showOfficial, setShowOfficial] = useState(false);
  const [examSearch, setExamSearch] = useState("");
  const [togglingActive, setTogglingActive] = useState(false);

  async function handleToggleActive() {
    if (!student) return;
    setTogglingActive(true);
    try {
      const supabase = createClient();
      const { error } = await supabase
        .from("profiles")
        .update({ is_active: !student.is_active })
        .eq("id", student.user_id);
      if (error) throw error;
      toast.success(
        student.is_active ? "Hesap pasife alındı." : "Hesap aktive edildi.",
      );
      refetch();
    } catch {
      toast.error("Bir hata oluştu.");
    } finally {
      setTogglingActive(false);
    }
  }

  const initials = student
    ? `${student.first_name[0] ?? ""}${student.last_name[0] ?? ""}`.toUpperCase()
    : "";

  const createdAt = student?.created_at
    ? new Date(student.created_at).toLocaleDateString("tr-TR", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : "";

  const lastSignInAt = student?.last_sign_in_at
    ? new Date(student.last_sign_in_at).toLocaleDateString("tr-TR", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : "";

  const generalResults = examResults.filter(
    (r) => !r.is_standalone && (showOfficial || !r.is_official),
  );
  const branchResults = examResults.filter(
    (r) => r.is_standalone && (showOfficial || !r.is_official),
  );
  const officialResults = examResults.filter((r) => r.is_official);

  const currentResults =
    examView === "general"
      ? generalResults
      : examView === "branch"
        ? branchResults
        : officialResults;

  const filteredResults = currentResults.filter((r) =>
    r.category.toLowerCase().includes(examSearch.toLowerCase()),
  );
  const grouped = groupByCategory(filteredResults);

  if (loading) {
    return (
      <div className="w-full px-4 md:px-6 py-6 md:py-8 space-y-6">
        <div className="h-8 w-32 rounded-lg bg-muted animate-pulse" />
        <div className="rounded-2xl border bg-card p-5 space-y-4">
          <div className="flex items-center gap-4">
            <div className="h-16 w-16 rounded-xl bg-muted animate-pulse shrink-0" />
            <div className="space-y-2 flex-1">
              <div className="h-5 w-40 rounded-lg bg-muted animate-pulse" />
              <div className="h-4 w-56 rounded-lg bg-muted animate-pulse" />
            </div>
          </div>
        </div>
        <div className="rounded-2xl border bg-card p-6 space-y-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-12 rounded-xl bg-muted animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (error || !student) {
    return (
      <div className="w-full px-4 md:px-6 py-6 md:py-8">
        <div className="rounded-2xl border bg-card p-8 flex flex-col items-center gap-3 text-center">
          <p className="text-sm text-muted-foreground">
            {error ?? "Öğrenci bulunamadı."}
          </p>
          <Button variant="ghost" size="sm" onClick={() => router.back()}>
            Geri dön
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full px-4 md:px-6 space-y-6">
      {/* Üst bar */}
      <div className="flex items-center justify-between gap-4">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
        >
          <ArrowLeftIcon className="h-4 w-4" />
          Öğrenciler
        </button>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setEditOpen(true)}
            className="gap-1.5 text-muted-foreground hover:text-muted-foreground hover:bg-muted-foreground/10 border-muted-foreground/30 cursor-pointer"
          >
            <PencilIcon className="h-3.5 w-3.5" />
            Düzenle
          </Button>
          <EditStudentDialog
            open={editOpen}
            onOpenChange={setEditOpen}
            onSuccess={refetch}
            student={student}
          />
          {(userData?.role === "admin" || userData?.role === "teacher") && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleToggleActive}
              disabled={togglingActive}
              className={cn(
                "gap-1.5 cursor-pointer",
                student.is_active
                  ? "text-destructive hover:text-destructive hover:bg-destructive/10 border-destructive/30"
                  : "text-green-600 hover:text-green-600 hover:bg-green-500/10 border-green-500/30",
              )}
            >
              {student.is_active ? (
                <>
                  <UserXIcon className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">Pasife Al</span>
                </>
              ) : (
                <>
                  <UserCheckIcon className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">Aktive Et</span>
                </>
              )}
            </Button>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={() => setDeleteOpen(true)}
            className="gap-1.5 text-destructive hover:text-destructive hover:bg-destructive/10 border-destructive/30 cursor-pointer"
          >
            <Trash2Icon className="h-3.5 w-3.5" />
            Sil
          </Button>
          <DeleteStudentDialog
            open={deleteOpen}
            onOpenChange={setDeleteOpen}
            studentId={id}
            studentName={`${student.first_name} ${student.last_name}`}
          />
        </div>
      </div>

      {/* Profil Banner — tam genişlik */}
      <div className="rounded-2xl border bg-card p-5 space-y-4">
        <div className="flex items-center gap-4">
          <Avatar className="h-14 w-14 rounded-xl ring-1 ring-border shrink-0">
            <AvatarImage
              src={student?.avatar_url ?? ""}
              alt={student?.first_name ?? ""}
              className="rounded-xl"
            />
            <AvatarFallback className="rounded-xl bg-primary text-primary-foreground text-xl font-semibold">
              {initials || "?"}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1">
            <div className="flex flex-row gap-2 items-center">
              <h2 className="font-semibold text-base leading-tight truncate">
                {student.first_name} {student.last_name}
              </h2>
              <span
                className={`inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full shrink-0 ${
                  student.is_active
                    ? "bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400"
                    : "bg-destructive/10 text-destructive"
                }`}
              >
                <span
                  className={`h-1.5 w-1.5 rounded-full shrink-0 ${student.is_active ? "bg-green-500" : "bg-destructive"}`}
                />
                {student.is_active ? "Aktif Hesap" : "Pasif Hesap"}
              </span>
            </div>

            {student.email && (
              <p className="text-xs text-muted-foreground mt-0.5 truncate">
                {student.student_number}
              </p>
            )}
          </div>
        </div>

        <Separator />

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-3">
          <div className="flex items-center gap-2 min-w-0">
            <div className="h-7 w-7 rounded-md bg-muted flex items-center justify-center shrink-0">
              <UsersIcon className="h-3 w-3 text-muted-foreground" />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] text-muted-foreground">E-posta</p>
              <p className="text-xs font-medium">{student.email}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 min-w-0">
            <div className="h-7 w-7 rounded-md bg-muted flex items-center justify-center shrink-0">
              <UsersIcon className="h-3 w-3 text-muted-foreground" />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] text-muted-foreground">Sınıf</p>
              <p className="text-xs font-medium">{student.grade}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 min-w-0">
            <div className="h-7 w-7 rounded-md bg-muted flex items-center justify-center shrink-0">
              <UsersIcon className="h-3 w-3 text-muted-foreground" />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] text-muted-foreground">Alan</p>
              <p className="text-xs font-medium">{student.branch}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 min-w-0">
            <div className="h-7 w-7 rounded-md bg-muted flex items-center justify-center shrink-0">
              <CalendarIcon className="h-3 w-3 text-muted-foreground" />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] text-muted-foreground">Kayıt Tarihi</p>
              <p className="text-xs font-medium">{createdAt}</p>
            </div>
          </div>
        </div>
      </div>

      {/* İçerik — tam genişlik */}
      <div className="space-y-4">
        {/* Tab başlıkları */}
        <div className="flex items-center gap-1 border-b">
          <TabButton
            active={activeTab === "general"}
            onClick={() => setActiveTab("general")}
          >
            Genel Bilgiler
          </TabButton>
          <TabButton
            active={activeTab === "exams"}
            onClick={() => setActiveTab("exams")}
          >
            Sınav Sonuçları
          </TabButton>
          <TabButton disabled>
            Rehberlik Notları
            <Badge variant="outline" className="text-[10px] py-0 px-1.5">
              Yakında
            </Badge>
          </TabButton>
        </div>

        {/* Genel Bilgiler */}
        {activeTab === "general" && (
          <div className="rounded-2xl border bg-card p-5 sm:p-6 space-y-5">
            <div className="flex items-center gap-2">
              <UserIcon className="h-4 w-4 text-muted-foreground shrink-0" />
              <h2 className="text-sm font-semibold">Kişisel Bilgiler</h2>
            </div>
            <Separator />
            <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-8 gap-y-5">
              <div>
                <p className="text-xs text-muted-foreground mb-0.5">Ad</p>
                <p className="text-sm font-medium">{student.first_name}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-0.5">Soyad</p>
                <p className="text-sm font-medium">{student.last_name}</p>
              </div>

              <div>
                <p className="text-xs text-muted-foreground mb-0.5">
                  Öğrenci No
                </p>
                <p className="text-sm font-medium">
                  {student.student_number ?? "—"}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-0.5">E-posta</p>
                <p className="text-sm font-medium truncate">
                  {student.email ?? "—"}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-0.5">Sınıf</p>
                <p className="text-sm font-medium">{student.grade ?? "—"}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-0.5">
                  Alan / Şube
                </p>
                <p className="text-sm font-medium">{student.branch ?? "—"}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-0.5">
                  Kayıt Tarihi
                </p>
                <p className="text-sm font-medium">{createdAt}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-0.5">
                  Son Giriş Tarihi
                </p>
                <p className="text-sm font-medium">{lastSignInAt || "—"}</p>
              </div>
            </div>
          </div>
        )}

        {/* Sınav Sonuçları */}
        {activeTab === "exams" &&
          (examLoading ? (
            <div className="space-y-3">
              {[...Array(3)].map((_, i) => (
                <div
                  key={i}
                  className="h-12 rounded-xl bg-muted animate-pulse"
                />
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              {/* Pill + Search */}
              <div className="flex items-center gap-3 flex-wrap">
                <div className="flex items-center gap-1 p-1 rounded-xl bg-muted shrink-0">
                  {(["general", "branch", "official"] as ExamView[]).map(
                    (type) => (
                      <button
                        key={type}
                        type="button"
                        onClick={() => {
                          setExamView(type);
                          setExamSearch("");
                        }}
                        className={cn(
                          "px-4 py-1.5 rounded-lg text-sm font-medium transition-all cursor-pointer",
                          examView === type
                            ? "bg-card text-foreground shadow-sm"
                            : "text-muted-foreground hover:text-foreground",
                        )}
                      >
                        {type === "general"
                          ? "Genel"
                          : type === "branch"
                            ? "Branş"
                            : "Kurum"}
                        <span
                          className={cn(
                            "ml-1.5 text-xs px-1.5 py-0.5 rounded-full",
                            examView === type
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

                <div className="relative flex-1 min-w-[160px] max-w-[360px]">
                  <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                  <Input
                    placeholder="Kategori ara..."
                    value={examSearch}
                    onChange={(e) => setExamSearch(e.target.value)}
                    className="pl-9 h-10 bg-card border rounded-xl"
                  />
                </div>
              </div>

              {/* İçerik */}
              {examView === "official" ? (
                Object.keys(grouped).length === 0 ? (
                  <div className="flex items-center justify-center py-12 text-sm text-muted-foreground">
                    {examSearch
                      ? "Arama sonucu bulunamadı."
                      : "Henüz kurum sınavı sonucu bulunmuyor."}
                  </div>
                ) : (
                  <div className="space-y-6">
                    {Object.entries(grouped).map(([category, results]) => (
                      <div key={category} className="space-y-2">
                        <p className="text-sm font-semibold">{category}</p>
                        <ExamResultsTable results={results} type="general" />
                      </div>
                    ))}
                  </div>
                )
              ) : Object.keys(grouped).length === 0 ? (
                <div className="flex items-center justify-center py-12 text-sm text-muted-foreground">
                  {examSearch
                    ? "Arama sonucu bulunamadı."
                    : examView === "general"
                      ? "Henüz genel deneme sonucu bulunmuyor."
                      : "Henüz branş denemesi sonucu bulunmuyor."}
                </div>
              ) : (
                <div className="space-y-6">
                  {Object.entries(grouped).map(([category, results]) => (
                    <div key={category} className="space-y-2">
                      <p className="text-sm font-semibold">{category}</p>
                      <ExamResultsTable results={results} type={examView} />
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}

        {/* Rehberlik Notları */}
        {activeTab === "notes" && (
          <div className="rounded-2xl border border-dashed bg-card/50 p-10 flex flex-col items-center gap-2 text-center">
            <BookOpenIcon className="h-7 w-7 text-muted-foreground/30" />
            <p className="text-sm font-medium text-muted-foreground/50">
              Rehberlik Notları
            </p>
            <p className="text-xs text-muted-foreground/40">
              Bu bölüm yakında eklenecek.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

function TabButton({
  active = false,
  disabled = false,
  onClick,
  children,
}: {
  active?: boolean;
  disabled?: boolean;
  onClick?: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      disabled={disabled}
      onClick={onClick}
      className={cn(
        "px-4 py-2.5 text-sm font-medium -mb-px flex items-center gap-1.5 transition-colors",
        active && "text-primary border-b-2 border-primary cursor-pointer",
        !active &&
          !disabled &&
          "text-muted-foreground hover:text-foreground cursor-pointer",
        disabled && "text-muted-foreground/50 cursor-not-allowed",
      )}
    >
      {children}
    </button>
  );
}
