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
  CalendarIcon,
  BookOpenIcon,
  SearchIcon,
  UsersIcon,
  UserXIcon,
  UserCheckIcon,
  CheckIcon,
  PlusIcon,
  LockIcon,
  LockOpenIcon,
} from "lucide-react";
import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { useExamResults } from "@/hooks/use-exam-results";
import { useGuidanceNotes } from "@/hooks/use-guidance-notes";
import { EditStudentDialog } from "@/components/edit-student-dialog";
import { DeleteStudentDialog } from "@/components/delete-student-dialog";
import { AddGuidanceNoteDialog } from "@/components/add-guidance-note-dialog";
import { EditGuidanceNoteDialog } from "@/components/edit-guidance-note-dialog";
import { useUserRole } from "@/hooks/use-user-role";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import type { GuidanceNote } from "@/hooks/use-guidance-notes";
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
  const {
    notes,
    loading: notesLoading,
    refetch: refetchNotes,
  } = useGuidanceNotes(id);
  const { userData } = useUserRole();
  const { student, loading, error, refetch } = useStudent(id);

  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<Tab>("general");
  const [examView, setExamView] = useState<ExamView>("general");
  const [showOfficial, setShowOfficial] = useState(false);
  const [examSearch, setExamSearch] = useState("");
  const [togglingActive, setTogglingActive] = useState(false);

  const [addNoteOpen, setAddNoteOpen] = useState(false);
  const [editNote, setEditNote] = useState<GuidanceNote | null>(null);
  const [deleteNoteId, setDeleteNoteId] = useState<string | null>(null);
  const [deletingNote, setDeletingNote] = useState(false);

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

  async function handleDeleteNote() {
    if (!deleteNoteId) return;
    setDeletingNote(true);
    try {
      const res = await fetch("/api/guidance-notes/delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ note_id: deleteNoteId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Bir hata oluştu.");
      toast.success("Not silindi.");
      refetchNotes();
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setDeletingNote(false);
      setDeleteNoteId(null);
    }
  }

  const CATEGORY_COLORS: Record<
    string,
    { bg: string; text: string; badge: string; meta: string }
  > = {
    Akademik: {
      bg: "bg-blue-200 dark:bg-blue-900",
      text: "text-blue-950 dark:text-blue-100",
      badge: "bg-blue-300/60 text-blue-900 dark:bg-blue-800 dark:text-blue-200",
      meta: "text-blue-700 dark:text-blue-400",
    },
    Kişisel: {
      bg: "bg-purple-200 dark:bg-purple-900",
      text: "text-purple-950 dark:text-purple-100",
      badge:
        "bg-purple-300/60 text-purple-900 dark:bg-purple-800 dark:text-purple-200",
      meta: "text-purple-700 dark:text-purple-400",
    },
    Kariyer: {
      bg: "bg-green-200 dark:bg-green-900",
      text: "text-green-950 dark:text-green-100",
      badge:
        "bg-green-300/60 text-green-900 dark:bg-green-800 dark:text-green-200",
      meta: "text-green-700 dark:text-green-400",
    },
    Aile: {
      bg: "bg-orange-200 dark:bg-orange-900",
      text: "text-orange-950 dark:text-orange-100",
      badge:
        "bg-orange-300/60 text-orange-900 dark:bg-orange-800 dark:text-orange-200",
      meta: "text-orange-700 dark:text-orange-400",
    },
    Diğer: {
      bg: "bg-amber-200 dark:bg-amber-900",
      text: "text-amber-950 dark:text-amber-100",
      badge:
        "bg-amber-300/60 text-amber-900 dark:bg-amber-800 dark:text-amber-200",
      meta: "text-amber-700 dark:text-amber-400",
    },
  };

  const DEFAULT_COLOR = {
    bg: "bg-muted",
    text: "text-foreground",
    badge: "bg-muted-foreground/20 text-foreground",
    meta: "text-muted-foreground",
  };

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

  const isTeacher = userData?.role === "teacher";

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

      {/* Profil Banner */}
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
          {[
            {
              icon: <UsersIcon className="h-3 w-3 text-muted-foreground" />,
              label: "E-posta",
              value: student.email,
            },
            {
              icon: <UsersIcon className="h-3 w-3 text-muted-foreground" />,
              label: "Sınıf",
              value: student.grade,
            },
            {
              icon: <UsersIcon className="h-3 w-3 text-muted-foreground" />,
              label: "Alan",
              value: student.branch,
            },
            {
              icon: <CalendarIcon className="h-3 w-3 text-muted-foreground" />,
              label: "Kayıt Tarihi",
              value: createdAt,
            },
          ].map((item) => (
            <div key={item.label} className="flex items-center gap-2 min-w-0">
              <div className="h-7 w-7 rounded-md bg-muted flex items-center justify-center shrink-0">
                {item.icon}
              </div>
              <div className="min-w-0">
                <p className="text-[10px] text-muted-foreground">
                  {item.label}
                </p>
                <p className="text-xs font-medium truncate">
                  {item.value || "—"}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* İçerik */}
      <div className="space-y-4">
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
          {userData?.role === "teacher" && (
            <TabButton
              active={activeTab === "notes"}
              onClick={() => setActiveTab("notes")}
            >
              Rehberlik Notları
            </TabButton>
          )}
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
              {[
                { label: "Ad", value: student.first_name },
                { label: "Soyad", value: student.last_name },
                { label: "Öğrenci No", value: student.student_number ?? "—" },
                { label: "E-posta", value: student.email ?? "—" },
                { label: "Sınıf", value: student.grade ?? "—" },
                { label: "Alan / Şube", value: student.branch ?? "—" },
                { label: "Kayıt Tarihi", value: createdAt },
                { label: "Son Giriş Tarihi", value: lastSignInAt || "—" },
              ].map((item) => (
                <div key={item.label}>
                  <p className="text-xs text-muted-foreground mb-0.5">
                    {item.label}
                  </p>
                  <p className="text-sm font-medium truncate">{item.value}</p>
                </div>
              ))}
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
              {Object.keys(grouped).length === 0 ? (
                <div className="flex items-center justify-center py-12 text-sm text-muted-foreground">
                  {examSearch
                    ? "Arama sonucu bulunamadı."
                    : examView === "general"
                      ? "Henüz genel deneme sonucu bulunmuyor."
                      : examView === "branch"
                        ? "Henüz branş denemesi sonucu bulunmuyor."
                        : "Henüz kurum sınavı sonucu bulunmuyor."}
                </div>
              ) : (
                <div className="space-y-6">
                  {Object.entries(grouped).map(([category, results]) => (
                    <div key={category} className="space-y-2">
                      <p className="text-sm font-semibold">{category}</p>
                      <ExamResultsTable
                        results={results}
                        type={examView === "official" ? "general" : examView}
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}

        {/* Rehberlik Notları Sekmesi */}
        {activeTab === "notes" && (
          <div className="space-y-4">
            {isTeacher && (
              <div className="flex justify-end">
                <Button
                  onClick={() => setAddNoteOpen(true)}
                  className="gap-1.5 cursor-pointer"
                >
                  <PlusIcon className="h-4 w-4" />
                  <span>Not Ekle</span>
                </Button>
              </div>
            )}

            {notesLoading ? (
              <div className="columns-1 sm:columns-2 lg:columns-3 gap-4">
                {[...Array(3)].map((_, i) => (
                  <div
                    key={i}
                    className="break-inside-avoid rounded-sm bg-muted animate-pulse mb-4 h-32"
                  />
                ))}
              </div>
            ) : notes.length === 0 ? (
              <div className="p-10 flex flex-col items-center gap-2 text-center border border-dashed rounded-2xl">
                <BookOpenIcon className="h-7 w-7 text-muted-foreground/30" />
                <p className="text-sm font-medium text-muted-foreground/60">
                  Henüz rehberlik notu bulunmuyor
                </p>
              </div>
            ) : (
              <div className="columns-1 sm:columns-2 lg:columns-3 gap-4">
                {notes.map((note) => {
                  const colors =
                    CATEGORY_COLORS[note.category] ?? DEFAULT_COLOR;
                  return (
                    <div
                      key={note.id}
                      className="break-inside-avoid mb-4 relative group"
                    >
                      <div
                        className={cn(
                          "relative p-5 space-y-3 rounded-l-lg rounded-tr-lg overflow-hidden",
                          colors.bg,
                          // Sağ alt köşe kıvrığı efekti
                          "before:content-[''] before:absolute before:bottom-0 before:right-0",
                          "before:w-8 before:h-8",
                          "before:border-l-16 before:border-t-16 before:border-l-transparent before:border-t-transparent",
                          "before:border-r-16 before:border-b-16 before:border-r-white/30 before:border-b-white/30",
                          "dark:before:border-r-black/20 dark:before:border-b-black/20",
                        )}
                      >
                        {/* Kart Üstü: Kategori + Gizlilik + Aksiyonlar */}
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <span
                              className={cn(
                                "text-xs font-semibold px-2 py-0.5 rounded-full",
                                colors.badge,
                              )}
                            >
                              {note.category}
                            </span>
                            <span
                              className={cn(
                                "text-[10px] flex items-center gap-1",
                                colors.meta,
                              )}
                            >
                              {note.is_private ? (
                                <LockIcon className="h-2.5 w-2.5" />
                              ) : (
                                <LockOpenIcon className="h-2.5 w-2.5" />
                              )}
                            </span>
                          </div>

                          {/* Sadece hoca için düzenle/sil butonları (hover olunca görünür) */}
                          {isTeacher && (
                            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button
                                onClick={() => setEditNote(note)}
                                className={cn(
                                  "p-1 rounded hover:bg-black/5 hover:cursor-pointer transition-colors",
                                  colors.meta,
                                )}
                              >
                                <PencilIcon className="h-3 w-3" />
                              </button>
                              <button
                                onClick={() => setDeleteNoteId(note.id)}
                                className="p-1 rounded hover:bg-destructive/10 text-destructive hover:cursor-pointer transition-colors"
                              >
                                <Trash2Icon className="h-3 w-3" />
                              </button>
                            </div>
                          )}
                        </div>

                        {/* İçerik */}
                        <p
                          className={cn(
                            "text-sm leading-relaxed whitespace-pre-wrap font-medium",
                            colors.text,
                          )}
                        >
                          {note.content}
                        </p>

                        {/* Kart Altı: Tarih + Öğretmen */}
                        <div
                          className={cn(
                            "flex items-center justify-between",
                            colors.meta,
                          )}
                        >
                          <span className="text-[10px]">
                            {new Date(note.meeting_date).toLocaleDateString(
                              "tr-TR",
                              {
                                day: "numeric",
                                month: "short",
                                year: "numeric",
                              },
                            )}
                          </span>
                          {note.teacher && (
                            <p className="text-[10px] font-semibold truncate max-w-[100px]">
                              {note.teacher.full_name}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Dialogs */}
      <AddGuidanceNoteDialog
        open={addNoteOpen}
        onOpenChange={setAddNoteOpen}
        onSuccess={refetchNotes}
        studentId={id}
      />

      {editNote && (
        <EditGuidanceNoteDialog
          open={!!editNote}
          onOpenChange={(o) => !o && setEditNote(null)}
          onSuccess={refetchNotes}
          note={editNote}
        />
      )}

      <AlertDialog
        open={!!deleteNoteId}
        onOpenChange={(o) => !o && setDeleteNoteId(null)}
      >
        <AlertDialogContent className="bg-popover ring-border">
          <AlertDialogHeader className="bg-popover">
            <AlertDialogTitle className="text-lg font-semibold">
              Notu silmek istediğinize emin misiniz?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-sm">
              Bu rehberlik notu kalıcı olarak silinecek. Bu işlem geri alınamaz.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="bg-popover">
            <AlertDialogCancel
              disabled={deletingNote}
              className="cursor-pointer"
            >
              Vazgeç
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteNote}
              disabled={deletingNote}
              className="bg-destructive/90! text-destructive-foreground hover:bg-destructive! cursor-pointer"
            >
              {deletingNote ? "Siliniyor..." : "Evet, Sil"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
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
