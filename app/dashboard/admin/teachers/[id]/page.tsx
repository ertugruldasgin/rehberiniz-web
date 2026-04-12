"use client";

import { useParams, useRouter } from "next/navigation";
import { useTeacher } from "@/hooks/use-teacher";
import { useStudents } from "@/hooks/use-students";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  ArrowLeftIcon,
  MailIcon,
  CalendarIcon,
  UsersIcon,
  AlertCircleIcon,
  Clock,
  PencilIcon,
  Trash2Icon,
  UserXIcon,
  UserCheckIcon,
} from "lucide-react";
import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { StudentsTable } from "@/components/students-table";
import { AddStudentSheet } from "@/components/add-student-sheet";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { EditTeacherDialog } from "@/components/edit-teacher-dialog";
import { DeleteTeacherDialog } from "@/components/delete-teacher-dialog";

type Tab = "students";

export default function TeacherDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { teacher, loading, error, refetch } = useTeacher(id);
  const {
    students,
    loading: studentsLoading,
    refetch: refetchStudents,
  } = useStudents(id);
  const [activeTab, setActiveTab] = useState<Tab>("students");
  const [sheetOpen, setSheetOpen] = useState(false);
  const [togglingActive, setTogglingActive] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [editName, setEditName] = useState("");
  const [editTitle, setEditTitle] = useState("");
  const [saving, setSaving] = useState(false);

  const initials = teacher
    ? teacher.full_name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "";

  const createdAt = teacher?.created_at
    ? new Date(teacher.created_at).toLocaleDateString("tr-TR", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : "";

  const lastSignInAt = teacher?.last_sign_in_at
    ? new Date(teacher.last_sign_in_at).toLocaleDateString("tr-TR", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : "";

  async function handleToggleActive() {
    if (!teacher) return;
    setTogglingActive(true);
    try {
      const supabase = createClient();
      const { error } = await supabase
        .from("profiles")
        .update({ is_active: !teacher.is_active })
        .eq("id", teacher.user_id);
      if (error) throw error;
      toast.success(
        teacher.is_active ? "Hesap pasife alındı." : "Hesap aktive edildi.",
      );
      refetch();
    } catch {
      toast.error("Bir hata oluştu.");
    } finally {
      setTogglingActive(false);
    }
  }

  async function handleDelete() {
    setDeleting(true);
    try {
      const res = await fetch("/api/teachers/delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ teacher_member_id: id }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Bir hata oluştu.");
      toast.success("Öğretmen silindi.");
      router.back();
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setDeleting(false);
      setDeleteOpen(false);
    }
  }

  async function handleEdit() {
    if (!editName.trim()) {
      toast.error("Ad Soyad boş bırakılamaz.");
      return;
    }
    setSaving(true);
    try {
      const supabase = createClient();
      const { error } = await supabase
        .from("profiles")
        .update({ full_name: editName.trim(), title: editTitle.trim() || null })
        .eq("id", teacher!.user_id);
      if (error) throw error;
      toast.success("Bilgiler güncellendi.");
      refetch();
      setEditOpen(false);
    } catch {
      toast.error("Bir hata oluştu.");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="w-full px-4 md:px-6 py-6 space-y-6">
        <div className="h-8 w-32 rounded-lg bg-muted animate-pulse" />
        <div className="rounded-2xl border bg-card p-5 space-y-4">
          <div className="flex items-center gap-4">
            <div className="h-14 w-14 rounded-xl bg-muted animate-pulse shrink-0" />
            <div className="space-y-2 flex-1">
              <div className="h-5 w-40 rounded-lg bg-muted animate-pulse" />
              <div className="h-4 w-56 rounded-lg bg-muted animate-pulse" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !teacher) {
    return (
      <div className="w-full px-4 md:px-6 py-6">
        <div className="rounded-2xl border bg-card p-8 flex flex-col items-center gap-3 text-center">
          <AlertCircleIcon className="h-8 w-8 text-destructive" />
          <p className="text-sm text-muted-foreground">
            {error ?? "Öğretmen bulunamadı."}
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
          className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors cursor-pointer shrink-0"
        >
          <ArrowLeftIcon className="h-4 w-4" />
          <span className="hidden sm:inline">Öğretmenler</span>
        </button>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setEditOpen(true)}
            className="gap-1.5 text-muted-foreground hover:text-muted-foreground hover:bg-muted-foreground/10 border-muted-foreground/30 cursor-pointer"
          >
            <PencilIcon className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Düzenle</span>
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={handleToggleActive}
            disabled={togglingActive}
            className={cn(
              "gap-1.5 cursor-pointer",
              teacher.is_active
                ? "text-destructive hover:text-destructive hover:bg-destructive/10 border-destructive/30"
                : "text-green-600 hover:text-green-600 hover:bg-green-500/10 border-green-500/30",
            )}
          >
            {teacher.is_active ? (
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

          <Button
            variant="outline"
            size="sm"
            onClick={() => setDeleteOpen(true)}
            className="gap-1.5 text-destructive hover:text-destructive hover:bg-destructive/10 border-destructive/30 cursor-pointer"
          >
            <Trash2Icon className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Sil</span>
          </Button>
        </div>
      </div>

      {/* Profil Banner */}
      <div className="rounded-2xl border bg-card p-5 space-y-4">
        <div className="flex items-center gap-4">
          <Avatar className="h-14 w-14 rounded-xl ring-1 ring-border shrink-0">
            <AvatarImage
              src={teacher.avatar_url ?? ""}
              alt={teacher.full_name}
              className="rounded-xl"
            />
            <AvatarFallback className="rounded-xl bg-primary text-primary-foreground text-lg font-semibold">
              {initials || "?"}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1">
            <div className="flex flex-row gap-2 items-center">
              <h2 className="font-semibold text-base leading-tight truncate">
                {teacher.full_name}
              </h2>
              <span
                className={`inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full shrink-0 ${
                  teacher.is_active
                    ? "bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400"
                    : "bg-destructive/10 text-destructive"
                }`}
              >
                <span
                  className={`h-1.5 w-1.5 rounded-full shrink-0 ${teacher.is_active ? "bg-green-500" : "bg-destructive"}`}
                />
                {teacher.is_active ? "Aktif Hesap" : "Pasif Hesap"}
              </span>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5 truncate">
              {teacher.title ?? "Unvan belirtilmemiş"}
            </p>
          </div>
        </div>

        <Separator />

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-3">
          {teacher.email && (
            <div className="flex items-center gap-2 min-w-0">
              <div className="h-7 w-7 rounded-md bg-muted flex items-center justify-center shrink-0">
                <MailIcon className="h-3 w-3 text-muted-foreground" />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] text-muted-foreground">E-posta</p>
                <p className="text-xs font-medium truncate">{teacher.email}</p>
              </div>
            </div>
          )}
          <div className="flex items-center gap-2 min-w-0">
            <div className="h-7 w-7 rounded-md bg-muted flex items-center justify-center shrink-0">
              <UsersIcon className="h-3 w-3 text-muted-foreground" />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] text-muted-foreground">
                Öğrenci Sayısı
              </p>
              <p className="text-xs font-medium">{students.length} öğrenci</p>
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
          <div className="flex items-center gap-2 min-w-0">
            <div className="h-7 w-7 rounded-md bg-muted flex items-center justify-center shrink-0">
              <Clock className="h-3 w-3 text-muted-foreground" />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] text-muted-foreground">Son Giriş</p>
              <p className="text-xs font-medium">{lastSignInAt || "—"}</p>
            </div>
          </div>
        </div>
      </div>

      {/* İçerik */}
      <div className="space-y-4">
        <div className="flex items-center gap-1 border-b">
          <TabButton
            active={activeTab === "students"}
            onClick={() => setActiveTab("students")}
          >
            Öğrenciler
          </TabButton>
        </div>

        {activeTab === "students" &&
          (studentsLoading ? (
            <div className="space-y-3">
              {[...Array(3)].map((_, i) => (
                <div
                  key={i}
                  className="h-12 rounded-xl bg-muted animate-pulse"
                />
              ))}
            </div>
          ) : (
            <>
              <StudentsTable
                students={students}
                routePrefix="/dashboard/admin"
                onAddStudent={() => setSheetOpen(true)}
              />
              <AddStudentSheet
                open={sheetOpen}
                onOpenChange={setSheetOpen}
                onSuccess={refetchStudents}
                defaultTeacherId={id}
              />
            </>
          ))}
      </div>

      <EditTeacherDialog
        open={editOpen}
        onOpenChange={setEditOpen}
        onSuccess={refetch}
        teacher={teacher}
      />

      <DeleteTeacherDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        teacherMemberId={id}
        teacherName={teacher.full_name}
      />
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
        "px-4 py-2.5 text-sm font-medium -mb-px flex items-center gap-1.5 transition-colors shrink-0",
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
