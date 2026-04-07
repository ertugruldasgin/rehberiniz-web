"use client";

import { useParams, useRouter } from "next/navigation";
import { useStudent } from "@/hooks/use-student";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
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
} from "lucide-react";
import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { useExamResults } from "@/hooks/use-exam-results";

type Tab = "general" | "exams" | "notes";

export default function StudentDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { student, loading, error, refetch } = useStudent(id);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<Tab>("general");
  const { results: examResults, loading: examLoading } = useExamResults(id);

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

  // Skeleton
  if (loading) {
    return (
      <div className="w-full px-4 md:px-6 py-6 md:py-8 space-y-6">
        <div className="h-8 w-32 rounded-lg bg-muted animate-pulse" />
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          <div className="rounded-2xl border bg-card p-6 space-y-4">
            <div className="flex flex-col items-center gap-3">
              <div className="h-24 w-24 rounded-2xl bg-muted animate-pulse" />
              <div className="h-5 w-36 rounded-lg bg-muted animate-pulse" />
              <div className="h-4 w-24 rounded-lg bg-muted animate-pulse" />
            </div>
          </div>
          <div className="xl:col-span-2 rounded-2xl border bg-card p-6 space-y-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-12 rounded-xl bg-muted animate-pulse" />
            ))}
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
            className="gap-1.5 cursor-pointer"
          >
            <PencilIcon className="h-3.5 w-3.5" />
            Düzenle
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setDeleteOpen(true)}
            className="gap-1.5 text-destructive hover:text-destructive hover:bg-destructive/10 border-destructive/30 cursor-pointer"
          >
            <Trash2Icon className="h-3.5 w-3.5" />
            Sil
          </Button>
        </div>
      </div>

      {/* Ana grid */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 items-start">
        {/* SOL — Profil kartı */}
        <div className="xl:col-span-1 space-y-4">
          <div className="hidden xl:block h-[42px]" />
          <div className="rounded-2xl border bg-card p-5">
            {/* Avatar + isim yan yana */}
            <div className="flex items-center gap-4">
              <Avatar className="h-16 w-16 rounded-xl ring-1 ring-border shrink-0">
                <AvatarImage
                  src={student?.avatar_url ?? ""}
                  alt={student?.first_name ?? ""}
                  className="rounded-xl"
                />
                <AvatarFallback className="rounded-xl bg-primary text-primary-foreground text-xl font-semibold">
                  {initials || "?"}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0">
                <h2 className="font-semibold text-base leading-tight truncate">
                  {student.first_name} {student.last_name}
                </h2>
                {student.email && (
                  <p className="text-xs text-muted-foreground mt-0.5 truncate">
                    {student.email}
                  </p>
                )}
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {student.grade && (
                    <Badge variant="secondary">{student.grade}</Badge>
                  )}
                  {student.branch && (
                    <Badge variant="outline">{student.branch}</Badge>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Hesap bilgileri */}
          <div className="rounded-2xl border bg-card p-4 space-y-3">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
              Hesap Bilgileri
            </p>
            <div className="space-y-3">
              {student.student_number && (
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-lg bg-muted flex items-center justify-center shrink-0">
                    <HashIcon className="h-3.5 w-3.5 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="text-[11px] text-muted-foreground">
                      Öğrenci No
                    </p>
                    <p className="text-xs font-medium">
                      {student.student_number}
                    </p>
                  </div>
                </div>
              )}
              {student.email && (
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-lg bg-muted flex items-center justify-center shrink-0">
                    <MailIcon className="h-3.5 w-3.5 text-muted-foreground" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[11px] text-muted-foreground">E-posta</p>
                    <p className="text-xs font-medium truncate">
                      {student.email}
                    </p>
                  </div>
                </div>
              )}
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-lg bg-muted flex items-center justify-center shrink-0">
                  <CalendarIcon className="h-3.5 w-3.5 text-muted-foreground" />
                </div>
                <div>
                  <p className="text-[11px] text-muted-foreground">
                    Kayıt Tarihi
                  </p>
                  <p className="text-xs font-medium">{createdAt}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* SAĞ — Tab alanı */}
        <div className="xl:col-span-2 space-y-4">
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

          {/* Tab içerikleri */}
          {activeTab === "general" && (
            <>
              {/* Genel Bilgiler */}
              <div className="rounded-2xl border bg-card p-5 sm:p-6 space-y-5">
                <div>
                  <div className="flex items-center gap-2">
                    <UserIcon className="h-4 w-4 text-muted-foreground shrink-0" />
                    <h2 className="text-sm font-semibold">Kişisel Bilgiler</h2>
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5 ml-6">
                    Öğrencinin temel kayıt bilgileri.
                  </p>
                </div>
                <Separator />

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-4">
                  <div>
                    <p className="text-xs text-muted-foreground mb-0.5">Ad</p>
                    <p className="text-sm font-medium">{student.first_name}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-0.5">
                      Soyad
                    </p>
                    <p className="text-sm font-medium">{student.last_name}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-0.5">
                      E-posta
                    </p>
                    <p className="text-sm font-medium">
                      {student.email ?? "—"}
                    </p>
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
                    <p className="text-xs text-muted-foreground mb-0.5">
                      Sınıf
                    </p>
                    <p className="text-sm font-medium">
                      {student.grade ?? "—"}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-0.5">
                      Alan / Şube
                    </p>
                    <p className="text-sm font-medium">
                      {student.branch ?? "—"}
                    </p>
                  </div>
                </div>
              </div>
            </>
          )}

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
              <ExamResultsTable results={examResults} />
            ))}

          {/* Rehberlik Notları — placeholder */}
          {activeTab === "notes" && (
            <div className="rounded-2xl border border-dashed bg-card/50 p-6 flex flex-col items-center gap-2 text-center">
              <BookOpenIcon className="h-6 w-6 text-muted-foreground/30" />
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
    </div>
  );
}

// ——————————————————————————————————————————————
// Tab butonu
// ——————————————————————————————————————————————
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
