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
  GraduationCapIcon,
  BuildingIcon,
  ClipboardListIcon,
} from "lucide-react";
import { useState } from "react";
import { AddMemberButton } from "@/components/add-member-button";

const CATEGORY_VARIANTS: Record<
  string,
  { variant: StatCardProps["variant"]; label: string }
> = {
  TYT: { variant: "primary", label: "Ort. TYT Net" },
  "AYT-SAY": { variant: "primary", label: "Ort. AYT Sayısal" },
  "AYT-EA": { variant: "primary", label: "Ort. AYT EA" },
  "AYT-SÖZ": { variant: "primary", label: "Ort. AYT Sözel" },
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
            loading
              ? ""
              : `${stats?.studentsPerTeacher ?? 0} öğrenci / öğretmen`
          }
          icon={UserRoundIcon}
          bgIcon={UserRoundIcon}
          variant="default"
        />
        <StatCard
          title="Son 1 Ay Kurum Sınavı"
          value={loading ? "..." : (stats?.recentOfficialCount ?? 0)}
          sub="yapılan kurum sınavı"
          icon={BuildingIcon}
          bgIcon={BuildingIcon}
          variant="default"
        />
        <StatCard
          title="Son 1 Ay Deneme"
          value={loading ? "..." : (stats?.totalExamCount ?? 0)}
          sub="girilen toplam sonuç"
          icon={ClipboardListIcon}
          bgIcon={ClipboardListIcon}
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
                sub={`Kurum ${cat} ortalaması`}
                icon={SigmaIcon}
                bgIcon={SigmaIcon}
                variant={config.variant}
              />
            );
          })}

        <StatCard
          title="En Başarılı"
          value={loading ? "..." : (stats?.topStudent?.name ?? "—")}
          sub={
            loading
              ? ""
              : stats?.topStudent
                ? `${stats.topStudent.net} net`
                : "Henüz sonuç yok"
          }
          icon={TrophyIcon}
          bgIcon={TrophyIcon}
          variant="warning"
        />
        <StatCard
          title="En Çok Gelişen"
          value={loading ? "..." : (stats?.mostImproved?.name ?? "—")}
          sub={
            loading
              ? ""
              : stats?.mostImproved
                ? `+${stats.mostImproved.diff} net gelişim`
                : "Henüz yeterli veri yok"
          }
          icon={TrendingUpIcon}
          bgIcon={TrendingUpIcon}
          variant="success"
        />

        <AddMemberButton
          title="Öğrenci Ekle"
          sub="Yeni Öğrenci"
          icon={GraduationCapIcon}
          bgIcon={GraduationCapIcon}
          variant="default"
          onClick={() => setAddStudentOpen(true)}
        />
        <AddMemberButton
          title="Öğretmen Ekle"
          sub="Yeni Öğretmen"
          icon={UserRoundIcon}
          bgIcon={UserRoundIcon}
          variant="default"
          onClick={() => setAddTeacherOpen(true)}
        />
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
