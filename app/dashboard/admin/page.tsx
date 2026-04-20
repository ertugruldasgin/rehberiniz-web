"use client";

import { PageHeader } from "@/components/page-header";
import { StatCard, type StatCardProps } from "@/components/stat-card";
import { useDashboardStats } from "@/hooks/use-dashboard-stats";
import { AddStudentSheet } from "@/components/add-student-sheet";
import { AddTeacherDialog } from "@/components/add-teacher-sheet";
import {
  UsersIcon,
  TrendingUpIcon,
  TrophyIcon,
  SigmaIcon,
  UserRoundIcon,
  UserPlusIcon,
  GraduationCapIcon,
  PlusIcon,
} from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

const CATEGORY_VARIANTS: Record<
  string,
  { variant: StatCardProps["variant"]; label: string }
> = {
  TYT: { variant: "primary", label: "Ort. TYT Net" },
  "AYT-SAY": { variant: "primary", label: "Ort. AYT Sayısal Net" },
  "AYT-EA": { variant: "primary", label: "Ort. AYT EA Net" },
  "AYT-SÖZ": { variant: "primary", label: "Ort. AYT Sözel Net" },
  LGS: { variant: "primary", label: "Ort. LGS Net" },
  YDT: { variant: "primary", label: "Ort. YDT Net" },
};

export default function AdminDashboard() {
  const { stats, loading } = useDashboardStats();
  const [addStudentOpen, setAddStudentOpen] = useState(false);
  const [addTeacherOpen, setAddTeacherOpen] = useState(false);

  return (
    <div className="flex flex-col px-4 md:px-6 space-y-6">
      <PageHeader
        title="Genel Bakış"
        description="Kurumunuzun genel durumunu görüntüleyin."
      />

      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 items-stretch gap-4">
        {" "}
        {/* Sabit kartlar */}
        <StatCard
          title="Toplam Öğrenci"
          value={loading ? "..." : (stats?.totalStudents ?? 0)}
          sub={loading ? "" : `${stats?.inactiveStudents ?? 0} pasif hesap`}
          icon={UsersIcon}
          bgIcon={UsersIcon}
          variant="default"
        />
        <StatCard
          title="Toplam Öğretmen"
          value={loading ? "..." : (stats?.totalTeachers ?? 0)}
          sub={
            loading ? "" : `${stats?.studentsPerTeacher ?? 0} öğrenci/öğretmen`
          }
          icon={UserRoundIcon}
          bgIcon={UserRoundIcon}
          variant="default"
        />
        {/* Kategori ortalamaları — dinamik */}
        {!loading &&
          stats?.categoryAverages &&
          Object.entries(stats.categoryAverages).map(([cat, avg]) => {
            const config = CATEGORY_VARIANTS[cat];
            if (!config) return null;
            return (
              <StatCard
                key={cat}
                title={config.label}
                value={avg}
                sub={`${cat} sınavları`}
                icon={SigmaIcon}
                bgIcon={SigmaIcon}
                variant={config.variant}
              />
            );
          })}
        {/* En başarılı */}
        <StatCard
          title="En Başarılı"
          value={loading ? "..." : (stats?.topStudent?.name ?? "—")}
          sub={
            loading
              ? ""
              : stats?.topStudent
                ? `${stats.topStudent.net} Net`
                : ""
          }
          icon={TrophyIcon}
          bgIcon={TrophyIcon}
          variant="warning"
        />
        {/* En çok gelişen */}
        <StatCard
          title="En Çok Gelişen"
          value={loading ? "..." : (stats?.mostImproved?.name ?? "—")}
          sub={
            loading
              ? ""
              : stats?.mostImproved
                ? `+${stats.mostImproved.diff} Net`
                : ""
          }
          icon={TrendingUpIcon}
          bgIcon={TrendingUpIcon}
          variant="success"
        />
        {/* Hızlı öğrenci ekle */}
        <button
          type="button"
          onClick={() => setAddStudentOpen(true)}
          className={cn(
            "relative rounded-2xl px-4 py-3 flex flex-col overflow-hidden min-h-[120px]",
            "border-2 border-dashed border-border bg-card",
            "hover:border-primary/40 hover:bg-primary/5 hover:shadow-md",
            "transition-all duration-200 cursor-pointer group",
          )}
        >
          <GraduationCapIcon
            className="absolute -bottom-4 right-0 h-28 w-28 text-muted-foreground/10 group-hover:text-primary/10 transition-colors"
            strokeWidth={1}
          />
          <div className="flex items-center justify-between gap-2">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Öğrenci Ekle
            </p>
            <div className="h-7 w-7 rounded-lg flex items-center justify-center shrink-0 bg-muted group-hover:bg-primary/10 transition-colors">
              <PlusIcon className="h-3.5 w-3.5 text-muted-foreground group-hover:text-primary transition-colors" />
            </div>
          </div>
          <p className="font-bold text-foreground leading-none text-3xl md:text-4xl flex-1 flex items-center relative z-10 group-hover:text-primary transition-colors">
            Yeni Kayıt
          </p>
          <p className="text-xs text-muted-foreground min-h-4">
            Öğrenci hesabı oluştur
          </p>
        </button>
        {/* Hızlı öğretmen ekle */}
        <button
          type="button"
          onClick={() => setAddTeacherOpen(true)}
          className={cn(
            "relative rounded-2xl px-4 py-3 flex flex-col overflow-hidden min-h-[120px]",
            "border-2 border-dashed border-border bg-card",
            "hover:border-primary/40 hover:bg-primary/5 hover:shadow-md",
            "transition-all duration-200 cursor-pointer group",
          )}
        >
          <UserRoundIcon
            className="absolute -bottom-4 right-0 h-28 w-28 text-muted-foreground/10 group-hover:text-primary/10 transition-colors"
            strokeWidth={1}
          />
          <div className="flex items-center justify-between gap-2">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Öğretmen Ekle
            </p>
            <div className="h-7 w-7 rounded-lg flex items-center justify-center shrink-0 bg-muted group-hover:bg-primary/10 transition-colors">
              <PlusIcon className="h-3.5 w-3.5 text-muted-foreground group-hover:text-primary transition-colors" />
            </div>
          </div>
          <p className="font-bold text-foreground leading-none text-3xl md:text-4xl flex-1 flex items-center relative z-10 group-hover:text-primary transition-colors">
            Yeni Kayıt
          </p>
          <p className="text-xs text-muted-foreground min-h-4">
            Öğretmen hesabı oluştur
          </p>
        </button>
      </div>

      <AddStudentSheet
        open={addStudentOpen}
        onOpenChange={setAddStudentOpen}
        onSuccess={() => {}}
      />
      <AddTeacherDialog
        open={addTeacherOpen}
        onOpenChange={setAddTeacherOpen}
        onSuccess={() => {}}
      />
    </div>
  );
}
